import { useEffect } from "react";
import { socketManager } from "./services/websocket";
import { useStore } from "./store";
import Header from "./components/Header";
import { CONNECTION_STATUS } from "./utils/constants";
import OrderBook from "./components/OrderBook";
import TradesFeed from "./components/TradesFeed";

function App() {
  const connectionStatus = useStore((state) => state.connectionStatus);
  const isConnected = connectionStatus === CONNECTION_STATUS.CONNECTED;

  useEffect(() => {
    socketManager.connect();

    return () => {
      socketManager.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen w-full flex-col bg-[#0a0e17] text-gray-100 font-mono overflow-hidden">
      <div
        className={`flex h-7 items-center justify-between p-4 ${isConnected ? "bg-green-950" : "bg-red-950"}`}
      >
        <div className="flex items-center gap-2 text-sm capitalize">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          ></span>
          {isConnected
            ? CONNECTION_STATUS.CONNECTED
            : CONNECTION_STATUS.DISCONNECTED}
        </div>
      </div>
      <Header />
      <div className="flex flex-1 p-4 gap-4">
        <OrderBook />
        <TradesFeed />
      </div>
    </div>
  );
}

export default App;
