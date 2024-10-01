"use client";

import {
  QueryClient,
  QueryClientProvider,
  replaceEqualDeep,
} from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState } from "react";
import { CONFIG } from "~/config";
import { Chain, Transport } from "viem";
import { SmartAccountProvider } from "./SmartAccountProvider";

interface Props {
  children?: React.ReactNode;
}

export function Providers({ children }: Props): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            structuralSharing(prevData, data) {
              return replaceEqualDeep(prevData, data);
            },
          },
        },
      })
  );

  const [config] = useState(() => {
    const transports: Record<number, Transport> = {};

    CONFIG.chains.forEach(({ chain }) => {
      transports[chain.id] = http();
    });

    return createConfig({
      chains: CONFIG.chains.map(({ chain }) => chain) as [Chain, ...Chain[]],
      transports,
      connectors: [injected()],
      multiInjectedProviderDiscovery: false,
    });
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SmartAccountProvider>{children}</SmartAccountProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
