import { erc20Abi, parseAbi, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import {
  CHAIN_PAYMASTER_URL,
  testErc20Address,
  testErc20VaultAddress,
  vaultManagerAddress,
} from "~/config";
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

    const paymasterUrl = CHAIN_PAYMASTER_URL[chainId];
    if (!paymasterUrl) {
      return;
    }

    const amount = parseUnits("1000", 6);

    writeContracts({
      contracts: [
        {
          address: testErc20Address,
          abi: parseAbi(["function mint(address,uint256)"]),
          functionName: "mint",
          args: [address, amount],
        },
        {
          address: testErc20Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [vaultManagerAddress, amount],
        },
        {
          address: vaultManagerAddress,
          abi: vaultManager,
          functionName: "deposit",
          args: [testErc20Address, testErc20VaultAddress, amount, false],
        },
      ],
      capabilities: {
        paymasterService: {
          url: paymasterUrl,
        },
      },
    });
  };

  return {
    mint,
    pending: isPending || callsStatus?.status === "PENDING",
  };
}
