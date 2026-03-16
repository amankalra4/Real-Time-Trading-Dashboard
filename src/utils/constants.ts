import type { ITickerKeys } from "../types";

export const DATA_UPDATE_INTERVAL_MS = 50;

export const WEBSOCKET_URL = "ws://localhost:8080";

export const CONNECTION_STATUS = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
} as const;

export const CRYPTO_ITEMS = [
  "BTCUSD",
  "ETHUSD",
  "XRPUSD",
  "SOLUSD",
  "PAXGUSD",
  "DOGEUSD",
] as const;

export const INTERVAL_TYPES = {
  TICKER: "v2/ticker",
  ORDERBOOK: "l2_orderbook",
  TRADES: "all_trades",
} as const;

export const _24HR_PERCENT_CHANGE_INITIAL_VALUE = {
  BTCUSD: { value: "+2.34%", isPositive: true },
  ETHUSD: { value: "-1.12%", isPositive: false },
  XRPUSD: { value: "+0.89%", isPositive: true },
  SOLUSD: { value: "+5.67%", isPositive: true },
  PAXGUSD: { value: "-0.32%", isPositive: false },
  DOGEUSD: { value: "+3.21%", isPositive: true },
} as const;

export const NO_VALUE = "---";

export const FOCUSED_SYMBOL_KEY = "focusedSymbol";

export const SUBSCRIBE_KEY = "subscribe";

export const UNSUBSCRIBE_KEY = "unsubscribe";

type ICryptoConfig = Record<
  ITickerKeys,
  { precision: number; groupings: number[]; defaultGroup: number }
>;

export const CRYPTO_COINS_CONFIG: ICryptoConfig = {
  BTCUSD: {
    precision: 1,
    groupings: [1, 5, 10, 50, 100, 500],
    defaultGroup: 10,
  },
  ETHUSD: {
    precision: 2,
    groupings: [0.5, 1, 5, 10, 50],
    defaultGroup: 1,
  },
  XRPUSD: {
    precision: 4,
    groupings: [0.0001, 0.001, 0.01, 0.1],
    defaultGroup: 0.001,
  },
  SOLUSD: {
    precision: 4,
    groupings: [0.01, 0.05, 0.1, 0.5, 1],
    defaultGroup: 0.1,
  },
  PAXGUSD: {
    precision: 2,
    groupings: [1, 5, 10, 50, 100],
    defaultGroup: 10,
  },
  DOGEUSD: {
    precision: 6,
    groupings: [0.000001, 0.00001, 0.0001, 0.001],
    defaultGroup: 0.0001,
  },
};

export const _10_PERCENT_CHANGE = 0.1;
