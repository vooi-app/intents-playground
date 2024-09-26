"use client";

import { useReadCab } from "@magic-account/wagmi";
import { formatUnits } from "viem";
import { useMint } from "./useMint";
import { useTransfer } from "./useTransfer2";

export function SmartAccountBallance(): JSX.Element {
  const { data: balance } = useReadCab();

  console.log(balance);

  const { mint, pending: mintPending } = useMint();
  const { transfer, pending: transferPending } = useTransfer();

  return (
    <div>
      <div>CAB: {balance !== undefined ? formatUnits(balance, 6) : "-"}</div>

      <div className="flex gap-1">
        <button
          className="bg-yellow-400 disabled:opacity-60"
          disabled={mintPending}
          onClick={() => {
            mint();
          }}
        >
          Mint
        </button>

        <button
          className="bg-yellow-400 disabled:opacity-60"
          disabled={transferPending}
          onClick={() => {
            transfer();
          }}
        >
          Transfer
        </button>
      </div>
    </div>
  );
}
