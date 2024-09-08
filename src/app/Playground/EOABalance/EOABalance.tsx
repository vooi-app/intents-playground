import { CONFIG } from "~/config";
import { useEoaAddress } from "../useEoaAddress";
import { EOAChainBalance } from "./EOAChainBalance";

export function EOABalance(): JSX.Element {
  const { address } = useEoaAddress();

  return (
    <div>
      <div>Ballance:</div>

      {CONFIG.chains.map(({ chain, usdTokenAddress }) => (
        <EOAChainBalance
          address={address}
          chain={chain}
          key={chain.id}
          usdTokenAddress={usdTokenAddress}
        />
      ))}
    </div>
  );
}
