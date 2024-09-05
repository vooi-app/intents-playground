import { Address } from "viem";
import { baseSepolia, optimismSepolia } from "viem/chains";

export const CHAIN_PAYMASTER_URL: Record<number, string> = {
  [baseSepolia.id]:
    "https://rpc.zerodev.app/api/v2/paymaster/01ca58a4-214b-4429-b932-94a808588397",
  [optimismSepolia.id]:
    "https://rpc.zerodev.app/api/v2/paymaster/587a5a94-89bd-435f-a637-8c0f4efef2d9",
};

export const testErc20Address: Address =
  "0x3870419ba2bbf0127060bcb37f69a1b1c090992b";

export const invoiceManagerAddress: Address =
  "0x80F3b8c46381d5cF4B737742D5FE323b7CaA43b1";

export const vaultManagerAddress: Address =
  "0x456e6c1c701e91D8A078Be9b5fDF3FA40E01CcBe";

export const testErc20VaultAddress: Address =
  "0x8652d7cf55e8cbc976fe53584366c6989c8ae0e5";

export const cabPaymasterAddress: Address =
  "0xB4Aa062cC685e7e2B6881ED57FB830Cd7D4bCf25";
