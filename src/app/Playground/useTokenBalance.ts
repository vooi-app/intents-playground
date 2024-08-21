import { useReadContract } from "wagmi";
import { erc20Abi, Address, zeroAddress } from "viem";
import { testErc20Address } from "~/config";

export function useTokenBalance({
  chainId,
  address,
}: {
  chainId: number;
  address: Address | undefined;
}) {
  return useReadContract({
    address: testErc20Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    chainId,
  });
}
