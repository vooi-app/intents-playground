import { useEffect, useState } from "react";
import { Address } from "viem";

export function useEoaAddress() {
  const [address, setAddress] = useState<Address | undefined>(undefined);

  useEffect(() => {
    const getAddress = async () => {
      const [eoaAddress] = await window.ethereum?.request({
        method: "eth_accounts",
      });

      setAddress(eoaAddress ?? undefined);
    };

    getAddress();
  }, []);

  return { address };
}
