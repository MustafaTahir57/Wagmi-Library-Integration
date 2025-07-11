import React, { useEffect, useState } from "react";
import {
  useConnect,
  useAccount,
  useBalance,
  useDisconnect,
  useChainId,
  useSwitchChain,
  useSignMessage,
} from "wagmi";
import "./walletConnect.css";
import { walletConnect } from "wagmi/connectors";
import { useConnectorClient } from "wagmi";
import { bscTestnet } from "../chains";

const WalletConnect = () => {
  const chainId = useChainId();

  const { connect, connectors } = useConnect();
  const { data: client } = useConnectorClient();
  const { address, isConnected, chain, connector } = useAccount();
  const {
    switchChain,
    chains,
    error: switchError,
    isPending: switching,
  } = useSwitchChain();
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
  const {
    data: signature,
    isSuccess,
    isError,
    signMessage,
    variables,
    errorSignInMessage,
  } = useSignMessage();

  console.log("Connectors", connectors);
  console.log("Account", address);

  const [showModal, setshowModal] = useState(false);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  console.log("Connectors", connectors);

  useEffect(() => {
    if (!chain?.id) return;
    console.log("🔄 Chain changed ->", chain?.id);
  }, [chain?.id]);

  console.log("Chain ID", chain?.id);
  console.log("Balance", { balance });

  useEffect(() => {
    const ensureBscTestnet = async () => {
      if (isConnected && chainId !== bscTestnet.id) {
        try {
          console.log("⚠️ Not on BSC Testnet. Switching...");
          await switchChain({ chainId: bscTestnet.id });
          console.log("✅ Switched to BSC Testnet");
        } catch (err) {
          console.error("❌ Failed to switch network:", err);
        }
      }
    };

    ensureBscTestnet();
  }, [isConnected, chainId]);

  const signInMessage = () => {
    const message = "Sign this message to authenticate with Quecko"; // Customize this securely
    signMessage({ message });
  };

  const truncateSignature = (sig) => {
    if (!sig) return "";
    return `${sig.slice(0, 6)}...${sig.slice(-4)}`;
  };

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
                onClick={async () => {
                  const connector = isMobile
                    ? connectors.find((c) => c.id === "metaMaskSDK")
                    : connectors.find((c) => c.id === "metaMaskSDK");

                  console.log("Connector Clicked", connector);

                  if (!connector) {
                    alert(
                      "Connector not found. Please ensure the wallet is installed."
                    );
                    return;
                  }

                  await connect({ connector });

                  console.log(
                    "Chain Id after connecting the wallet",
                    chain?.id
                  );
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
        <>
          <button className="disconnect-button" onClick={() => signInMessage()}>
            Sign In With Quecko
          </button>{" "}
          <br />
          {isSuccess && (
            <div>
              ✅ Signed Message:
              <br />
              <p>Signature: {truncateSignature(signature)}</p>
            </div>
          )}
          {isError && <div>❌ Error: {error?.message}</div>}
          <br />
          <button className="disconnect-button" onClick={() => disconnect()}>
            Disconnect
          </button>
        </>
      )}
    </div>
  );
};

export default WalletConnect;
