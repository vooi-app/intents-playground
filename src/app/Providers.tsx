"use client";

import {
  QueryClient,
  QueryClientProvider,
  replaceEqualDeep,
} from "@tanstack/react-query";
import { baseSepolia, optimismSepolia, sepolia } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { wrapEOAConnector } from "@magic-account/wagmi";
import { useState } from "react";

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

  const [config] = useState(() =>
    createConfig({
      chains: [optimismSepolia, sepolia],
      transports: {
        [optimismSepolia.id]: http(),
        [sepolia.id]: http(),
      },
      connectors: [wrapEOAConnector(injected())],
      multiInjectedProviderDiscovery: false,
    })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
