import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { mockPerpAddress } from "~/config";
import { mockPerp } from "./abi/mockPerp";

export function useClosePosition() {
  const { writeContractsAsync, data: id, error } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
    },
  });

  console.log(error, callsStatus);

  const closePosition = () => {
    writeContractsAsync({
      contracts: [
        {
          abi: mockPerp,
          address: mockPerpAddress,
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
