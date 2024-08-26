import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { mockPerp } from "./abi/mockPerp";
import { Address } from "viem";

export function useClosePosition(perpAddress: Address) {
  const { writeContractsAsync, data: id } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
    },
  });

  const closePosition = () => {
    writeContractsAsync({
      contracts: [
        {
          abi: mockPerp,
          address: perpAddress,
          functionName: "closePosition",
        },
      ],
    });
  };

  return {
    closePosition,
    pending: callsStatus?.status === "PENDING",
  };
}
