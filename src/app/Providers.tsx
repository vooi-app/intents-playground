"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia, optimismSepolia } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { wrapEOAConnector } from "@build-with-yi/wagmi";

interface Props {
  children?: React.ReactNode;
}

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [optimismSepolia, baseSepolia],
  transports: {
    [optimismSepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [wrapEOAConnector(injected())],
  multiInjectedProviderDiscovery: false,
});

export function Providers({ children }: Props): JSX.Element {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
