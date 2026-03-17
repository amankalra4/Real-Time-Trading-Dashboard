import { useMemo, useState, useEffect, useRef } from "react";
import { useStore } from "../store";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { _100_MS, _60_SECONDS_MS, CRYPTO_COINS_CONFIG } from "../utils/constants";
import './styles.css';

const TradesFeed = () => {
  const focusedSymbol = useStore((state) => state.focusedSymbol);
  const trades = useStore((state) => state.trades);

  const [largeTradeThreshold, setLargeTradeThreshold] = useState<number | string>(10000);
  const [showLargeTradesOnly, setShowLargeTradesOnly] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const config = CRYPTO_COINS_CONFIG[focusedSymbol] || CRYPTO_COINS_CONFIG["BTCUSD"];
  const baseSymbol = focusedSymbol.replace("USD", "");

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    let buyVol = 0;
    let sellVol = 0;
    let count = 0;
    const oneMinAgo = now - _60_SECONDS_MS;

    for (const trade of trades) {
      if (trade.timestamp < oneMinAgo) break;
      count++;
      if (trade.buyer_role === "taker") {
        buyVol += trade.size;
      } else {
        sellVol += trade.size;
      }
    }

    const avgSize = count > 0 ? (buyVol + sellVol) / count : 0;
    return { buyVol, sellVol, count, avgSize };
  }, [trades, now]);

  const displayTrades = useMemo(() => {
    if (!showLargeTradesOnly) return trades;
    const thresholdNum = Number(largeTradeThreshold);

    return trades.filter((trade) => {
      const notionalValue = parseFloat(trade.price) * trade.size;
      return notionalValue >= thresholdNum;
    });
  }, [trades, showLargeTradesOnly, largeTradeThreshold]);

  const aggregatedTrades = useMemo(() => {
    if (!displayTrades.length) return [];

    const result = [];
    let currentAgg = { ...displayTrades[0], aggCount: 1 };

    for (let i = 1; i < displayTrades.length; i++) {
      const t = displayTrades[i];
      const timeDiff = Math.abs(currentAgg.timestamp - t.timestamp);
      const samePrice = currentAgg.price === t.price;
      const sameSide = currentAgg.buyer_role === t.buyer_role;

      if (timeDiff <= _100_MS && samePrice && sameSide) {
        currentAgg.size += t.size;
        currentAgg.aggCount += 1;
      } else {
        result.push(currentAgg);
        currentAgg = { ...t, aggCount: 1 };
      }
    }

    result.push(currentAgg);
    return result;
  }, [displayTrades]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hour = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const milliSeconds = date.getMilliseconds().toString().padStart(3, "0");
    return `${hour}:${minutes}:${seconds}.${milliSeconds}`;
  };

  const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setLargeTradeThreshold(val === "" ? "" : Number(val));
  };

  const handleJumpToLatest = () => {
    virtuosoRef.current?.scrollToIndex({ index: 0, behavior: "smooth" });
  };


  return (
    <div className="flex flex-col h-full bg-[#0a0e17] text-gray-200 border-l border-gray-800 w-150">
      <div className="flex justify-between items-center p-4 border-b border-gray-800 shrink-0">
        <h2 className="text-sm font-bold text-gray-300">
          Recent Trades - {focusedSymbol}
        </h2>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
            <input
              type="checkbox"
              className="accent-blue-600 cursor-pointer"
              checked={showLargeTradesOnly}
              onChange={(event) => setShowLargeTradesOnly(event.target.checked)}
            />
            Large trade {`>=`}
          </label>
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded px-1.5 py-0.5 focus-within:border-blue-500 transition-colors">
            <span className="text-gray-500 text-xs mr-1">$</span>
            <input
              className="bg-transparent text-gray-200 w-14 text-xs outline-none font-mono"
              type="number"
              value={largeTradeThreshold}
              onChange={handleThresholdChange}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between px-4 py-2 border-b border-gray-800 bg-[#0d121e] text-xs shrink-0">
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 font-medium">1m Volume</span>
          <div className="font-mono">
            <span className="text-green-500 font-bold">
              {stats.buyVol.toFixed(1)} <span>buy </span>
            </span>
            <span className="text-red-500 font-bold">
              {stats.sellVol.toFixed(1)} <span>sell</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <span className="text-gray-500 font-medium">1m Trades</span>
          <span className="font-mono font-bold text-gray-200">
            {stats.count}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-gray-500 font-medium">Avg Size</span>
          <span className="font-mono font-bold text-gray-200">
            {stats.avgSize.toFixed(3)} <span>{baseSymbol}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 px-4 py-2 text-xs font-mono text-gray-500 border-b border-gray-800 shrink-0">
        <div className="text-left">Time</div>
        <div className="text-left">Price (USD)</div>
        <div className="text-right">Size ({baseSymbol})</div>
      </div>

      <div className="flex-1 w-full relative overflow-hidden">
        {aggregatedTrades.length > 0 ? (
          <>
            <Virtuoso
              ref={virtuosoRef}
              className="virtualizedList"
              data={aggregatedTrades}
              onScroll={(e) =>
                setIsAtTop((e.target as HTMLElement).scrollTop < 10)
              }
              itemContent={(_index, trade) => {
                const priceNum = parseFloat(trade.price);
                const isBuy = trade.buyer_role === "taker";
                const notional = priceNum * trade.size;
                const isLarge = notional >= Number(largeTradeThreshold);

                const textColor = isBuy ? "text-green-500" : "text-red-500";
                const rowBg = isLarge
                  ? isBuy
                    ? "bg-green-900/20"
                    : "bg-red-900/20"
                  : "hover:bg-gray-800/50";
                const borderClass = isLarge
                  ? isBuy
                    ? "border-l-4 border-green-500"
                    : "border-l-4 border-transparent"
                  : "border-l-4 border-transparent";

                const finalBorder = isLarge && !isBuy ? "border-l-4 border-red-500" : borderClass;

                return (
                  <div className={`grid grid-cols-3 px-4 py-1 text-sm font-mono cursor-pointer transition-colors ${rowBg} ${finalBorder}`}>
                    <div className="text-left text-gray-500 text-[11px] whitespace-nowrap flex items-center">
                      {formatTime(trade.timestamp)}
                    </div>

                    <div className={`text-left font-bold ${textColor} ${isLarge ? "font-extrabold" : ""}`}>
                      {priceNum.toFixed(config.precision)}
                    </div>

                    <div className="text-right text-gray-300">
                      {Number(trade.size.toFixed(4)).toString()}
                      {trade.aggCount > 1 && (
                        <span className="text-gray-500 text-xs ml-1 font-bold">
                          ({trade.aggCount})
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            {!isAtTop && (
              <button
                onClick={handleJumpToLatest}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-blue-500 text-xs font-bold hover:text-blue-400 transition-colors z-10 bg-[#0a0e17]/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-gray-800"
              >
                Jump to latest
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm animate-pulse">
            Waiting for live trades...
          </div>
        )}
      </div>
    </div>
  );
};

export default TradesFeed;
