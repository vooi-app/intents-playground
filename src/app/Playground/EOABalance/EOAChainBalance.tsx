import { Address, Chain, erc20Abi, formatUnits, zeroAddress } from "viem";
import { useReadContract } from "wagmi";

interface Props {
  address?: Address;
  chain: Chain;
  usdTokenAddress: Address;
}

export function EOAChainBalance({
  address,
  chain,
  usdTokenAddress,
}: Props): JSX.Element {
  const { data } = useReadContract({
    abi: erc20Abi,
    address: usdTokenAddress,
    args: [address ?? zeroAddress],
    chainId: chain.id,
    functionName: "balanceOf",
  });

  return (
    <div>
      {chain.name}: {data !== undefined ? formatUnits(data, 6) : "-"}
    </div>
  );
}
