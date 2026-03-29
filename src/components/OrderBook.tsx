import { useMemo } from "react";
import { useStore } from "../store";
import { processOrderBook } from "../utils/orderbookMath";
import { CRYPTO_COINS_CONFIG } from "../utils/constants";
import CoinDetailsRow from "./CoinDetailsRow";
import { Virtuoso } from "react-virtuoso";
import './styles.css';

const OrderBook = () => {
  const focusedSymbol = useStore((state) => state.focusedSymbol);
  const rawOrderBook = useStore((state) => state.orderBook);
  const grouping = useStore((state) => state.grouping);
  const setGrouping = useStore((state) => state.setGrouping);
  const config = CRYPTO_COINS_CONFIG[focusedSymbol] || CRYPTO_COINS_CONFIG.BTCUSD;

  const { bids, asks } = useMemo(() => {
    if (!rawOrderBook || !config) {
      return { bids: [], asks: [] };
    }

    return processOrderBook(
      rawOrderBook.bids,
      rawOrderBook.asks,
      grouping,
      config.precision,
    );
  }, [rawOrderBook, grouping, config]);

  const { metrics, maximum } = useMemo(() => {
    if (bids.length === 0 || asks.length === 0) {
      return { metrics: null, maximum: 0 };
    }

    const maxBidTotal = bids[bids.length - 1].total;
    const maxAskTotal = asks[0].total;
    const maximum = Math.max(maxBidTotal, maxAskTotal);

    const bestBid = bids[0]?.price || 0;
    const bestAsk = asks[0]?.price || 0;
    const midPrice = (bestBid + bestAsk) / 2;
    const midPriceStr = midPrice.toFixed(2);
    
    const spread = (bestAsk - bestBid).toFixed(config?.precision || 2);
    const spreadBp = ((bestAsk - bestBid) / midPrice * 10000).toFixed(0);

    const visibleBidVolume = bids.slice(0, 20).reduce((sum, level) => sum + level.size, 0);
    const visibleAskVolume = asks.slice(0, 20).reduce((sum, level) => sum + level.size, 0);
    const imbalance = visibleAskVolume > 0 ? visibleBidVolume / visibleAskVolume : 1;

    return {
      metrics: {
        midPrice: midPriceStr,
        spread,
        spreadBp,
        imbalance,
      },
      maximum,
    };
  }, [bids, asks, config]);

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="flex justify-between items-center pb-2 border-b border-gray-800 mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-gray-100 font-bold text-lg flex items-center gap-2">
            Order Book - {focusedSymbol}
          </h2>
          <span className="text-[10px] font-bold tracking-wider bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Group:</span>
          <div className="flex bg-gray-900 rounded border border-gray-800 overflow-scroll">
            {config.groupings.map((groupNum) => (
              <button
                key={groupNum}
                onClick={() => setGrouping(groupNum)}
                className={
                  grouping === groupNum
                    ? "px-2.5 py-1 text-xs font-mono bg-blue-600 text-white outline-none"
                    : "px-2.5 py-1 text-xs font-mono text-gray-500 hover:text-gray-300 hover:bg-gray-800 outline-none transition-colors"
                }
              >
                {groupNum}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between px-4 py-2 text-xs font-mono text-gray-500 border-b border-gray-800 shrink-0">
        <div className="flex-1 text-left">
          Total ({focusedSymbol.replace("USD", "")})
        </div>
        <div className="flex-1 text-right pr-4">Size</div>
        <div className="flex-1 text-right">Price (USD)</div>
      </div>

      <div className="flex-1 w-full flex flex-col overflow-hidden">
        {asks.length > 0 && bids.length > 0 ? (
          <>
            <div className="flex-1">
              <Virtuoso
                className="virtualizedList"
                data={asks}
                initialTopMostItemIndex={Math.max(0, asks.length - 15)}
                itemContent={(_index, level) => (
                  <CoinDetailsRow level={level} type="ask" maximum={maximum} />
                )}
                computeItemKey={(_index, level) => `ask-${level.priceStr}`}
                overscan={5}
              />
            </div>

            <div className="flex justify-between items-center px-4 py-1.5 border-y border-gray-800 bg-gray-900/40">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-medium">
                  Mid Price
                </span>
                <span className="text-lg font-bold text-gray-100 font-mono leading-none">
                  {metrics?.midPrice}
                </span>
              </div>

              <div className="flex gap-6 text-[11px] font-mono">
                <div className="flex flex-col items-end">
                  <span className="text-gray-500">Spread</span>
                  <div>
                    <span className="text-yellow-500 font-bold">
                      {metrics?.spread}
                    </span>
                    <span className="text-yellow-500/70 ml-1">
                      ({metrics?.spreadBp}bp)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-500">Imbalance</span>
                  <span
                    className={
                      metrics && metrics.imbalance > 1
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {metrics?.imbalance.toFixed(2)}{" "}
                    {metrics && metrics.imbalance > 1
                      ? "bid heavy"
                      : "ask heavy"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <Virtuoso
                className="virtualizedList"
                data={bids}
                itemContent={(_index, level) => (
                  <CoinDetailsRow level={level} type="bid" maximum={maximum} />
                )}
                computeItemKey={(_index, level) => `bid-${level.priceStr}`}
                overscan={5}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm animate-pulse">
            Connecting to order book...
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderBook;
