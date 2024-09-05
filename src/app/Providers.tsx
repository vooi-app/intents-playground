"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia, optimismSepolia } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { wrapEOAConnector } from "@magic-account/wagmi";
import { useState } from "react";

interface Props {
  children?: React.ReactNode;
}

export function Providers({ children }: Props): JSX.Element {
  const [queryClient] = useState(() => new QueryClient());

  const [config] = useState(() =>
    createConfig({
      chains: [optimismSepolia, baseSepolia],
      transports: {
        [optimismSepolia.id]: http(),
        [baseSepolia.id]: http(),
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
