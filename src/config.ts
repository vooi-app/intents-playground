import { Address } from "viem";
import { baseSepolia, optimismSepolia, sepolia } from "viem/chains";

export const CHAIN_PAYMASTER_URL: Record<number, string> = {
  [sepolia.id]:
    "https://rpc.zerodev.app/api/v2/paymaster/SEPOLIA_ID",
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
