export interface ITickerResponse {
  funding_rate: string;
  last_price: string;
  mark_price: string;
  open_interest: number;
  symbol: string;
  timestamp: number;
  turnover_24h: number;
  type: "v2/ticker";
  volume_24h: number;
}

export type IOrderBook = [string, string];

export interface IOrderBookResponse {
  asks: IOrderBook[];
  bids: IOrderBook[];
  symbol: string;
  type: "l2_orderbook";
  timestamp: number;
}

export interface IAllTradesResponse {
  buyer_role: "maker" | "taker";
  price: string;
  product_id: number;
  seller_role: "maker" | "taker";
  size: number;
  symbol: string;
  timestamp: number;
  type: "all_trades";
}
