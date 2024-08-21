import { useAccount, useReadContract } from "wagmi";
import { mockPerpAddress } from "~/config";
import { mockPerp } from "./abi/mockPerp";
import { formatEther, zeroAddress } from "viem";
import { useOpenPosition } from "./useOpenPosition";
import { useClosePosition } from "./useClosePosition";

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

  return (
    <div>
      Position: {position ? formatEther(position) : "-"}
      <br />
      <button
        className="bg-green-400 disabled:opacity-60"
        disabled={openPositionPending}
        onClick={() => {
          openPosition();
        }}
      >
        Open
      </button>
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
