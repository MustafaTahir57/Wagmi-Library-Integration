import React, { useState, useEffect } from "react";
import "./purchaseDwt.css";
import { usePreviewBNB, useBuyTokens } from "../utils/useContract";
import { useReferrer } from "../utils/useContract";
import { useDwtBalance } from "../utils/useContract";
import { formatEther, parseUnits } from "viem";
import toast from "react-hot-toast";

const PurchaseDwt = () => {
  const [tokenAmount, setTokenAmount] = useState("");

  const { bnbValueEth, bnbValueWei, isLoading, isError } =
    usePreviewBNB(tokenAmount);
  const { referrer, isLoading: refLoading } = useReferrer();
  const { buyTokens, isPending, txLoading, txSuccess } = useBuyTokens();
  const { balanceDwt , refetchDwt  } = useDwtBalance();

  const handlePurchase = () => {
    buyTokens({
      referrer: referrer || "0x0000000000000000000000000000000000000000",
      bnbValue: bnbValueEth, // should be BigInt in WEI
      tokenAmount: tokenAmount, // should be integer or BigInt
    });
  };

  useEffect(() => {
    if (txSuccess) {
      console.log("Tokens bought successfully!");
      toast.success("Token Bought");
       refetchDwt();
    }
  }, [txSuccess]);

  console.log("Bnb Value ", bnbValueEth, bnbValueWei);
  console.log("Refferer", referrer);

  return (
    <div className="purchase-container">
      <h2>Purchase DWT Tokens</h2>

      <div className="form-group">
        <label htmlFor="tokenAmount">Tokens to Purchase:</label>
        <input
          type="number"
          id="tokenAmount"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
          placeholder="Enter token amount"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bnbValue">BNB Value (auto-fetched):</label>
        <input
          type="number"
          id="bnbValue"
          value={
            isLoading
              ? "Loading..."
              : isError
              ? "Error fetching BNB"
              : bnbValueEth.toFixed(6)
          }
          readOnly
          disabled
          placeholder="Will be auto-calculated"
        />
      </div>

      <div className="form-group">
        <label>Referrer:</label>
        <input
          className="input"
          type="text"
          value={
            refLoading ? "Checking..." : referrer ? referrer : "No referrer"
          }
          readOnly
        />
      </div>

      <button
        className="btn"
        onClick={handlePurchase}
        disabled={isPending || txLoading}
      >
        {txLoading ? "Processing..." : "Purchase"}
      </button>

      <p>
        <strong>DWT Balance:</strong> {balanceDwt ? formatEther(balanceDwt) : "0"} DWT
      </p>
    </div>
  );
};

export default PurchaseDwt;
