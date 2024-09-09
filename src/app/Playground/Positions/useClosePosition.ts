import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { mockPerp } from "./abi/mockPerp";
import { Address } from "viem";
import { CONFIG } from "~/config";
import { useAccount, useSwitchChain } from "wagmi";

export function useClosePosition(
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
    },
  });

  const closePosition = async () => {
    const chainConfig = CONFIG.chains.find(({ chain }) => chain.id === chainId);
    if (!chainConfig) {
      return;
    }

    const capabilities = permissionsContext
      ? {
          paymasterService: {
            url: chainConfig.payMasterURL,
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
    pending: isPending || callsStatus?.status === "PENDING",
  };
}
