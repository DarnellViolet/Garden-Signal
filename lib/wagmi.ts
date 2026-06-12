import { type EIP1193Provider } from "viem";
import { baseAccount, coinbaseWallet, injected, metaMask, safe, walletConnect } from "wagmi/connectors";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

export const contractAddress = "0xd4490d4f19b3be46eeadb5820d0e94f1aba93c85" as `0x${string}`;
export const attributionDataSuffix =
  "0x62635f336770666e636b660b0080218021802180218021802180218021" as `0x${string}`;
export const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

type InjectedWalletProvider = EIP1193Provider & {
  isOkxWallet?: true;
  isOKExWallet?: true;
  providers?: InjectedWalletProvider[];
};

const walletConnectConnector = walletConnectProjectId
  ? [
      walletConnect({
        projectId: walletConnectProjectId,
        showQrModal: true,
        metadata: {
          name: "Garden Signal",
          description: "A botanical sensor garden mini app on Base.",
          url: "https://garden-signal.vercel.app",
          icons: []
        }
      })
    ]
  : [];

function getOkxProvider() {
  if (typeof window === "undefined") return undefined;

  const win = window as typeof window & {
    okxwallet?: InjectedWalletProvider;
    ethereum?: InjectedWalletProvider;
  };
  const providers: InjectedWalletProvider[] = win.ethereum?.providers ?? [];
  return (
    win.okxwallet ??
    providers.find((provider) => provider.isOkxWallet || provider.isOKExWallet) ??
    (win.ethereum?.isOkxWallet || win.ethereum?.isOKExWallet ? win.ethereum : undefined)
  );
}

function getBrowserProvider() {
  if (typeof window === "undefined") return undefined;
  return window.ethereum;
}

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: "Garden Signal"
    }),
    metaMask({
      dappMetadata: {
        name: "Garden Signal",
        url: "https://garden-signal.vercel.app"
      }
    }),
    coinbaseWallet({
      appName: "Garden Signal",
      preference: "all"
    }),
    safe({
      shimDisconnect: true
    }),
    ...walletConnectConnector,
    injected({
      shimDisconnect: true,
      unstable_shimAsyncInject: 1000,
      target() {
        return {
          id: "okxWallet",
          name: "OKX Wallet",
          provider: getOkxProvider
        };
      }
    }),
    injected({
      shimDisconnect: true,
      unstable_shimAsyncInject: 1000,
      target() {
        return {
          id: "browserWallet",
          name: "Browser Wallet",
          provider: getBrowserProvider
        };
      }
    })
  ],
  transports: {
    [base.id]: http()
  }
});
