import { useStore } from "../store";
import type {
  ITickerResponse,
  IOrderBookResponse,
  IAllTradesResponse,
  ITickerKeys,
} from "../types";
import {
  CONNECTION_STATUS,
  CRYPTO_ITEMS,
  DATA_UPDATE_INTERVAL_MS,
  INTERVAL_TYPES,
  SUBSCRIBE_KEY,
  UNSUBSCRIBE_KEY,
  WEBSOCKET_URL,
} from "../utils/constants";

class WebSocketManager {
  private socket: WebSocket | null = null;
  private tickerData = new Map<ITickerKeys, ITickerResponse>();
  private latestOrderBook: IOrderBookResponse | null = null;
  private tradesBuffer: IAllTradesResponse[] = [];
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  public connect() {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.CONNECTING ||
        this.socket.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.socket = new WebSocket(WEBSOCKET_URL);

    this.socket.onopen = () => {
      useStore.getState().setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      this.subscribeToAll();
      this.updateDataWithIntervals();
    };

    this.socket.onmessage = (event) =>
      this.handleMessage(JSON.parse(event.data));

    this.socket.onclose = () => {
      useStore.getState().setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      this.clearDataInterval();
    };

    this.socket.onerror = (err) => console.error("[WS] Error:", err);
  }

  private subscribeToAll() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const currentSymbol = useStore.getState().focusedSymbol;

    const payload = {
      type: "subscribe",
      payload: {
        channels: [
          { name: INTERVAL_TYPES.TICKER, symbols: CRYPTO_ITEMS },
          { name: INTERVAL_TYPES.ORDERBOOK, symbols: [currentSymbol] },
          { name: INTERVAL_TYPES.TRADES, symbols: [currentSymbol] },
        ],
      },
    };
    this.socket.send(JSON.stringify(payload));
  }

  private updateDataWithIntervals() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      const store = useStore.getState();

      if (this.tickerData.size > 0) {
        store.updateTickers(Object.fromEntries(this.tickerData) as Record<ITickerKeys, ITickerResponse>);
        this.tickerData.clear();
      }

      if (this.latestOrderBook) {
        store.updateOrderBook(this.latestOrderBook);
        this.latestOrderBook = null;
      }

      if (this.tradesBuffer.length > 0) {
        store.addTrades([...this.tradesBuffer]);
        this.tradesBuffer = [];
      }
    }, DATA_UPDATE_INTERVAL_MS);
  }

  private handleMessage(data: ITickerResponse | IOrderBookResponse | IAllTradesResponse) {
    switch (data.type) {
      case INTERVAL_TYPES.TICKER:
        this.tickerData.set(data.symbol, data);
        break;
      case INTERVAL_TYPES.ORDERBOOK:
        this.latestOrderBook = data;
        break;
      case INTERVAL_TYPES.TRADES:
        this.tradesBuffer.unshift(data);
        break;
      default:
        break;
    }
  }

  private clearDataInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public changeSymbol(newSymbol: ITickerKeys) {
    const store = useStore.getState();
    const oldSymbol = store.focusedSymbol;
    if (
      oldSymbol === newSymbol ||
      !this.socket ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    store.clearFocusedData();
    this.latestOrderBook = null;
    this.tradesBuffer = [];

    this.socket.send(
      JSON.stringify({
        type: UNSUBSCRIBE_KEY,
        payload: {
          channels: [
            { name: INTERVAL_TYPES.ORDERBOOK, symbols: [oldSymbol] },
            { name: INTERVAL_TYPES.TRADES, symbols: [oldSymbol] }
          ],
        },
      }),
    );

    store.setFocusedSymbol(newSymbol);

    this.socket.send(
      JSON.stringify({
        type: SUBSCRIBE_KEY,
        payload: {
          channels: [
            { name: INTERVAL_TYPES.ORDERBOOK, symbols: [newSymbol] },
            { name: INTERVAL_TYPES.TRADES, symbols: [newSymbol] }
          ],
        },
      }),
    );
  }

  public disconnect() {
    this.clearDataInterval();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const socketManager = new WebSocketManager();
