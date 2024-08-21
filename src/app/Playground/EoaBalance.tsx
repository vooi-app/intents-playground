"use client";

import { useTokenBalance } from "./useTokenBalance";
import { baseSepolia, optimismSepolia } from "viem/chains";
import { formatEther } from "viem";
import { useEoaAddress } from "./useEoaAddress";

interface Props {}

export function EoaBalance({}: Props): JSX.Element {
  const { address } = useEoaAddress();

  const { data: op } = useTokenBalance({
    address: address,
    chainId: optimismSepolia.id,
  });
  const { data: base } = useTokenBalance({
    address: address,
    chainId: baseSepolia.id,
  });

  return (
    <div>
      <div>OP: {op !== undefined ? formatEther(op) : "-"}</div>
      <div>Base: {base !== undefined ? formatEther(base) : "-"}</div>
    </div>
  );
}
