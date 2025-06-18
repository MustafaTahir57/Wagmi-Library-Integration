import logo from "./logo.svg";
import "./App.css";
import WalletConnect from "./components/walletConnect";
import PurchaseDwt from "./components/purchaseDwt";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <div>
         <Toaster position="top-right" />
        <WalletConnect />
        <PurchaseDwt />
      </div>
    </>
  );
};

export default App;
