import { useStore } from "../store";
import type { ITickerResponse } from "../types";
import {
  CONNECTION_STATUS,
  CRYPTO_ITEMS,
  DATA_INTERVAL_MS,
  INTERVAL_TYPES,
  WEBSOCKET_URL,
} from "../utils/constants";

class WebSocketManager {
  private socket: WebSocket | null = null;
  private tickerData = new Map<string, ITickerResponse>();
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
        store.updateTickers(Object.fromEntries(this.tickerData));
        this.tickerData.clear();
      }
    }, DATA_INTERVAL_MS);
  }

  private handleMessage(data: ITickerResponse) {
    switch (data.type) {
      case INTERVAL_TYPES.TICKER:
        this.tickerData.set(data.symbol, data as ITickerResponse);
        break;
    }
  }

  private clearDataInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
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
