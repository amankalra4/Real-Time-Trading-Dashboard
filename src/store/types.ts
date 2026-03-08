import type {
  ITickerResponse,
  IOrderBookResponse,
  IAllTradesResponse,
} from "../types";

type IConnectionStatus = "connected" | "disconnected";

export interface AppState {
  connectionStatus: IConnectionStatus;
  focusedSymbol: string;

  tickers: Record<string, ITickerResponse>;
  orderBook: IOrderBookResponse | null;
  trades: IAllTradesResponse[];

  setConnectionStatus: (status: AppState["connectionStatus"]) => void;
  updateTickers: (newTickers: Record<string, ITickerResponse>) => void;
}
