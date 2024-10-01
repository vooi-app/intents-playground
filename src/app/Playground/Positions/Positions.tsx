import { useAccount, useReadContract } from "wagmi";
import { mockPerp } from "./abi/mockPerp";
import { Address, formatUnits, parseUnits, zeroAddress } from "viem";
import { useOpenPosition } from "./useOpenPosition";
import { useClosePosition } from "./useClosePosition";
import { useState } from "react";
import { useSmartAccount } from "~/app/useSmartAccount";
// import { Session } from "./Session";

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
  const { cabClient } = useSmartAccount();

  const [permissionsContext, setPermissionsContext] = useState("");

  const { data: position } = useReadContract({
    query: {
      refetchInterval: 3000,
    },
    abi: mockPerp,
    address: perpAddress,
    args: [cabClient?.account?.address || zeroAddress],
    chainId: perpChainId,
    functionName: "positions",
  });

  const { openPosition, pending: openPositionPending } = useOpenPosition(
    perpAddress,
    perpChainId,
    permissionsContext
  );
  const { closePosition, pending: closePositionPending } = useClosePosition(
    perpAddress,
    perpChainId,
    permissionsContext
  );

  const [openAmount, setOpenAmount] = useState("1");

  return (
    <div className="flex flex-col gap-1 items-start">
      {title}
      <br />
      Position: {position !== undefined ? formatUnits(position, 6) : "-"}
      <div className="flex gap-1">
        <button
          className="bg-green-400 disabled:opacity-60"
          disabled={openPositionPending}
          onClick={async () => {
            if (Number.isNaN(Number(openAmount))) {
              return;
            }

            const amount = parseUnits(openAmount, 6);

            openPosition(amount);
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
        disabled={closePositionPending}
        onClick={() => {
          closePosition();
        }}
      >
        Close
      </button>
      {/* <Session
        perpAddress={perpAddress}
        perpChainId={perpChainId}
        permissionsContext={permissionsContext}
        onPermissionsContextChange={(value) => {
          setPermissionsContext(value);
        }}
      /> */}
    </div>
  );
}
