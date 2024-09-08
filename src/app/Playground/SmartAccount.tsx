"use client";

import { useEnableCab, useReadCab } from "@magic-account/wagmi";
import { baseSepolia, optimismSepolia, sepolia } from "viem/chains";
import { useAccount } from "wagmi";
import { usePaymasterRegistered } from "./usePaymasterRegistered/usePaymasterRegistered";

interface Props {}

export function SmartAccount({}: Props): JSX.Element {
  const { address } = useAccount();
  const { refetch } = useReadCab();

  const { isRegistered } = usePaymasterRegistered();

  const { enableCab, isEnabledOnCurrentChain, isPending } = useEnableCab({
    onSuccess() {
      refetch();
    },
  });

  const enabled = isEnabledOnCurrentChain("6TEST");

  if (enabled) {
    return (
      <div>
        Smart account: {address}
        <br />
        Registered: {isRegistered ? "true" : "false"}
      </div>
    );
  }

  return (
    <button
      className="bg-purple-400 disabled:opacity-60"
      disabled={isPending}
      onClick={() => {
        enableCab({
          tokens: [
            { name: "6TEST", networks: [optimismSepolia.id, sepolia.id] },
          ],
        });
      }}
    >
      Enable Smart account
    </button>
  );
}
