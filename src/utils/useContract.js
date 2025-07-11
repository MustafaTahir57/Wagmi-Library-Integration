import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import { useAccount, useConfig } from "wagmi";
import { ICO_ADDRESS, ICO_ABI } from "../contracts/ICO";
import { Dwt_ABI, Dwt_ADDRESS } from "../contracts/Dwt";
import { USDT_ADDRESS, USDT_ABI } from "../contracts/Usdt";
import { estimateGas } from "wagmi/actions";
import { parseUnits } from "viem";
import { parseEther } from "viem";
import toast from "react-hot-toast";

export const usePreviewBNB = (tokenAmount) => {
  const enabled = !!tokenAmount && Number(tokenAmount) > 0;

  const { data, isPending, isError } = useReadContract({
    address: ICO_ADDRESS,
    abi: ICO_ABI,
    functionName: "previewBNB",
    args: [parseUnits(tokenAmount.toString(), 18)], // assuming token uses 18 decimals
    query: {
      enabled,
    },
  });

  return {
    bnbValueWei: data, // raw wei
    bnbValueEth: data ? Number(data) / 1e18 : 0,
    isLoading: isPending,
    isError,
  };
};

export const useReferrer = () => {
  const { address, isConnected } = useAccount();

  const { data, isLoading, isError } = useReadContract({
    abi: ICO_ABI,
    address: ICO_ADDRESS,
    functionName: "referrerOf",
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  });

  return {
    referrer: data,
    isLoading,
    isError,
  };
};

