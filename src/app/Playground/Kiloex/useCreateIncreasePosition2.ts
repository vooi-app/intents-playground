import { useQuery } from "@tanstack/react-query";
import Decimal from "decimal.js-light";
import { encodePacked, erc20Abi, formatUnits, parseUnits, toHex } from "viem";
import { signMessage } from "viem/accounts";
import { useAccount, useConfig, useReadContract } from "wagmi";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";
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

const POSITION_ROUTER_ADDRESS =
  "0x298e94D5494E7c461a05903DcF41910e0125D019" as const;

const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" as const;

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" as const;

const UNISWAP_SWAP_ROUTER_ADDRESSES =
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

  const { address } = useAccount();

  const createIncreasePosition = async ({
    id,
    amount,
    leverage,
    isLong,
  }: CreateIncreasePositionParams) => {
    if (!config || !address || !executionFee) {
      return;
    }

    const markPrice = prices?.current[id];
    if (!markPrice) {
      return;
    }

    const margin = parseUnits(
      formatUnits(amount / BigInt(leverage), STABLE_TOKEN_DECIMALS),
      KILOEX_DECIMALS
    );

    /**
     * 1. Swap USDC to USDT using Uniswap
     */
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

    let usdcAmountIn = quote[0] as bigint;
    // Add slippage
    usdcAmountIn =
      usdcAmountIn +
      usdcAmountIn / BigInt(Math.ceil(100 / UNISWAP_SWAP_SLIPPAGE));

    console.log("Max USDT amount in", usdcAmountIn);

    const approveUsdtHash = await writeContract(config, {
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [UNISWAP_SWAP_ROUTER_ADDRESSES, usdcAmountIn],
    });

    await waitForTransactionReceipt(config, { hash: approveUsdtHash });

    const swapHash = await writeContract(config, {
      chainId: KILOEX_CHAIN_ID,
      address: UNISWAP_SWAP_ROUTER_ADDRESSES,
      abi: uniswapSwapRouterAbi,
      functionName: "exactOutputSingle",
      args: [
        {
          tokenIn: USDC_ADDRESS,
          tokenOut: USDT_ADDRESS,
          fee: 100, // 0.3% fee
          recipient: address,
          amountOut: usdtAmountOut,
          amountInMaximum: usdcAmountIn,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    await waitForTransactionReceipt(config, { hash: swapHash });

    /**
     * 2. Get gas for execution fee using special VOOI contract
     */
    const messageHash = await readContract(config, {
      address: "0x28D6d7BDD154b70bdf631880166edd9F1b64Cee5",
      abi: ethTransferVerifier,
      functionName: "getMessageHash",
      args: [address, executionFee],
      chainId: KILOEX_CHAIN_ID,
    });

    const signature = await signMessage({
      message: { raw: messageHash },
      privateKey:
        "0xe339057a3025ad306c40d49e6f41715f7477b875f0f4081d21e4a7a1597f6deb",
    });

    await writeContract(config, {
      address: "0x28D6d7BDD154b70bdf631880166edd9F1b64Cee5",
      abi: ethTransferVerifier,
      functionName: "transferEther",
      args: [executionFee, signature],
      chainId: KILOEX_CHAIN_ID,
    });

    /**
     * 3. Create position
     */
    const leverageInDecimals = parseUnits(leverage.toString(), KILOEX_DECIMALS);

    let slippageValue = new Decimal(markPrice).times(SLIPPAGE_STRING).div(100);
    if (!isLong) {
      slippageValue = slippageValue.times(-1);
    }

    const acceptablePrice = parseUnits(
      new Decimal(markPrice).plus(slippageValue).toString(),
      KILOEX_DECIMALS
    );

    const approveHash = await writeContract(config, {
      address: USDT_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [POSITION_ROUTER_ADDRESS, usdtAmountOut],
    });

    await waitForTransactionReceipt(config, { hash: approveHash });

    await writeContract(config, {
      chainId: KILOEX_CHAIN_ID,
      address: POSITION_ROUTER_ADDRESS,
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
      value: executionFee,
    });
  };

  return createIncreasePosition;
}
