import {
  Address,
  getAbiItem,
  Hex,
  keccak256,
  parseEther,
  toFunctionSelector,
  WalletClient,
} from "viem";
import { walletActionsErc7715 } from "viem/experimental";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { testErc20Address } from "~/config";
import { useMutation } from "@tanstack/react-query";
import { mockPerp } from "./abi/mockPerp";

interface Props {
  permissionsContext: string;
  perpAddress: Address;
  perpChainId: number;
  onPermissionsContextChange: (value: string) => void;
}

export function Session({
  permissionsContext,
  perpAddress,
  perpChainId,
  onPermissionsContextChange,
}: Props): JSX.Element {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const { data: walletClient } = useWalletClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (client: WalletClient) => {
      if (chainId !== perpChainId) {
        await switchChainAsync({ chainId: perpChainId });
      }

      return client.extend(walletActionsErc7715()).grantPermissions({
        signer: {
          type: "wallet",
        },
        permissions: [
          {
            type: { custom: "erc20-token-approve" },
            data: {
              tokenAddress: testErc20Address,
              allowance: parseEther("1"),
              contractAllowList: [
                {
                  address: perpAddress,
                  functions: [
                    toFunctionSelector(
                      getAbiItem({
                        abi: mockPerp,
                        name: "openPosition",
                      })
                    ),
                  ],
                },
                {
                  address: perpAddress,
                  functions: [
                    toFunctionSelector(
                      getAbiItem({
                        abi: mockPerp,
                        name: "closePosition",
                      })
                    ),
                  ],
                },
              ],
            },
            policies: [],
          },
        ],
        expiry: Math.floor(Date.now() / 1000) + 3600,
      });
    },
    onError(e) {
      console.log(e);
    },
  });

  if (permissionsContext) {
    return (
      <div>
        Session: {keccak256(permissionsContext as Hex).slice(0, 10)}...
        {keccak256(permissionsContext as Hex).slice(-3)}
      </div>
    );
  }

  return (
    <div>
      <button
        className="bg-pink-400 disabled:opacity-60"
        disabled={isPending}
        onClick={() => {
          if (!walletClient) {
            return;
          }

          mutate(walletClient, {
            onSuccess(value) {
              onPermissionsContextChange(value.permissionsContext);
            },
          });
        }}
      >
        Create session
      </button>
    </div>
  );
}
