import { positionRouter } from "./abi/positionRouter";
import { encodeFunctionData, encodePacked, parseUnits } from "viem";
import Decimal from "decimal.js-light";
import { useReadContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useSmartAccount } from "~/components/SmartAccountProvider";
import { CONFIG } from "~/config";

interface Prices {
  current: Record<string, string>;
  previousDay: Record<string, string>;
}

interface CreateDecreasePositionParams {
  id: bigint;
  isLong: boolean;
  margin: bigint;
}

const VOOI_BROKER_ID = 11;

const KILOEX_DECIMALS = 8;

const KILOEX_EXTRA_INFO = encodePacked(["uint8"], [VOOI_BROKER_ID]);

const SLIPPAGE_STRING = "0.5";

const POSITION_ROUTER_ADDRESS = "0x298e94D5494E7c461a05903DcF41910e0125D019";

export function useCreateDecreasePosition() {
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
    margin,
    isLong,
  }: CreateDecreasePositionParams) => {
    if (!cabClient) {
      return;
    }

    if (!executionFee) {
      return;
    }

    const markPrice = prices?.current[Number(id)];
    if (!markPrice) {
      return;
    }

    let slippageValue = new Decimal(markPrice).times(SLIPPAGE_STRING).div(100);

    const acceptablePrice = parseUnits(
      new Decimal(markPrice).plus(slippageValue).toString(),
      KILOEX_DECIMALS
    );

    const { userOperation } = await cabClient.prepareUserOperationRequestCAB({
      calls: [
        {
          to: POSITION_ROUTER_ADDRESS,
          data: encodeFunctionData({
            abi: positionRouter,
            functionName: "createDecreasePositionV3",
            args: [
              id,
              margin,
              isLong,
              acceptablePrice,
              executionFee,
              KILOEX_EXTRA_INFO,
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

  return createIncreasePosition;
}
