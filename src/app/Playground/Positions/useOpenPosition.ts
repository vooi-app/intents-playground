import { Address, encodeFunctionData, erc20Abi } from "viem";
import { CONFIG } from "~/config";
import { mockPerp } from "./abi/mockPerp";
import { useAccount, useSwitchChain } from "wagmi";
import { useSmartAccount } from "~/app/useSmartAccount";

export function useOpenPosition(
  perpAddress: Address,
  perpChainId: number,
  permissionsContext: string
) {
  const { cabClient } = useSmartAccount();

  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const openPosition = async (amount: bigint) => {
    if (!cabClient) {
      return;
    }

    const chainConfig = CONFIG.chains.find(({ chain }) => chain.id === chainId);
    if (!chainConfig) {
      return;
    }

    const { userOperation } = await cabClient.prepareUserOperationRequestCAB({
      calls: [
        {
          to: chainConfig.usdTokenAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [perpAddress, amount],
          }),
          value: BigInt(0),
        },

        {
          to: perpAddress,
          data: encodeFunctionData({
            abi: mockPerp,
            functionName: "openPosition",
            args: [amount],
          }),
          value: BigInt(0),
        },
      ],
      repayTokens: [CONFIG.cabToken],
    });

    const userOpHash = await cabClient.sendUserOperationCAB({
      userOperation,
    });

    console.log(userOpHash);
  };

  return {
    openPosition,
    pending: false,
  };
}
