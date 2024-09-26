import { erc20Abi, parseUnits } from "viem";
import {
  useAccount,
  useClient,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { vaultManager } from "./abi/vaultManager";
import { CONFIG, VAULT_MANAGER_ADDRESS } from "~/config";

export function useTransfer() {
  const { chainId } = useAccount();

  const client = usePublicClient();

  // const { writeContracts, data: id, isPending } = useWriteContracts();

  // const { data: callsStatus } = useCallsStatus({
  //   id: id!,
  //   query: {
  //     enabled: !!id,
  //     refetchInterval: (data) =>
  //       data.state.data?.status === "CONFIRMED" ? false : 2000,
  //   },
  // });

  const { writeContractAsync } = useWriteContract();

  const transfer = async () => {
    if (chainId === undefined) {
      return;
    }

    const chainConfig = CONFIG.chains.find(({ chain }) => chain.id === chainId);
    if (!chainConfig) {
      return;
    }

    const amount = parseUnits("1", chainConfig.usdTokenDecimals);

    const hash = await writeContractAsync({
      address: chainConfig.usdTokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: ["0x2bc3cA334C6A6ba755e9eECb40eCB65887D150ef", amount],
    });

    // const hash = await writeContractAsync({
    //   address: chainConfig.usdTokenAddress,
    //   abi: erc20Abi,
    //   functionName: "approve",
    //   args: [VAULT_MANAGER_ADDRESS, amount],
    // });

    await client!.waitForTransactionReceipt({ hash });

    // await writeContractAsync({
    //   address: VAULT_MANAGER_ADDRESS,
    //   abi: vaultManager,
    //   functionName: "deposit",
    //   args: [
    //     chainConfig.usdTokenAddress,
    //     chainConfig.vaultAddress,
    //     amount,
    //     false,
    //   ],
    // });
  };

  return {
    transfer,
    pending: false,
  };
}
