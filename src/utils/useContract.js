import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import { useAccount, useConfig } from "wagmi";
import { ICO_ADDRESS, ICO_ABI } from "../contracts/ICO";
import { Dwt_ABI, Dwt_ADDRESS } from "../contracts/Dwt";
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
      // const estimatedGas = await estimateGas(config, {
      //   account: address,
      //   abi: ICO_ABI,
      //   address: ICO_ADDRESS,
      //   functionName: "buyTokens",
      //   args: [
      //     tokenAmountWithDecimals,
      //     "0",
      //     referrer ?? "0x0000000000000000000000000000000000000000",
      //   ],
      //   value: totalValue.toString(),
      //   // chainId: 56, // ✅ OPTIONAL but recommended
      // });

      // const bufferedGas = (estimatedGas * 150n) / 100n;

      // console.log("Buffered Gas", bufferedGas, typeof totalValue);

      writeContract({
        abi: ICO_ABI,
        address: ICO_ADDRESS,
        functionName: "buyTokens",
        args: [
          tokenAmountWithDecimals,
          "0",
          referrer || "0x0000000000000000000000000000000000000000",
        ],
        value: totalValue.toString(),
        // gas: bufferedGas,
      });
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
