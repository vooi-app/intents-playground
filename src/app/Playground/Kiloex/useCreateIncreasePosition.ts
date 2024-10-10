import { useQuery } from "@tanstack/react-query";
import Decimal from "decimal.js-light";
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import {
  encodeFunctionData,
  encodePacked,
  erc20Abi,
  formatUnits,
  parseUnits,
  toHex,
} from "viem";
import { signMessage } from "viem/accounts";
import { useConfig, useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { useSmartAccount } from "~/components/SmartAccountProvider";
import { CONFIG } from "~/config";
import { ethTransferVerifier } from "./abi/ethTransferVerifier";
import { positionRouter } from "./abi/positionRouter";
import { uniswapSwapRouterAbi } from "./abi/uniswapISwapRouter";
import { uniswapQuoterAbi } from "./abi/uniswapQuoter";

interface Prices {
  current: Record<string, string>;
  previousDay: Record<string, string>;
}

interface CreateIncreasePositionParams {
  amount: bigint;
  id: number;
  isLong: boolean;
  leverage: number;
}

const VOOI_BROKER_ID = 11;

const KILOEX_DECIMALS = 8;

const KILOEX_EXTRA_INFO = encodePacked(["uint8"], [VOOI_BROKER_ID]);

const KILOEX_CHAIN_ID = 56; // BNB

const STABLE_TOKEN_DECIMALS = 18;

const SLIPPAGE_STRING = "0.5";

const POSITION_ROUTER_ADDRESS = "0x298e94D5494E7c461a05903DcF41910e0125D019";

const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" as const;

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" as const;

const UNISWAP_SWAP_ROUTER_ADDRESS =
  "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2" as const;

const UNISWAP_QUOTER_ADDRESS =
  "0x78D78E420Da98ad378D7799bE8f4AF69033EB077" as const;

const UNISWAP_SWAP_SLIPPAGE = 0.5; // 0.5%

export function useCreateIncreasePosition() {
  const config = useConfig();

  const { data: prices } = useQuery({
    queryKey: ["prices"],
    queryFn: async (): Promise<Prices> => {
      const response = await fetch("https://api.kiloex.io/index/prices");

      return response.json();
    },
    refetchInterval: 3_000,
  });

  const { data: executionFee } = useReadContract({
    abi: positionRouter,
    functionName: "minExecutionFee",
    address: POSITION_ROUTER_ADDRESS,
    args: [],
  });

  const { cabClient } = useSmartAccount();

  const createIncreasePosition = async ({
    id,
    amount,
    leverage,
    isLong,
  }: CreateIncreasePositionParams) => {
    if (!cabClient || !executionFee || !config) {
      return;
    }

    const markPrice = prices?.current[id];
    if (!markPrice) {
      return;
    }

    if (!cabClient?.account) {
      return;
    }

    const cabAddress = cabClient.account.address;

    const margin = parseUnits(
      formatUnits(amount / BigInt(leverage), STABLE_TOKEN_DECIMALS),
      KILOEX_DECIMALS
    );

    const leverageInDecimals = parseUnits(leverage.toString(), KILOEX_DECIMALS);

    let slippageValue = new Decimal(markPrice).times(SLIPPAGE_STRING).div(100);
    if (!isLong) {
      slippageValue = slippageValue.times(-1);
    }

    const acceptablePrice = parseUnits(
      new Decimal(markPrice).plus(slippageValue).toString(),
      KILOEX_DECIMALS
    );

    const messageHash = await readContract(config, {
      address: "0x28D6d7BDD154b70bdf631880166edd9F1b64Cee5",
      abi: ethTransferVerifier,
      functionName: "getMessageHash",
      args: [cabClient.account!.address!, executionFee],
      chainId: KILOEX_CHAIN_ID,
    });

    const signature = await signMessage({
      message: { raw: messageHash },
      privateKey:
        "0xe339057a3025ad306c40d49e6f41715f7477b875f0f4081d21e4a7a1597f6deb",
    });

    const usdtAmountOut = (margin + margin / 100n) * 10n ** 10n; // TODO: Add proper 0.07% fee

    const quote = await readContract(config, {
      address: UNISWAP_QUOTER_ADDRESS,
      abi: uniswapQuoterAbi,
      functionName: "quoteExactOutputSingle",
      args: [
        [
          USDC_ADDRESS,
          USDT_ADDRESS,
          usdtAmountOut,
          100, // 0.3% fee
          0, // sqrtPriceLimitX96 (0 means no limit)
        ],
      ],
    });

    let usdcAmountIn = quote[0] as bigint; // Something with types, so cast it to bigint
    // Add slippage
    usdcAmountIn =
      usdcAmountIn +
      usdcAmountIn / BigInt(Math.ceil(100 / UNISWAP_SWAP_SLIPPAGE));

    const { userOperation } = await cabClient.prepareUserOperationRequestCAB({
      calls: [
        // Approve USDC to Uniswap swap
        {
          to: USDC_ADDRESS,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [UNISWAP_SWAP_ROUTER_ADDRESS, usdcAmountIn],
          }),
          value: 0n,
        },
        // Swap USDC to USDT
        {
          to: UNISWAP_SWAP_ROUTER_ADDRESS,
          data: encodeFunctionData({
            abi: uniswapSwapRouterAbi,
            functionName: "exactOutputSingle",
            args: [
              {
                tokenIn: USDC_ADDRESS,
                tokenOut: USDT_ADDRESS,
                fee: 100, // 0.3% fee
                recipient: cabAddress,
                amountOut: usdtAmountOut,
                amountInMaximum: usdcAmountIn,
                sqrtPriceLimitX96: 0n,
              },
            ],
          }),
          value: 0n,
        },
        // Transfer execution fee
        {
          to: "0x28D6d7BDD154b70bdf631880166edd9F1b64Cee5",
          data: encodeFunctionData({
            abi: ethTransferVerifier,
            functionName: "transferEther",
            args: [executionFee, signature],
          }),
          value: BigInt(0),
        },
        // Approve USDT to PositionRouter
        {
          to: "0x55d398326f99059fF775485246999027B3197955",
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [POSITION_ROUTER_ADDRESS, usdtAmountOut],
          }),
          value: BigInt(0),
        },
        // Create position
        {
          to: POSITION_ROUTER_ADDRESS,
          data: encodeFunctionData({
            abi: positionRouter,
            functionName: "createIncreasePositionV3",
            args: [
              BigInt(id),
              margin,
              leverageInDecimals,
              isLong,
              acceptablePrice,
              executionFee,
              toHex("vooi", { size: 32 }),
              KILOEX_EXTRA_INFO,
            ],
          }),
          value: executionFee,
        },
      ],
      repayTokens: [CONFIG.cabToken],
    });

    const userOpHash = await cabClient.sendUserOperationCAB({
      userOperation,
    });

    console.log("userOpHash", userOpHash);

    const bundlerClient = cabClient.extend(
      bundlerActions(ENTRYPOINT_ADDRESS_V07)
    );
    const recipient = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    console.log("recipient", recipient);
  };

  return createIncreasePosition;
}
