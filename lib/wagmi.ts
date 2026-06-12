import { coinbaseWallet, injected } from "wagmi/connectors";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

export const contractAddress = "0x79db0cf500f422052f4a08011b21fdd060c017e0" as `0x${string}`;
export const attributionDataSuffix = "0x" as `0x${string}`;

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({
      shimDisconnect: true,
      target() {
        return {
          id: "injected",
          name: "Browser Wallet",
          provider: typeof window !== "undefined" ? window.ethereum : undefined
        };
      }
    }),
    coinbaseWallet({
      appName: "Garden Signal",
      preference: "all"
    })
  ],
  transports: {
    [base.id]: http()
  }
});
