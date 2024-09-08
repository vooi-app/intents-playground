import { Address, Chain, zeroAddress } from "viem";
import { base, bsc, optimismSepolia, sepolia } from "viem/chains";

export const CHAIN_PAYMASTER_URL: Record<number, string> = {
  [sepolia.id]:
    "https://rpc.zerodev.app/api/v2/paymaster/ebfe06b0-84a9-4fb7-97ea-4341f7de6985",
  [optimismSepolia.id]:
    "https://rpc.zerodev.app/api/v2/paymaster/587a5a94-89bd-435f-a637-8c0f4efef2d9",
};

export const testErc20Address: Address =
  "0x3870419ba2bbf0127060bcb37f69a1b1c090992b";

export const invoiceManagerAddress: Address =
  "0x5C560ee0e414d635ccaE2208cfA13715a969c631";

export const vaultManagerAddress: Address =
  "0xFa4A202a24Ff90f7C3843b2CefCde012dCb2762B";

export const testErc20VaultAddress: Address =
  "0xaf9bec58bb2c173fef7d9ade9bbc3e179f3e8993";

export const cabPaymasterAddress: Address =
  "0x78b09791499931CC36919Ef6A38BEC8B569E7f57";

export let CONFIG: {
  cabToken: "USDC" | "6TEST";
  chains: {
    chain: Chain;
    usdTokenAddress: Address;
  }[];
};

if (process.env.NEXT_PUBLIC_NETWORK === "mainnet") {
  CONFIG = {
    cabToken: "USDC",
    chains: [
      {
        chain: base,
        usdTokenAddress: zeroAddress,
      },
      {
        chain: bsc,
        usdTokenAddress: "0x55d398326f99059fF775485246999027B3197955",
      },
    ],
  };
} else {
  CONFIG = {
    cabToken: "6TEST",
    chains: [
      {
        chain: sepolia,
        usdTokenAddress: "0x3870419ba2bbf0127060bcb37f69a1b1c090992b",
      },
      {
        chain: optimismSepolia,
        usdTokenAddress: "0x3870419ba2bbf0127060bcb37f69a1b1c090992b",
      },
    ],
  };
}
