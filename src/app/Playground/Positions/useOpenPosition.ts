import { Address, erc20Abi, parseEther } from "viem";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { CHAIN_PAYMASTER_URL, testErc20Address } from "~/config";
import { mockPerp } from "./abi/mockPerp";
import { useAccount, useSwitchChain } from "wagmi";

export function useOpenPosition(
  perpAddress: Address,
  perpChainId: number,
  permissionsContext: string
) {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const { writeContractsAsync, data: id, isPending } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
      structuralSharing: false
    },
  });

  const openPosition = async (amount: bigint) => {
    const capabilities = permissionsContext
      ? {
          paymasterService: {
            url: CHAIN_PAYMASTER_URL[perpChainId],
          },
          permissions: {
            sessionId: permissionsContext,
          },
        }
      : undefined;

    if (chainId !== perpChainId) {
      await switchChainAsync({ chainId: perpChainId });
    }

    await writeContractsAsync({
      contracts: [
        {
          address: testErc20Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [perpAddress, amount],
        },
        {
          abi: mockPerp,
          address: perpAddress,
          functionName: "openPosition",
          args: [amount],
        },
      ],
      capabilities,
    });
  };

  return {
    openPosition,
    pending: isPending || callsStatus?.status === "PENDING",
  };
}