export const useDwtBalance = () => {
  const { address, isConnected } = useAccount();

  const {
    data: balanceDwt,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useReadContract({
    abi: Dwt_ABI,
    address: Dwt_ADDRESS,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address, // only call if address is available
  });

  return {
    balanceDwt,
    isLoading,
    error,
    refetchDwt: refetch,
    isFetchingDwt: isFetching,
  };
};

export const useBuyTokens = () => {
  const {
    data: hash,
    isPending,
    isSuccess,
    writeContract,
  } = useWriteContract();
  const { isLoading: txLoading, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({ hash });
  const { address, isConnected } = useAccount();
  const config = useConfig();

  //   const buyTokens = ({ referrer, bnbValue, tokenAmount }) => {
  //     const tokenAmountWithDecimals = parseUnits(tokenAmount.toString(), 18);
  //     writeContract({
  //       abi: ICO_ABI,
  //       address: ICO_ADDRESS,
  //       functionName: "buyTokens",
  //       args: [
  //         tokenAmountWithDecimals,
  //         "0", // paymentAsset (BNB)
  //         referrer || "0x0000000000000000000000000000000000000000",
  //       ],
  //       value: bnbValue, // value must be in wei (BigInt)
  //     });

  //     console.log("Hash ", hash);
  //   };

  const buyTokens = async ({ referrer, bnbValue, tokenAmount }) => {
    const tokenAmountWithDecimals = parseUnits(tokenAmount.toString(), 18);
    // Calculate value to send
    const baseValue = parseEther(bnbValue.toString()); // e.g. "0.0015"
    const buffer = parseEther("0.0003"); // extra buffer
    const totalValue = baseValue + buffer;

    console.log("Buffer and Base Value", buffer, baseValue, totalValue);

    try {
      const estimatedGas = await estimateGas(config, {
        account: address,
        abi: ICO_ABI,
        address: ICO_ADDRESS,
        functionName: "buyTokens",
        args: [
          tokenAmountWithDecimals,
          "0",
          referrer ?? "0x0000000000000000000000000000000000000000",
        ],
        value: totalValue.toString(),
        // chainId: 56, // ✅ OPTIONAL but recommended
      });

      const minGas = 300000n;
      const bufferedGas = (estimatedGas * 150n) / 100n;
      const finalGas = bufferedGas > minGas ? bufferedGas : minGas;

      console.log("Buffered Gas", bufferedGas, finalGas, typeof totalValue);

      const tx = await writeContract({
        abi: ICO_ABI,
        address: ICO_ADDRESS,
        functionName: "buyTokens",
        args: [
          tokenAmountWithDecimals,
          "0",
          referrer || "0x0000000000000000000000000000000000000000",
        ],
        value: totalValue.toString(),
        gas: finalGas, // The issue is here giving the wrong estimation
      });

      console.log("Tx", tx);
    } catch (error) {
      console.error("Gas estimation failed:", error);
    }
  };
  return {
    buyTokens,
    isPending,
    isSuccess,
    txLoading,
    txSuccess,
  };
};

export const useUSDTBalance = () => {
  const { address, isConnected } = useAccount();
  console.log("USDT ABI and USDT Adress", USDT_ABI, USDT_ADDRESS);

  const {
    data: balanceUsdt,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useReadContract({
    abi: USDT_ABI,
    address: USDT_ADDRESS,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address, // only call if address is available
  });

  return {
    balanceUsdt,
    isLoading,
    error,
    refetchUsdt: refetch,
    isFetchingUSDT: isFetching,
  };
};

export const usePreviewUSDT = (tokenAmount) => {
  const enabled = !!tokenAmount && Number(tokenAmount) > 0;

  const { data, isPending, isError } = useReadContract({
    address: ICO_ADDRESS,
    abi: ICO_ABI,
    functionName: "previewUSDT",
    args: [parseUnits(tokenAmount.toString(), 18)], // assuming token uses 18 decimals
    query: {
      enabled,
    },
  });

  return {
    USDTValueWei: data, // raw wei
    USDTValueEth: data ? Number(data) / 1e18 : 0,
    isLoading: isPending,
    isError,
  };
};

export const useUsdtApproval = (amountToSpend) => {
  const { address } = useAccount();

  // 1️⃣ Read allowance
  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: allowanceLoading,
    isError: allowanceError,
  } = useReadContract({
    abi: USDT_ABI,
    address: USDT_ADDRESS,
    functionName: "allowance",
    args: [address, ICO_ADDRESS],
    enabled: !!address,
  });

  // 2️⃣ Prepare write for approve()
  const {
    writeContract,
    data: txApprovalHash,
    isPending: isApproving,
    isSuccess: writeSuccess,
  } = useWriteContract();

  const approveUSDT = () => {
    if (!amountToSpend || !address) return;
    writeContract({
      abi: USDT_ABI,
      address: USDT_ADDRESS,
      functionName: "approve",
      args: [ICO_ADDRESS, amountToSpend],
    });
  };

  // 3️⃣ Wait for approve tx to confirm
  const { isLoading: approvalTxLoading, isSuccess: approvalConfirmed } =
    useWaitForTransactionReceipt({ hash: txApprovalHash }); // Waiting for the transaction to be confirmed providing the txHash (When you send a transaction (e.g. approve()), you immediately get a txHash. But the transaction isn’t complete until it’s mined and confirmed on-chain.)

  // 4️⃣ Auto-refetch allowance after approval is confirmed
  if (approvalConfirmed) {
    refetchAllowance?.();
  }

  return {
    allowance,
    allowanceLoading,
    allowanceError,
    approveUSDT,
    refetchAllowance,
    approvalTxLoading,
    approvalConfirmed,
    isApproving,
    writeSuccess,
    txApprovalHash,
  };
};

export const useBuyTokensWithUSDT = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess,
  } = useWriteContract();

  const {
    isLoading: txLoading,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({ hash }); // React hooks like useWaitForTransactionReceipt are reactive — they’ll re-run automatically when hash becomes available (after calling writeContract()).

  const buyTokensWithUSDT = ({ tokenAmount, referrer }) => {
    if (!tokenAmount) return;

    const tokenAmountWithDecimals = parseUnits(tokenAmount.toString(), 18);

    writeContract({
      abi: ICO_ABI,
      address: ICO_ADDRESS,
      functionName: "buyTokens",
      args: [
        tokenAmountWithDecimals,
        "2", // paymentAsset = USDT
        referrer || "0x0000000000000000000000000000000000000000",
      ],
      value: 0n, // No BNB is sent
    });
  };

  return {
    buyTokensWithUSDT,
    isPending,
    isSuccess,
    txLoading,
    txSuccess,
    txError,
  };
};
