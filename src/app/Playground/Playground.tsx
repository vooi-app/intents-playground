"use client";

import { useEffect, useState } from "react";
import { ConnectWallet } from "./ConnectWallet/ConnectWallet";
import { SmartAccountBallance } from "./SmartAccountBallance/SmartAccountBallance";
import { Positions } from "./Positions/Positions";
import { SmartAccount } from "./SmartAccount/SmartAccount";
import { optimismSepolia, sepolia } from "viem/chains";
import { EOABalance } from "./EOABalance";

interface Props {}

export function Playground({}: Props): JSX.Element {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading</div>;
  }

  return (
    <div>
      <ConnectWallet />

      <EOABalance />

      <SmartAccount />
      <SmartAccountBallance />

      <div className="flex gap-2">
        <Positions
          title="OP"
          perpChainId={optimismSepolia.id}
          perpAddress="0x932a78FaF4245512caeeacdd5Bda3bE031C60C52"
        />
        <Positions
          title="Sepolia"
          perpChainId={sepolia.id}
          perpAddress="0x98eE3CA9Df88FC39d7CC700655eb2042344eA11f"
        />
      </div>
    </div>
  );
}
