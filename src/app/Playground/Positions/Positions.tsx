import { useAccount, useReadContract } from "wagmi";
import { mockPerpAddress } from "~/config";
import { mockPerp } from "./abi/mockPerp";
import { formatEther, parseEther, zeroAddress } from "viem";
import { useOpenPosition } from "./useOpenPosition";
import { useClosePosition } from "./useClosePosition";
import { useState } from "react";

interface Props {}

export function Positions({}: Props): JSX.Element {
  const { address } = useAccount();

  const { data: position } = useReadContract({
    abi: mockPerp,
    address: mockPerpAddress,
    functionName: "positions",
    args: [address || zeroAddress],
  });

  const { openPosition, pending: openPositionPending } = useOpenPosition();
  const { closePosition, pending: closePositionPending } = useClosePosition();

  const [openAmount, setOpenAmount] = useState("0.001");

  return (
    <div>
      Position: {position ? formatEther(position) : "-"}
      <div>
        <button
          className="bg-green-400 disabled:opacity-60"
          disabled={openPositionPending}
          onClick={() => {
            if (Number.isNaN(Number(openAmount))) {
              return;
            }

            const amount = parseEther(openAmount);

            openPosition(amount);
          }}
        >
          Open
        </button>

        <input
          className="border-gray-400 border-solid border"
          value={openAmount}
          onChange={({ target: { value } }) => {
            setOpenAmount(value);
          }}
        />
      </div>
      <button
        className="bg-red-400 disabled:opacity-60"
        disabled={closePositionPending}
        onClick={() => {
          closePosition();
        }}
      >
        Close
      </button>
    </div>
  );
}
