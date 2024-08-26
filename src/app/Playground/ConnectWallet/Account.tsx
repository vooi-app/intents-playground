"use client";

import { useDisconnect } from "wagmi";
import { useEoaAddress } from "../useEoaAddress";

export function Account() {
  const { address } = useEoaAddress();
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
