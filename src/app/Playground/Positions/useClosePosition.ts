import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { mockPerp } from "./abi/mockPerp";
import { Address } from "viem";
import { CHAIN_PAYMASTER_URL } from "~/config";
import { useAccount, useSwitchChain } from "wagmi";

export function useClosePosition(
  perpAddress: Address,
  perpChainId: number,
  permissionsContext: string
) {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const { writeContractsAsync, data: id } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
      structuralSharing: false
    },
  });

  const closePosition = async () => {
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
          abi: mockPerp,
          address: perpAddress,
          functionName: "closePosition",
        },
      ],
      capabilities,
    });
  };

  return {
    closePosition,
    pending: callsStatus?.status === "PENDING",
  };
}
