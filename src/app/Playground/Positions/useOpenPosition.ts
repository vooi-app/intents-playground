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

  const openPosition = (amount: bigint) => {
    writeContractsAsync({
      contracts: [
        {
          address: testErc20Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [mockPerpAddress, amount],
        },
        {
          abi: mockPerp,
          address: mockPerpAddress,
          functionName: "openPosition",
          args: [amount],
        },
      ],
    });
  };

  return {
    openPosition,
    pending: callsStatus?.status === "PENDING",
  };
}
