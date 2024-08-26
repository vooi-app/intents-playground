import { useAccount, useReadContract, useSwitchChain } from "wagmi";
import { mockPerp } from "./abi/mockPerp";
import { Address, formatEther, parseEther, zeroAddress } from "viem";
import { useOpenPosition } from "./useOpenPosition";
import { useClosePosition } from "./useClosePosition";
import { useState } from "react";

interface Props {
  perpAddress: Address;
  perpChainId: number;
  title: string;
}

export function Positions({
  perpAddress,
  perpChainId,
  title,
}: Props): JSX.Element {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const { data: position } = useReadContract({
    abi: mockPerp,
    address: perpAddress,
    args: [address || zeroAddress],
    chainId: perpChainId,
    functionName: "positions",
  });

  const { openPosition, pending: openPositionPending } =
    useOpenPosition(perpAddress);
  const { closePosition, pending: closePositionPending } =
    useClosePosition(perpAddress);

  const [openAmount, setOpenAmount] = useState("0.001");

  return (
    <div>
      {title}
      <br />
      Position: {position !== undefined ? formatEther(position) : "-"}
      <div>
        <button
          className="bg-green-400 disabled:opacity-60"
          disabled={openPositionPending}
          onClick={async () => {
            if (Number.isNaN(Number(openAmount))) {
              return;
            }

            if (chainId !== perpChainId) {
              await switchChainAsync({ chainId: perpChainId });
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
          onChange={async ({ target: { value } }) => {
            if (chainId !== perpChainId) {
              await switchChainAsync({ chainId: perpChainId });
            }

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
