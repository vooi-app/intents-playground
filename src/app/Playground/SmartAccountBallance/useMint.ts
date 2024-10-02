import { encodeFunctionData, erc20Abi, parseAbi, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { CONFIG, VAULT_MANAGER_ADDRESS } from "~/config";
import { vaultManager } from "./abi/vaultManager";
import { useSmartAccount } from "~/components/SmartAccountProvider";

export function useMint() {
  const { cabClient } = useSmartAccount();

  const { chainId } = useAccount();

  const mint = async () => {
    if (!cabClient?.account?.address) {
      return;
    }

    if (chainId === undefined) {
      return;
    }

    const chainConfig = CONFIG.chains.find(({ chain }) => chain.id === chainId);
    if (!chainConfig) {
      return;
    }

    const amount = parseUnits("1000", chainConfig.usdTokenDecimals);

    const { userOperation } = await cabClient.prepareUserOperationRequestCAB({
      calls: [
        {
          to: chainConfig.usdTokenAddress,
          data: encodeFunctionData({
            abi: parseAbi(["function mint(address,uint256)"]),
            functionName: "mint",
            args: [cabClient.account.address, amount],
          }),
          value: BigInt(0),
        },
        {
          to: chainConfig.usdTokenAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [VAULT_MANAGER_ADDRESS, amount],
          }),
          value: BigInt(0),
        },
        {
          to: VAULT_MANAGER_ADDRESS,
          data: encodeFunctionData({
            abi: vaultManager,
            functionName: "deposit",
            args: [
              chainConfig.usdTokenAddress,
              chainConfig.vaultAddress,
              amount,
              false,
            ],
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
    mint,
    pending: false,
  };
}
