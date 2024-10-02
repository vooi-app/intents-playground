import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { mockPerp } from "./abi/mockPerp";
import { Address, encodeFunctionData } from "viem";
import { CONFIG } from "~/config";
import { useAccount, useSwitchChain } from "wagmi";
import { useSmartAccount } from "~/components/SmartAccountProvider";

export function useClosePosition(
  perpAddress: Address,
  perpChainId: number,
  permissionsContext: string
) {
  const { cabClient } = useSmartAccount();

  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const closePosition = async () => {
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
          to: perpAddress,
          data: encodeFunctionData({
            abi: mockPerp,
            functionName: "closePosition",
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
    closePosition,
    pending: false,
  };
}
