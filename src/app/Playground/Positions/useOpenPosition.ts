import { Address, erc20Abi, parseEther } from "viem";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { testErc20Address } from "~/config";
import { mockPerp } from "./abi/mockPerp";

export function useOpenPosition(perpAddress: Address) {
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
          args: [perpAddress, amount],
        },
        {
          abi: mockPerp,
          address: perpAddress,
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
