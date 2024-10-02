"use client";

import { usePaymasterRegistered } from "./usePaymasterRegistered";
import { useEffect, useState } from "react";
import { useSmartAccount } from "~/components/SmartAccountProvider";
import { EnableSmartAccountButton } from "./EnableSmartAccountButton";

export function SmartAccount(): JSX.Element {
  const { cabClient } = useSmartAccount();

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!cabClient) {
      return;
    }

    cabClient.getEnabledChains().then(({ isEnabledOnCurrentChain }) => {
      setEnabled(isEnabledOnCurrentChain);
    });
  }, [cabClient]);

  const registered = usePaymasterRegistered();

  if (!enabled) {
    return <EnableSmartAccountButton />;
  }

  return (
    <div>
      Smart account: {cabClient?.account?.address ?? "-"}
      <br />
      Registered: {registered ? "true" : "false"}
    </div>
  );
}
