"use client";

import { useConnect } from "wagmi";

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return connectors.map((connector) => (
    <button
      key={connector.uid}
      className="bg-blue-400"
      onClick={() => {
        connect({ connector });
      }}
    >
      {connector.name}
    </button>
  ));
}
