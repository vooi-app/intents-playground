import { erc20Abi, parseUnits } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CONFIG } from "~/config";
import { useSmartAccount } from "~/components/SmartAccountProvider";

export const TRANSFER_AMOUNT = 5;

export function useTransfer() {
  const { cabClient } = useSmartAccount();

  const { chainId } = useAccount();

  const { data: hash, isPending, writeContract } = useWriteContract();

  const { isLoading } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = async () => {
    if (!cabClient?.account?.address) {
      return;
    }

    if (chainId === undefined) {
      return;
    }

    const chainConfig = CONFIG.chains.find(({ chain }) => chain.id === chainId);
    if (!chainConfig) {
      return;
    }

    const amount = parseUnits(
      TRANSFER_AMOUNT.toString(),
      chainConfig.usdTokenDecimals,
    );

    writeContract({
      address: chainConfig.usdTokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [cabClient.account.address, amount],
    });
  };

  return {
    transfer,
    pending: isPending || isLoading,
  };
}
