import { erc20Abi, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import {
  CHAIN_PAYMASTER_URL,
  testErc20Address,
  testErc20VaultAddress,
  vaultManagerAddress,
} from "~/config";
import { vaultManager } from "./abi/vaultManager";

export function useTransfer() {
  const { chainId } = useAccount();

  const { writeContracts, data: id, isPending } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
    },
  });

  const transfer = () => {
    if (chainId === undefined) {
      return;
    }

    const paymasterUrl = CHAIN_PAYMASTER_URL[chainId];
    if (!paymasterUrl) {
      return;
    }

    const amount = parseEther("0.3");

    writeContracts({
      contracts: [
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
    transfer,
    pending: isPending || callsStatus?.status === "PENDING",
  };
}
