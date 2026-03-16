import { create } from "zustand";
import type { AppState } from "./types";
import { CRYPTO_COINS_CONFIG, FOCUSED_SYMBOL_KEY } from "../utils/constants";
import type { ITickerKeys, ITickerResponse } from "../types";

const initialSymbol = (localStorage.getItem(FOCUSED_SYMBOL_KEY) as ITickerKeys) || "BTCUSD";
const initialConfig = CRYPTO_COINS_CONFIG[initialSymbol] || CRYPTO_COINS_CONFIG["BTCUSD"];

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
    const config = CRYPTO_COINS_CONFIG[symbol] || CRYPTO_COINS_CONFIG["BTCUSD"];

    set({
      focusedSymbol: symbol,
      grouping: config.defaultGroup,
      orderBook: null,
    });
  },

  updateOrderBook: (orderBookData) => set({ orderBook: orderBookData }),

  clearFocusedData: () => set({ orderBook: null }),

  grouping: initialConfig.defaultGroup,

  setGrouping: (grouping) => set({ grouping }),
}));
