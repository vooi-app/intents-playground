import { useWriteContracts } from "wagmi/experimental";
import { positionRouter } from "./abi/positionRouter";
import { encodePacked, formatUnits, parseUnits, toHex } from "viem";
import Decimal from "decimal.js-light";
import { useReadContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";

interface Prices {
  current: Record<string, string>;
  previousDay: Record<string, string>;
}

interface CreateIncreasePositionParams {
  amount: string;
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

  const { writeContractsAsync, data, isPending } = useWriteContracts();

  const createIncreasePosition = async ({
    id,
    amount,
    leverage,
    isLong,
  }: CreateIncreasePositionParams) => {
    if (!executionFee) {
      return;
    }

    const markPrice = prices?.current[id];
    if (!markPrice) {
      return;
    }

    const amountInDecimals = parseUnits(amount, STABLE_TOKEN_DECIMALS);

    const margin = parseUnits(
      formatUnits(amountInDecimals / BigInt(leverage), STABLE_TOKEN_DECIMALS),
      KILOEX_DECIMALS
    );

    const leverageInDecimals = parseUnits(leverage.toString(), KILOEX_DECIMALS);

    let slippageValue = new Decimal(markPrice).times(SLIPPAGE_STRING).div(100);

    const acceptablePrice = parseUnits(
      new Decimal(markPrice).plus(slippageValue).toString(),
      KILOEX_DECIMALS
    );

    const tx = await writeContractsAsync({
      contracts: [
        {
          abi: positionRouter,
          functionName: "createIncreasePositionV3",
          address: POSITION_ROUTER_ADDRESS,
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
        },
      ],
    });
  };

  return createIncreasePosition;
}
