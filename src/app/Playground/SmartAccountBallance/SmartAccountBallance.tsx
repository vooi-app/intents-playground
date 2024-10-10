"use client";

import { formatUnits } from "viem";
import { useMint } from "./useMint";
import { useTransfer, TRANSFER_AMOUNT } from "./useTransfer";
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
        {CONFIG.cabToken === "6TEST" && (
          <button
            className="bg-yellow-400 disabled:opacity-60"
            disabled={mintPending}
            onClick={() => {
              mint();
            }}
          >
            Mint
          </button>
        )}

        <button
          className="bg-yellow-400 disabled:opacity-60"
          disabled={transferPending}
          onClick={() => {
            transfer();
          }}
        >
          Transfer {TRANSFER_AMOUNT} USDC
        </button>
      </div>
    </div>
  );
}
