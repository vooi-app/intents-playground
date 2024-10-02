import { useContext } from "react";
import { SmartAccountContext } from "./SmartAccountProvider";

export function useSmartAccount() {
  return useContext(SmartAccountContext);
}
