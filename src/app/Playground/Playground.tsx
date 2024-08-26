"use client";

import { useEffect, useState } from "react";
import { EoaBalance } from "./EoaBalance";
import { ConnectWallet } from "./ConnectWallet/ConnectWallet";
import { SmartAccountBallance } from "./SmartAccountBallance/SmartAccountBallance";
import { Positions } from "./Positions/Positions";
import { SmartAccount } from "./SmartAccount";
import { baseSepolia, optimismSepolia } from "viem/chains";

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
      <EoaBalance />
      <SmartAccount />
      <SmartAccountBallance />
      <div className="flex gap-2">
        <Positions
          title="OP"
          perpChainId={optimismSepolia.id}
          perpAddress="0x932a78FaF4245512caeeacdd5Bda3bE031C60C52"
        />
        <Positions
          title="Base"
          perpChainId={baseSepolia.id}
          perpAddress="0xc49da78c6ac3c3666cb465c4ccf8492a57616909"
        />
      </div>
    </div>
  );
}
