import { positionRouter } from "./abi/positionRouter";
import {
  encodeFunctionData,
  encodePacked,
  erc20Abi,
  formatUnits,
  parseUnits,
  toHex,
} from "viem";
import Decimal from "decimal.js-light";
import { usePublicClient, useReadContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useSmartAccount } from "~/components/SmartAccountProvider";
import { CONFIG } from "~/config";
import { ethTransferVerifier } from "./abi/ethTransferVerifier";
import { signMessage } from "viem/accounts";

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

const STABLE_TOKEN_DECIMALS = 18;

const SLIPPAGE_STRING = "0.5";

const POSITION_ROUTER_ADDRESS = "0x298e94D5494E7c461a05903DcF41910e0125D019";

export function useCreateIncreasePosition() {
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

  const client = usePublicClient();

  const createIncreasePosition = async ({
    id,
    amount,
    leverage,
    isLong,
  }: CreateIncreasePositionParams) => {
    if (!cabClient) {
      return;
    }

    if (!executionFee) {
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

    const leverageInDecimals = parseUnits(leverage.toString(), KILOEX_DECIMALS);

    let slippageValue = new Decimal(markPrice).times(SLIPPAGE_STRING).div(100);
    if (!isLong) {
      slippageValue = slippageValue.times(-1);
    }

    const acceptablePrice = parseUnits(
      new Decimal(markPrice).plus(slippageValue).toString(),
      KILOEX_DECIMALS
    );

    const messageHash = await client!.readContract({
      address: "0x28D6d7BDD154b70bdf631880166edd9F1b64Cee5",
      abi: ethTransferVerifier,
      functionName: "getMessageHash",
      args: [cabClient.account!.address!, executionFee],
    });

    const signature = await signMessage({
      message: { raw: messageHash },
      privateKey:
        "0xe339057a3025ad306c40d49e6f41715f7477b875f0f4081d21e4a7a1597f6deb",
    });

    const { userOperation } = await cabClient.prepareUserOperationRequestCAB({
      calls: [
        {
          to: "0x55d398326f99059fF775485246999027B3197955",
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [
              POSITION_ROUTER_ADDRESS,
              (margin + margin / 100n) * 10n ** 10n,
            ],
          }),
          value: BigInt(0),
        },
        {
          to: "0x28D6d7BDD154b70bdf631880166edd9F1b64Cee5",
          data: encodeFunctionData({
            abi: ethTransferVerifier,
            functionName: "transferEther",
            args: [executionFee, signature],
          }),
          value: BigInt(0),
        },
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

    console.log(userOpHash);
  };

  return createIncreasePosition;
}
