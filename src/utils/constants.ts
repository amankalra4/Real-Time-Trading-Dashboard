export const DATA_INTERVAL_MS = 50;

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

export const _24HOUR_PERCENT_CHANGE_INITIAL_VALUE = {
  BTCUSD: { value: "+2.34%", isPositive: true },
  ETHUSD: { value: "-1.12%", isPositive: false },
  XRPUSD: { value: "+0.89%", isPositive: true },
  SOLUSD: { value: "+5.67%", isPositive: true },
  PAXGUSD: { value: "-0.32%", isPositive: false },
  DOGEUSD: { value: "+3.21%", isPositive: true },
} as const;

export const NO_VALUE = "---";
