"use client";

import { usePaymasterRegistered } from "./usePaymasterRegistered";
import { CONFIG } from "~/config";
import { useSmartAccount } from "~/app/useSmartAccount";
import { EnableCABSupportedToken } from "@zerodev/cab";

export function SmartAccount(): JSX.Element {
  const { cabClient } = useSmartAccount();

  const registered = usePaymasterRegistered();

  const enabled = false;

  if (!enabled) {
    return (
      <button
        className="bg-purple-400 disabled:opacity-60"
        onClick={() => {
          if (!cabClient) {
            return;
          }

          cabClient.enableCAB({
            tokens: [
              {
                name: CONFIG.cabToken,
                networks: CONFIG.chains.map(
                  ({ chain }) => chain.id
                ) as EnableCABSupportedToken["networks"],
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
      Smart account: {cabClient?.account?.address ?? "-"}
      <br />
      Registered: {registered ? "true" : "false"}
    </div>
  );
}
