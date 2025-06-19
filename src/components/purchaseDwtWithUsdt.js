import React, { useEffect, useState } from "react";
import { formatEther } from "viem";
import {
  useUSDTBalance,
  useDwtBalance,
  usePreviewUSDT,
  useReferrer,
  useUsdtApproval,
  useBuyTokensWithUSDT,
} from "../utils/useContract";
import toast from "react-hot-toast";

const PurchaseDwtWithUsdt = () => {
  const [tokenAmount, setTokenAmount] = useState("");
  const { balanceDwt, refetchDwt } = useDwtBalance();
  const { referrer, isLoading: refLoading } = useReferrer();
  const { balanceUsdt, refetchUsdt } = useUSDTBalance();
  const { USDTValueWei, USDTValueEth, isLoading, isError } =
    usePreviewUSDT(tokenAmount);
  const {
    allowance,
    approveUSDT,
    approvalLoading,
    approvalSuccess,
    refetchAllowance,
    txApprovalHash,
    approvalConfirmed,
  } = useUsdtApproval(USDTValueWei);

  const { buyTokensWithUSDT, txLoading, txSuccess } = useBuyTokensWithUSDT();

  const handlePurchase = async () => {
    if (!USDTValueWei || !tokenAmount) return;

    console.log("Allowance", allowance);

    // Step 1: Check allowance
    if (allowance < USDTValueWei) {
      approveUSDT(); // Step 2: Approve USDT
      return;
    }
    buyTokensWithUSDT({
      tokenAmount,
      referrer: referrer || "0x0000000000000000000000000000000000000000",
    });
  };

  useEffect(() => {
    if (approvalConfirmed) {
      // ✅ Approval confirmed, now auto call buyTokens
      buyTokensWithUSDT({
        tokenAmount,
        referrer: referrer || "0x0000000000000000000000000000000000000000",
      });
    }
  }, [approvalConfirmed]);

  useEffect(() => {
    console.log("Allowance", allowance);
    if (txApprovalHash) {
      refetchAllowance();
      console.log("Allowance", allowance);
    }
  }, [txApprovalHash]);

  useEffect(() => {
    if (txSuccess) {
      console.log("Tokens bought successfully!");
      toast.success("Token Bought With USDT");
      refetchDwt();
      refetchUsdt();
      refetchAllowance();
    }
  }, [txSuccess]);

  return (
    <div className="purchase-container">
      <h2>Purchase DWT Tokens WITH USDT</h2>

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
        <label htmlFor="bnbValue">USDT Value (auto-fetched):</label>
        <input
          type="number"
          id="bnbValue"
          value={USDTValueEth}
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
        // disabled={isPending || txLoading}
      >
        {/* {txLoading ? "Processing..." : "Purchase"} */}
        Purchase With USDT
      </button>

      <p>
        <strong>DWT Balance:</strong>{" "}
        {balanceDwt ? formatEther(balanceDwt) : "0"} DWT
      </p>

      <p>
        <strong>USDT Balance:</strong>{" "}
        {balanceUsdt ? formatEther(balanceUsdt) : "0"} DWT
      </p>
    </div>
  );
};

export default PurchaseDwtWithUsdt;
