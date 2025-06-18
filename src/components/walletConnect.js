import React, { useEffect, useState } from "react";
import {
  useConnect,
  useAccount,
  useBalance,
  useDisconnect,
  useChainId,
} from "wagmi";
import "./walletConnect.css";
import { walletConnect } from "wagmi/connectors";
import { useConnectorClient } from "wagmi";

const WalletConnect = () => {
  const chainId = useChainId();

  const { connect, connectors } = useConnect();
  const { data: client } = useConnectorClient();
  const { address, isConnected, chain, connector } = useAccount();
  const {
    data: balance,
    isLoading,
    error,
  } = useBalance({
    address,
    chainId: chain?.id, // ✅ This ensures it refetches on chain switch
    watch: true, // optional: refetch on every block
  });

  const { disconnect } = useDisconnect();

  console.log("Connectors", connectors);
  console.log("Account", address)

  const [showModal, setshowModal] = useState(false);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  console.log("Connectors", connectors);

  // useEffect(() => {
  //   if (!connector) return;

  //   console.log("Connected via:", connector.id);

  //   if (connector.id === "walletConnect") {
  //     connector.getProvider().then((provider) => {
  //       const isV1 = !!provider.bridge; // Only v1 has bridge key
  //       console.log("WalletConnect Version:", isV1 ? "v1" : "v2");
  //     });
  //   }
  // }, [connector]);

  useEffect(() => {
    if (!chain?.id) return;
    console.log("🔄 Chain changed ->", chain?.id);
  }, [chain?.id]);

  console.log("Chain ID", chain?.id);

  // const detectInjectedWallets = () => {
  //   if (typeof window === "undefined" || !window.ethereum) {
  //     return [];
  //   }

  //   const walletSet = new Set(); // Use Set to automatically avoid duplicates
  //   const provider = window.ethereum;
  //   const providers = provider.providers || [provider];

  //   providers.forEach((prov) => {
  //     if (prov.isMetaMask) walletSet.add("MetaMask");
  //     if (prov.isTrust) walletSet.add("Trust Wallet");
  //     if (prov.isCoinbaseWallet) walletSet.add("Coinbase Wallet");
  //     if (prov.isFrame) walletSet.add("Frame");
  //     if (prov.isTally) walletSet.add("Tally");
  //     if (prov.isBraveWallet) walletSet.add("Brave Wallet");
  //     if (prov.isRabby) walletSet.add("Rabby Wallet");

  //     // ✅ Detect WalletConnect version
  //     if (prov.isWalletConnect) {
  //       const isV1 = !!prov.bridge;
  //       walletSet.add(`WalletConnect ${isV1 ? "v1" : "v2"}`);
  //     }
  //   });

  //   const wallets = Array.from(walletSet); // Convert Set to Array
  //   console.log("All wallets Installed", wallets);

  //   return wallets;
  // };

  console.log("Balance", { balance });

  // useEffect(() => {
  //   const installedWallets = detectInjectedWallets();
  //   console.log("Detected Wallets:", installedWallets);
  // }, []);

  return (
    <div className="wallet-container">
      {!isConnected ? (
        <div className="connect-section">
          <button
            className="connect-button"
            onClick={() => setshowModal((prev) => !prev)}
          >
            Connect Wallet
          </button>

          {showModal && (
            <div className="wallet-modal">
              <button
                className="wallet-option"
                onClick={() => {
                  const connector = isMobile
                    ? connectors.find((c) => c.id === "walletConnect")
                    : connectors.find((c) => c.id === "metaMaskSDK");

                  console.log("Connector Clicked", connector);

                  if (!connector) {
                    alert(
                      "Connector not found. Please ensure the wallet is installed."
                    );
                    return;
                  }

                  connect({ connector });
                }}
              >
                MetaMask
              </button>

              <button
                className="wallet-option"
                onClick={() => {
                  const connector = isMobile
                    ? connectors.find((c) => c.id === "walletConnect")
                    : connectors.find((c) => c.id === "injected");
                  console.log("Connector Clicked", connector);
                  connect({ connector });
                }}
              >
                Trust Wallet
              </button>

              <button
                className="wallet-option"
                onClick={() => {
                  connect({
                    connector: connectors.find((c) => c.id === "walletConnect"),
                  });
                }}
              >
                WalletConnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="wallet-info">
          <p>
            <strong>Connected Address:</strong> {address}
          </p>
          <p>
            <strong>Chain ID:</strong> {chain?.id}
          </p>
          {isLoading ? (
            <p>Loading balance...</p>
          ) : error ? (
            <p>Error fetching balance</p>
          ) : (
            <p>
              Balance: {balance?.formatted} {balance?.symbol}
            </p>
          )}
        </div>
      )}

      {isConnected && (
        <button className="disconnect-button" onClick={() => disconnect()}>
          Disconnect
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
