import type {
  ITickerResponse,
  IOrderBookResponse,
  ITickerKeys,
  IAllTradesResponse,
} from "../types";

type IConnectionStatus = "connected" | "disconnected";

export interface AppState {
  connectionStatus: IConnectionStatus;
  focusedSymbol: ITickerKeys;
  grouping: number;

  tickers: Record<ITickerKeys, ITickerResponse>;
  orderBook: IOrderBookResponse | null;
  trades: IAllTradesResponse[];

  setConnectionStatus: (status: AppState["connectionStatus"]) => void;
  updateTickers: (newTickers: Record<ITickerKeys, ITickerResponse>) => void;
  setFocusedSymbol: (symbol: ITickerKeys) => void;
  setGrouping: (grouping: number) => void;
  updateOrderBook: (ob: IOrderBookResponse) => void;
  clearFocusedData: () => void;
}
