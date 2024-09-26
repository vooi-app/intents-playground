import { useQuery } from "@tanstack/react-query";
import { useCreateIncreasePosition } from "./useCreateIncreasePosition";
import { useAccount, useReadContract } from "wagmi";
import { perpView } from "./abi/perpView";
import { parseUnits } from "viem";
import { useState } from "react";

interface Symbol {
  symbol: string;
  name: string;
  base: string;
  quote: string;
  decimal: number;
  quoteDecimal: number;
  priceDecimal: number;
  isHot: boolean;
  defaultLeverage: number;
  sort: number;
  id: number;
  pythid: string;
  created: string;
  tags: string;
}

const PERP_VIEW_ADDRESS = "0x92A381C496eeE6C4686A4169aFf4aF94eAfeAFCc";

export function Kiloex(): JSX.Element {
  const { address } = useAccount();

  const [openAmount, setOpenAmount] = useState("1");

  const { data: symbols } = useQuery({
    queryKey: ["symbols"],
    queryFn: async (): Promise<Symbol[]> => {
      const response = await fetch(
        "https://app.kiloex.io/backendstatic/bnb/symbols.json"
      );

      return response.json();
    },
  });

  const symbol = symbols?.find(({ symbol }) => symbol === "ETHTUSD");

  const { data } = useReadContract({
    abi: perpView,
    address: PERP_VIEW_ADDRESS,
    functionName: "getPositions",
    args: [address!, [BigInt(symbol!.id)]],
  });

  const createIncreasePosition = useCreateIncreasePosition();

  return (
    <div className="flex flex-col gap-1 items-start">
      Kiloex
      <br />
      {/* Position: {position !== undefined ? formatUnits(position, 6) : "-"} */}
      <div className="flex gap-1">
        <button
          className="bg-green-400 disabled:opacity-60"
          // disabled={openPositionPending}
          onClick={async () => {
            if (!symbol) {
              return;
            }

            if (Number.isNaN(Number(openAmount))) {
              return;
            }

            const amount = parseUnits(openAmount, 6);

            createIncreasePosition({
              id: symbol.id,
              amount: "1",
              isLong: true,
              leverage: symbol.defaultLeverage,
            });
          }}
        >
          Open
        </button>

        <input
          className="border-gray-400 border-solid border"
          value={openAmount}
          onChange={async ({ target: { value } }) => {
            setOpenAmount(value);
          }}
        />
      </div>
      <button
        className="bg-red-400 disabled:opacity-60"
        // disabled={closePositionPending}
        onClick={() => {
          // closePosition();
        }}
      >
        Close
      </button>
    </div>
  );
}
