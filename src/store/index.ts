import { create } from "zustand";
import type { AppState } from "./types";

export const useStore = create<AppState>((set) => ({
  connectionStatus: "disconnected",
  focusedSymbol: localStorage.getItem("focusedSymbol") || "BTCUSD",
  tickers: {},
  orderBook: null,
  trades: [],

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  updateTickers: (newTickers) => {
    return set((state) => ({ tickers: { ...state.tickers, ...newTickers } }));
  }
}));
