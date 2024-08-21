import { erc20Abi, parseEther } from "viem";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { mockPerpAddress, testErc20Address } from "~/config";
import { mockPerp } from "./abi/mockPerp";

export function useOpenPosition() {
  const { writeContractsAsync, data: id } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
    },
  });

  const openPosition = () => {
    writeContractsAsync({
      contracts: [
        {
          address: testErc20Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [mockPerpAddress, parseEther("0.001")],
        },
        {
          abi: mockPerp,
          address: mockPerpAddress,
          functionName: "openPosition",
          args: [parseEther("0.001")],
        },
      ],
    });
  };

  return {
    openPosition,
    pending: callsStatus?.status === "PENDING",
  };
}
