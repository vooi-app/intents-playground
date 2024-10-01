import React, { useEffect, useState } from "react";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import {
  ENTRYPOINT_ADDRESS_V07,
  walletClientToSmartAccountSigner,
} from "permissionless";
import { Chain, Transport } from "viem";
import { http, usePublicClient, useWalletClient } from "wagmi";
import { toMultiChainECDSAValidator } from "@zerodev/multi-chain-validator";
import { createKernelCABClient, KernelCABClient } from "@zerodev/cab";
import { CONFIG } from "~/config";

export interface SmartAccountContextValue {
  cabClient?: KernelCABClient<typeof ENTRYPOINT_ADDRESS_V07, Transport, Chain>;
}

interface Props {
  children?: React.ReactNode;
}

export const SmartAccountContext =
  React.createContext<SmartAccountContextValue>({});

export function SmartAccountProvider({ children }: Props): JSX.Element {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [cabClient, setCabClient] = useState<
    KernelCABClient<typeof ENTRYPOINT_ADDRESS_V07, Transport, Chain> | undefined
  >();

  useEffect(() => {
    async function createCabClient() {
      if (!publicClient || !walletClient) {
        return;
      }

      const { chain } = walletClient;

      const chainConfig = CONFIG.chains.find(
        ({ chain: { id } }) => id === chain.id
      );
      if (!chainConfig) {
        return;
      }

      const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

      const entryPoint = ENTRYPOINT_ADDRESS_V07;
      const kernelVersion = KERNEL_V3_1;

      const ecdsaValidator = await toMultiChainECDSAValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint,
        kernelVersion,
      });

      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion,
      });

      const paymasterClient = createZeroDevPaymasterClient({
        chain,
        transport: http(
          `https://rpc.zerodev.app/api/v2/paymaster/${chainConfig.zeroDevProjectId}`
        ),
        entryPoint,
      });

      const kernelClient = createKernelAccountClient({
        account,
        entryPoint,
        chain,
        bundlerTransport: http(
          `https://rpc.zerodev.app/api/v2/bundler/${chainConfig.zeroDevProjectId}`,
          { timeout: 100_000 }
        ),
        middleware: {
          sponsorUserOperation: paymasterClient.sponsorUserOperation,
        },
      });

      const cabClient = createKernelCABClient(kernelClient, {
        transport: http(
          "https://cab-paymaster-service.onrender.com/paymaster/api"
        ),
        entryPoint,
      });

      if (!ignore) {
        setCabClient(cabClient);
      }
    }

    let ignore = false;

    createCabClient();

    return () => {
      ignore = true;
    };
  }, [publicClient, walletClient]);

  return (
    <SmartAccountContext.Provider value={{ cabClient }}>
      {children}
    </SmartAccountContext.Provider>
  );
}
