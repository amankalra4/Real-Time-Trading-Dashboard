import { create } from "zustand";
import type { AppState } from "./types";
import { CRYPTO_COINS_CONFIG, FOCUSED_SYMBOL_KEY, MAX_TRADES_ARRAY_LENGTH, TRADES_RETENTION_TIME_MS } from "../utils/constants";
import type { ITickerKeys, ITickerResponse } from "../types";

const initialSymbol = (localStorage.getItem(FOCUSED_SYMBOL_KEY) as ITickerKeys) || "BTCUSD";
const initialConfig = CRYPTO_COINS_CONFIG[initialSymbol] || CRYPTO_COINS_CONFIG.BTCUSD;

export const useStore = create<AppState>((set) => ({
  connectionStatus: "disconnected",
  focusedSymbol: initialSymbol,
  tickers: {} as Record<ITickerKeys, ITickerResponse>,
  orderBook: null,
  trades: [],

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  updateTickers: (newTickers) => {
    return set((state) => ({ tickers: { ...state.tickers, ...newTickers } }));
  },

  setFocusedSymbol: (symbol: ITickerKeys) => {
    localStorage.setItem(FOCUSED_SYMBOL_KEY, symbol);
    const config = CRYPTO_COINS_CONFIG[symbol] || CRYPTO_COINS_CONFIG.BTCUSD;

    set({
      focusedSymbol: symbol,
      grouping: config.defaultGroup,
      orderBook: null,
      trades: [],
    });
  },

  updateOrderBook: (orderBookData) => set({ orderBook: orderBookData }),

  addTrades: (newTrades) => {
    return set((state) => {
      const combined = [...newTrades, ...state.trades];
      const cutoffTime = Date.now() - TRADES_RETENTION_TIME_MS;
      const staleIndex = combined.findIndex((el) => el.timestamp < cutoffTime);

      if (staleIndex !== -1) {
        combined.length = staleIndex;
      }

      if (combined.length > MAX_TRADES_ARRAY_LENGTH) {
        combined.length = MAX_TRADES_ARRAY_LENGTH;
      }

      return { trades: combined };
    });
  },

  clearFocusedData: () => set({ orderBook: null }),

  grouping: initialConfig.defaultGroup,

  setGrouping: (grouping) => set({ grouping }),
}));
