import { EnableCABSupportedToken } from "@zerodev/cab";
import { useSmartAccount } from "~/components/SmartAccountProvider";
import { CONFIG } from "~/config";

export function EnableSmartAccountButton(): JSX.Element {
  const { cabClient } = useSmartAccount();

  return (
    <button
      className="bg-purple-400 disabled:opacity-60"
      onClick={() => {
        if (!cabClient) {
          return;
        }

        cabClient.enableCAB({
          tokens: [
            {
              name: CONFIG.cabToken,
              networks: CONFIG.chains.map(
                ({ chain }) => chain.id
              ) as EnableCABSupportedToken["networks"],
            },
          ],
        });
      }}
    >
      Enable Smart account
    </button>
  );
}
