"use client";

import { useReadCab } from "@build-with-yi/wagmi";
import { erc20Abi, formatEther, parseAbi, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import {
  testErc20Address,
  testErc20VaultAddress,
  vaultManagerAddress,
} from "~/config";
import { vaultManager } from "./abi/vaultManager";
import { baseSepolia, optimismSepolia } from "viem/chains";

const CHAIN_PAYMASTER_URL: Record<number, string> = {
  [baseSepolia.id]:
    "https://rpc.zerodev.app/api/v2/paymaster/01ca58a4-214b-4429-b932-94a808588397",
  [optimismSepolia.id]:
    "https://rpc.zerodev.app/api/v2/paymaster/587a5a94-89bd-435f-a637-8c0f4efef2d9",
};

export function SmartAccountBallance(): JSX.Element {
  const { address, chainId } = useAccount();
  const { data: balance } = useReadCab();

  const { writeContracts, data: id, error } = useWriteContracts();

  const { data: callsStatus } = useCallsStatus({
    id: id!,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 2000,
    },
  });

  return (
    <div>
      <div>CAB: {balance !== undefined ? formatEther(balance) : "-"}</div>
      <button
        className="bg-yellow-400 disabled:opacity-60"
        disabled={callsStatus?.status === "PENDING"}
        onClick={() => {
          if (chainId === undefined) {
            return;
          }

          const paymasterUrl = CHAIN_PAYMASTER_URL[chainId];
          if (!paymasterUrl) {
            return;
          }

          const amount = parseEther("0.3");

          writeContracts({
            contracts: [
              {
                address: testErc20Address,
                abi: parseAbi(["function mint(address,uint256)"]),
                functionName: "mint",
                args: [address, amount],
              },
              {
                address: testErc20Address,
                abi: erc20Abi,
                functionName: "approve",
                args: [vaultManagerAddress, amount],
              },
              {
                address: vaultManagerAddress,
                abi: vaultManager,
                functionName: "deposit",
                args: [testErc20Address, testErc20VaultAddress, amount, false],
              },
            ],
            capabilities: {
              paymasterService: {
                url: paymasterUrl,
              },
            },
          });
        }}
      >
        Mint
      </button>
    </div>
  );
}
