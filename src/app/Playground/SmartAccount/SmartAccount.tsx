"use client";

import { useEnableCab, useReadCab } from "@magic-account/wagmi";
import { useAccount } from "wagmi";
import { usePaymasterRegistered } from "./usePaymasterRegistered";
import { CONFIG } from "~/config";

export type NonEmptyArray<T> = [T, ...T[]];

export type CABSupportedNetworks = NonEmptyArray<
  10 | 56 | 137 | 8453 | 42161 | 80002 | 11155420 | 84532 | 421614 | 11155111
>;

export function SmartAccount(): JSX.Element {
  const { address } = useAccount();
  const { refetch } = useReadCab();

  const registered = usePaymasterRegistered();

  const { enableCab, isEnabledOnCurrentChain, isPending } = useEnableCab({
    onSuccess() {
      refetch();
    },
  });

  const enabled = isEnabledOnCurrentChain(CONFIG.cabToken);

  if (!enabled) {
    return (
      <button
        className="bg-purple-400 disabled:opacity-60"
        disabled={isPending}
        onClick={() => {
          enableCab({
            tokens: [
              {
                name: CONFIG.cabToken,
                networks: CONFIG.chains.map(
                  ({ chain }) => chain.id
                ) as CABSupportedNetworks,
              },
            ],
          });
        }}
      >
        Enable Smart account
      </button>
    );
  }

  return (
    <div>
      Smart account: {address}
      <br />
      Registered: {registered ? "true" : "false"}
    </div>
  );
}
