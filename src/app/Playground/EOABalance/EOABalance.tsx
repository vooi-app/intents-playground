import { CONFIG } from "~/config";
import { useEoaAddress } from "../useEoaAddress";
import { EOAChainBalance } from "./EOAChainBalance";

export function EOABalance(): JSX.Element {
  const { address } = useEoaAddress();

  return (
    <div>
      <div>Ballance:</div>

      {CONFIG.chains.map((chainConfig) => (
        <EOAChainBalance
          address={address}
          chainConfig={chainConfig}
          key={chainConfig.chain.id}
        />
      ))}
    </div>
  );
}
