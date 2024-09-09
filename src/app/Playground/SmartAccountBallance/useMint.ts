import { erc20Abi, parseAbi, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { CONFIG, VAULT_MANAGER_ADDRESS } from "~/config";
import { vaultManager } from "./abi/vaultManager";

export function useMint() {
  const { address, chainId } = useAccount();

  const { writeContracts, data: id, isPending } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
    },
  });

  const mint = () => {
    if (chainId === undefined) {
      return;
    }

    const chainConfig = CONFIG.chains.find(({ chain }) => chain.id === chainId);
    if (!chainConfig) {
      return;
    }

    const amount = parseUnits("1000", chainConfig.usdTokenDecimals);

    writeContracts({
      contracts: [
        {
          address: chainConfig.usdTokenAddress,
          abi: parseAbi(["function mint(address,uint256)"]),
          functionName: "mint",
          args: [address, amount],
        },
        {
          address: chainConfig.usdTokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [VAULT_MANAGER_ADDRESS, amount],
        },
        {
          address: VAULT_MANAGER_ADDRESS,
          abi: vaultManager,
          functionName: "deposit",
          args: [
            chainConfig.usdTokenAddress,
            chainConfig.vaultAddress,
            amount,
            false,
          ],
        },
      ],
      capabilities: {
        paymasterService: {
          url: chainConfig.payMasterURL,
        },
      },
    });
  };

  return {
    mint,
    pending: isPending || callsStatus?.status === "PENDING",
  };
}
