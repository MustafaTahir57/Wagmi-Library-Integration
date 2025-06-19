import logo from "./logo.svg";
import "./App.css";
import WalletConnect from "./components/walletConnect";
import PurchaseDwt from "./components/purchaseDwt";
import { Toaster } from "react-hot-toast";
import PurchaseDwtWithUsdt from "./components/purchaseDwtWithUsdt";

const App = () => {
  return (
    <>
      <div>
        <Toaster position="top-right" />
        <WalletConnect />
        <PurchaseDwt />
        <PurchaseDwtWithUsdt />
      </div>
    </>
  );
};

export default App;
