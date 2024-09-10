import { useCallback } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { invoiceManagerAbi } from "./abi/invoiceManagerAbi";
import { Address, isAddressEqual, zeroAddress } from "viem";
import {
  CAB_PAYMASTER_ADDRESS,
  CONFIG,
  INVOICE_MANAGER_ADDRESS,
} from "~/config";

export function usePaymasterRegistered() {
  const { address } = useAccount();

  const { data } = useReadContracts({
    contracts: CONFIG.chains.map(({ chain }) => ({
      address: INVOICE_MANAGER_ADDRESS,
      abi: invoiceManagerAbi,
      functionName: "cabPaymasters",
      args: [address ?? "0x"],
      chainId: chain.id,
    })),
    query: {
      refetchInterval: useCallback(({ state: { data } }: any) => {
        return isRegistered(data) ? false : 5000;
      }, []),
    },
  });

  return isRegistered(data as any);
}

function isRegistered(data: { result: [Address] }[]) {
  return !!data?.every(({ result }) =>
    isAddressEqual(
      (result as unknown as Address[] | undefined)?.[0] || zeroAddress,
      CAB_PAYMASTER_ADDRESS
    )
  );
}
