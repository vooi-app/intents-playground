"use client";

import { formatUnits } from "viem";
import { useMint } from "./useMint";
import { useTransfer } from "./useTransfer";
import { useCabBalance } from "./useCabBalance";
import { CONFIG } from "~/config";

export function SmartAccountBallance(): JSX.Element {
  const balance = useCabBalance();

  const { mint, pending: mintPending } = useMint();
  const { transfer, pending: transferPending } = useTransfer();

  return (
    <div>
      <div>
        CAB:{" "}
        {balance !== undefined
          ? formatUnits(balance, CONFIG.cabTokenDecimals)
          : "-"}
      </div>

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
