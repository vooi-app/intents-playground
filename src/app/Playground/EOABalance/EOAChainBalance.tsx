import { Address, erc20Abi, formatUnits, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { ChainConfig } from "~/config";

interface Props {
  address?: Address;
  chainConfig: ChainConfig;
}

export function EOAChainBalance({
  address,
  chainConfig: { chain, usdTokenAddress, usdTokenDecimals },
}: Props): JSX.Element {
  const { data, error } = useReadContract({
    abi: erc20Abi,
    address: usdTokenAddress,
    args: [address ?? zeroAddress],
    chainId: chain.id,
    functionName: "balanceOf",
  });

  return (
    <div>
      {chain.name}:{" "}
      {data !== undefined ? formatUnits(data, usdTokenDecimals) : "-"}
    </div>
  );
}
