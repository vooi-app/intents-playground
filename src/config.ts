import { Address, Chain } from "viem";
import { base, bsc, optimismSepolia, sepolia } from "viem/chains";

export interface ChainConfig {
  chain: Chain;
  payMasterURL: string;
  usdTokenAddress: Address;
  usdTokenDecimals: number;
  vaultAddress: Address;
}

export interface Config {
  cabToken: "USDC" | "6TEST";
  chains: ChainConfig[];
}

export const INVOICE_MANAGER_ADDRESS: Address =
  "0x5C560ee0e414d635ccaE2208cfA13715a969c631";

export const VAULT_MANAGER_ADDRESS: Address =
  "0xFa4A202a24Ff90f7C3843b2CefCde012dCb2762B";

export const CAB_PAYMASTER_ADDRESS: Address =
  "0x78b09791499931CC36919Ef6A38BEC8B569E7f57";

export let CONFIG: Config;

if (process.env.NEXT_PUBLIC_NETWORK === "mainnet") {
  CONFIG = {
    cabToken: "USDC",
    chains: [
      {
        chain: base,
        payMasterURL:
          "https://rpc.zerodev.app/api/v2/paymaster/618c232a-8a56-40a7-97b8-e6d2f32047a1",
        usdTokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        usdTokenDecimals: 18,
        vaultAddress: "0x35b459ece8281bbd2523ca9275749c6cf86c4652",
      },
      {
        chain: bsc,
        payMasterURL:
          "https://rpc.zerodev.app/api/v2/paymaster/3ab460c9-57d0-476b-9a3d-1c9a092b68aa",
        usdTokenAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        usdTokenDecimals: 18,
        vaultAddress: "0xbe7fe3d3f293261ae3fcd128d57a77729496b3b7",
      },
    ],
  };
} else {
  CONFIG = {
    cabToken: "6TEST",
    chains: [
      {
        usdTokenDecimals: 6,
        chain: sepolia,
        payMasterURL:
          "https://rpc.zerodev.app/api/v2/paymaster/cc176414-1ad3-4e38-ad8d-aad43ac0ffe6",
        usdTokenAddress: "0x3870419ba2bbf0127060bcb37f69a1b1c090992b",
        vaultAddress: "0xaf9bec58bb2c173fef7d9ade9bbc3e179f3e8993",
      },
      {
        usdTokenDecimals: 6,
        chain: optimismSepolia,
        payMasterURL:
          "https://rpc.zerodev.app/api/v2/paymaster/7e156305-bc27-4f9e-aefe-082d85a31194",
        usdTokenAddress: "0x3870419ba2bbf0127060bcb37f69a1b1c090992b",
        vaultAddress: "0xaf9bec58bb2c173fef7d9ade9bbc3e179f3e8993",
      },
    ],
  };
}
