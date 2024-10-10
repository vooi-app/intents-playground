import { useEffect, useState } from "react";
import { useSmartAccount } from "~/components/SmartAccountProvider";
import { CONFIG } from "~/config";

export function useCabBalance() {
  const { cabClient } = useSmartAccount();

  const [balance, setBalance] = useState<bigint | undefined>();

  useEffect(() => {
    async function getBalance() {
      if (!cabClient || !cabClient.account) {
        return;
      }

      const { address } = cabClient.account;
      if (!address) {
        return;
      }

      const result = await cabClient.getCabBalance({
        address,
        token: CONFIG.cabToken,
      });

      if (!ignore) {
        setBalance(result);
      }
    }

    let ignore = false;

    getBalance();

    const interval = window.setInterval(() => {
      getBalance();
    }, 4000);

    return () => {
      window.clearInterval(interval);
      ignore = true;
    };
  }, [cabClient]);

  return balance;
}
