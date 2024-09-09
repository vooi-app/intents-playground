import { Address, erc20Abi } from "viem";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { CONFIG } from "~/config";
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
    },
  });

  const openPosition = async (amount: bigint) => {
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
          address: chainConfig.usdTokenAddress,
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
