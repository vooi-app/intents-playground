"use client";

import { useEffect, useState } from "react";
import { EoaBalance } from "./EoaBalance";
import { ConnectWallet } from "./ConnectWallet/ConnectWallet";
import { SmartAccountBallance } from "./SmartAccountBallance/SmartAccountBallance";
import { Positions } from "./Positions/Positions";
import { SmartAccount } from "./SmartAccount";

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
      <Positions />
    </div>
  );
}
