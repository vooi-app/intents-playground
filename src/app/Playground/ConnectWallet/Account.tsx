"use client";

import { useAccount, useDisconnect } from "wagmi";

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div>
      <div>EOA Wallet: {address}</div>
      <button
        className="bg-stone-400"
        onClick={() => {
          disconnect();
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
