"use client";

import {
  Activity,
  AirVent,
  ChevronDown,
  Droplets,
  Flower2,
  Leaf,
  Loader2,
  Power,
  Radio,
  Sprout,
  Waves
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  BaseError,
  type Connector,
  useAccount,
  useConnect,
  useDisconnect,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { gardenSignalAbi } from "@/lib/abi";
import { attributionDataSuffix, contractAddress, walletConnectProjectId } from "@/lib/wagmi";

type GardenAction = {
  id: "sprout" | "bloom" | "breeze";
  label: string;
  method: "waterSprout" | "warmBloom" | "sendBreeze";
  icon: typeof Droplets;
  accent: string;
  helper: string;
};

const actions: GardenAction[] = [
  {
    id: "sprout",
    label: "Water Sprout",
    method: "waterSprout",
    icon: Droplets,
    accent: "bg-baseblue text-white",
    helper: "Moisture pulse"
  },
  {
    id: "bloom",
    label: "Warm Bloom",
    method: "warmBloom",
    icon: Flower2,
    accent: "bg-sunlight text-soil",
    helper: "Sunlight lift"
  },
  {
    id: "breeze",
    label: "Send Breeze",
    method: "sendBreeze",
    icon: AirVent,
    accent: "bg-leaf text-white",
    helper: "Airflow signal"
  }
];

function shortAddress(address?: `0x${string}`) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function safeStatus(error: unknown) {
  if (!error) return "Transaction failed. Please try again.";
  const name = error instanceof BaseError ? error.shortMessage : "";
  if (name.toLowerCase().includes("reject") || name.toLowerCase().includes("denied")) {
    return "Request rejected.";
  }
  return "Transaction failed. Please try again.";
}

function numberText(value: unknown) {
  return typeof value === "bigint" ? value.toString() : "0";
}

type WalletOption = {
  id: string;
  label: string;
  badge: string;
  connector: Connector;
};

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending: isConnectPending } = useConnect({
    mutation: {
      onError(error) {
        console.error("Wallet connection failed", error);
        setActivity("Connection failed. Please try another wallet.");
      }
    }
  });
  const { disconnect } = useDisconnect();
  const [walletOpen, setWalletOpen] = useState(false);
  const [activity, setActivity] = useState("Garden sensors are ready.");
  const [lastAction, setLastAction] = useState<string>("No transaction yet");
  const isContractConfigured = contractAddress !== "0x0000000000000000000000000000000000000000";

  const reads = useMemo(
    () => [
      {
        address: contractAddress,
        abi: gardenSignalAbi,
        functionName: "userSprouts",
        args: [address ?? "0x0000000000000000000000000000000000000000"]
      },
      {
        address: contractAddress,
        abi: gardenSignalAbi,
        functionName: "userBlooms",
        args: [address ?? "0x0000000000000000000000000000000000000000"]
      },
      {
        address: contractAddress,
        abi: gardenSignalAbi,
        functionName: "userBreezes",
        args: [address ?? "0x0000000000000000000000000000000000000000"]
      },
      { address: contractAddress, abi: gardenSignalAbi, functionName: "totalSprouts" },
      { address: contractAddress, abi: gardenSignalAbi, functionName: "totalBlooms" },
      { address: contractAddress, abi: gardenSignalAbi, functionName: "totalBreezes" }
    ],
    [address]
  );

  const {
    data: countData,
    refetch,
    isFetching
  } = useReadContracts({
    contracts: reads,
    query: {
      enabled: isContractConfigured,
      refetchInterval: 12000
    }
  });

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract({
    mutation: {
      onMutate() {
        setActivity("Pending");
      },
      onError(error) {
        console.error("Garden transaction failed", error);
        const message = safeStatus(error);
        setActivity(message);
        setLastAction(message);
      },
      onSuccess() {
        setActivity("Pending");
        setLastAction("Transaction submitted");
      }
    }
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    query: {
      enabled: Boolean(hash),
      refetchInterval: 2000
    }
  });

  useEffect(() => {
    if (isConfirmed) {
      setActivity("Confirmed");
      setLastAction("Confirmed");
      void refetch();
    }
  }, [isConfirmed, refetch]);

  useEffect(() => {
    if (isReceiptError) {
      setActivity("Network busy. Try again soon.");
      setLastAction("Network busy. Try again soon.");
    }
  }, [isReceiptError]);

  const stats = [
    {
      label: "Sprouts",
      mine: numberText(countData?.[0]?.result),
      total: numberText(countData?.[3]?.result),
      icon: Sprout
    },
    {
      label: "Blooms",
      mine: numberText(countData?.[1]?.result),
      total: numberText(countData?.[4]?.result),
      icon: Flower2
    },
    {
      label: "Breezes",
      mine: numberText(countData?.[2]?.result),
      total: numberText(countData?.[5]?.result),
      icon: Waves
    }
  ];

  function connectWallet(connector: Connector) {
    setWalletOpen(false);
    setActivity("Opening wallet");
    connect({ connector });
  }

  function openWalletOption(option: WalletOption) {
    if (option.connector) {
      connectWallet(option.connector);
      return;
    }

    setActivity(`${option.label} is not available in this browser.`);
  }

  function handleAction(action: GardenAction) {
    if (!isConnected) {
      setActivity("Connect a wallet first.");
      return;
    }

    if (!isContractConfigured) {
      setActivity("Contract address needed before launch.");
      return;
    }

    setLastAction(action.label);
    writeContract(
      {
        address: contractAddress,
        abi: gardenSignalAbi,
        functionName: action.method,
        args: [],
        dataSuffix: attributionDataSuffix
      },
      {
        onSuccess() {
          void refetch();
        },
        onSettled() {
          setTimeout(() => void refetch(), 2500);
        }
      }
    );
  }

  const connectedLabel = isConnected ? "Connected" : "Disconnected";
  const isBusy = isWritePending || isConfirming;
  const connectorByType = (type: string) => connectors.find((connector) => connector.type === type);
  const walletCandidates: Array<Omit<WalletOption, "connector"> & { connector?: Connector }> = [
    {
      id: "base-account",
      label: "Base Account",
      badge: "Base",
      connector: connectorByType("baseAccount")
    },
    {
      id: "coinbase",
      label: "Coinbase Wallet",
      badge: "Base",
      connector: connectorByType("coinbaseWallet")
    },
    {
      id: "metamask",
      label: "MetaMask",
      badge: "Base",
      connector: connectorByType("metaMask")
    },
    {
      id: "browser",
      label: "Browser Wallet",
      badge: "Injected",
      connector: connectorByType("injected")
    }
  ];
  const walletOptions = walletCandidates.filter((option): option is WalletOption => Boolean(option.connector));

  if (walletConnectProjectId) {
    const walletConnectConnector = connectorByType("walletConnect");
    if (walletConnectConnector) {
      walletOptions.splice(3, 0, {
        id: "walletconnect",
        label: "WalletConnect",
        badge: "QR",
        connector: walletConnectConnector
      });
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7d7_0,#f8f5ed_28%,#e7f0e6_58%,#d7e8dc_100%)] px-4 py-4 text-[#20372d] sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="relative z-[100] flex flex-col gap-3 rounded-lg border border-white/70 bg-white/72 p-4 shadow-sensor backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-leaf text-white">
              <Leaf size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Base Mini App</p>
              <h1 className="text-2xl font-black sm:text-3xl">Garden Signal</h1>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-leaf/20 bg-white px-3 py-2 text-sm font-semibold">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-leaf" : "bg-clay"}`} />
              {connectedLabel}
            </div>
            <div className="rounded-lg border border-leaf/20 bg-white px-3 py-2 text-sm font-semibold">
              {shortAddress(address)}
            </div>
            {isConnected ? (
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-clay/30 bg-white text-clay transition hover:bg-clay hover:text-white"
                title="Disconnect wallet"
                type="button"
                onClick={() => disconnect()}
              >
                <Power size={18} />
              </button>
            ) : (
              <button
                className="flex h-10 items-center gap-2 rounded-lg bg-baseblue px-4 text-sm font-bold text-white transition hover:brightness-95"
                type="button"
                onClick={() => setWalletOpen((value) => !value)}
              >
                {isConnectPending ? <Loader2 className="animate-spin" size={16} /> : <Radio size={16} />}
                Connect Wallet
                <ChevronDown size={15} />
              </button>
            )}
            {walletOpen && (
              <>
                <button
                  aria-label="Close wallet menu"
                  className="fixed inset-0 z-[900] cursor-default bg-transparent"
                  type="button"
                  onClick={() => setWalletOpen(false)}
                />
                <div className="absolute right-0 top-12 z-[1000] w-64 rounded-lg border border-leaf/20 bg-white p-2 shadow-sensor">
                  {walletOptions.map((option) => (
                    <button
                      className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-bold transition hover:bg-linen"
                      key={option.id}
                      type="button"
                      onClick={() => openWalletOption(option)}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      <span className="text-xs text-leaf">{option.badge}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[390px] overflow-hidden rounded-lg border border-white/80 bg-linen p-5 shadow-sensor">
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#b98865]/45 to-transparent" />
            <div className="absolute left-6 right-6 top-24 h-2 rounded-full bg-baseblue/15">
              <div className="h-full w-2/3 rounded-full bg-baseblue" />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Botanical Sensor Garden</p>
                  <h2 className="mt-2 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
                    Live signals for soil, bloom heat, and clean airflow.
                  </h2>
                </div>
                <div className="hidden rounded-lg border border-leaf/20 bg-white/75 p-3 text-right text-sm font-bold sm:block">
                  <p className="text-xs uppercase tracking-[0.14em] text-clay">Network</p>
                  <p>{chain?.name ?? "Base"}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Soil", "72%", "bg-leaf"],
                  ["Canopy", "Warm", "bg-sunlight"],
                  ["Air Rail", "Open", "bg-baseblue"]
                ].map(([label, value, color]) => (
                  <div className="rounded-lg border border-white/80 bg-white/78 p-3 backdrop-blur" key={label}>
                    <div className="mb-3 h-24 rounded-md bg-gradient-to-b from-white to-[#dfebd8] p-2">
                      <div className={`h-full rounded-md ${color}`} style={{ opacity: 0.72 }} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">{label}</p>
                    <p className="text-xl font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <section className="rounded-lg border border-white/75 bg-white/80 p-4 shadow-sensor backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Onchain Actions</p>
                  <h2 className="text-2xl font-black">Signal Controls</h2>
                </div>
                {isBusy && <Loader2 className="animate-spin text-baseblue" size={22} />}
              </div>
              <div className="grid gap-3">
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      className={`flex min-h-16 w-full items-center justify-between rounded-lg px-4 py-3 text-left font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${action.accent}`}
                      disabled={isBusy || !isContractConfigured}
                      key={action.id}
                      type="button"
                      onClick={() => handleAction(action)}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={22} />
                        <span>
                          <span className="block">{action.label}</span>
                          <span className="block text-xs font-bold opacity-75">{action.helper}</span>
                        </span>
                      </span>
                      <Activity size={20} />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-white/75 bg-white/82 p-4 shadow-sensor backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-black">Last Transaction</h2>
                <span className="rounded-md bg-linen px-2 py-1 text-xs font-bold text-leaf">
                  {isFetching ? "Refreshing" : "Live"}
                </span>
              </div>
              <div className="grid gap-2 text-sm font-semibold">
                <div className="flex justify-between gap-3 rounded-md bg-linen p-3">
                  <span>Status</span>
                  <span>{activity}</span>
                </div>
                <div className="flex justify-between gap-3 rounded-md bg-linen p-3">
                  <span>Recent Activity</span>
                  <span>{lastAction}</span>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article className="rounded-lg border border-white/80 bg-white/82 p-4 shadow-sensor" key={stat.label}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-linen text-leaf">
                    <Icon size={21} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-clay">{stat.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-linen p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf">My {stat.label}</p>
                    <p className="mt-1 text-3xl font-black">{stat.mine}</p>
                  </div>
                  <div className="rounded-md bg-linen p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-baseblue">Total {stat.label}</p>
                    <p className="mt-1 text-3xl font-black">{stat.total}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-white/80 bg-[#2f7d52] p-4 text-white shadow-sensor">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Wallet Status</p>
            <p className="mt-2 text-2xl font-black">{connectedLabel}</p>
            <p className="mt-2 text-sm font-semibold text-white/82">{shortAddress(address)}</p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white/82 p-4 shadow-sensor">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Sensor Notes</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-md bg-linen p-3 text-sm font-bold">No token required</div>
              <div className="rounded-md bg-linen p-3 text-sm font-bold">Base gas only</div>
              <div className="rounded-md bg-linen p-3 text-sm font-bold">Three write actions</div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
