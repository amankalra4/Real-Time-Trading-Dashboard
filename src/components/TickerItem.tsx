import React from "react";
import { useStore } from "../store";
import { _24HOUR_PERCENT_CHANGE_INITIAL_VALUE, NO_VALUE } from "../utils/constants";

const TickerItem = ({ symbol }: { symbol: keyof typeof _24HOUR_PERCENT_CHANGE_INITIAL_VALUE }) => {
  const ticker = useStore((state) => state.tickers[symbol]);
  const isFocused = useStore((state) => state.focusedSymbol === symbol);

  const change = _24HOUR_PERCENT_CHANGE_INITIAL_VALUE[symbol] || { value: "0.00%", isPositive: true };

  return (
    <div
      onClick={() => {}}
      className={`flex w-full flex-col cursor-pointer px-4 py-3 border-b-4 transition-colors ${
        isFocused
          ? "border-blue-500 bg-gray-800"
          : "border-transparent hover:bg-gray-800/50"
      }`}
    >
      <div className="flex gap-3 justify-between items-center mb-1">
        <span className="font-bold text-gray-200">{symbol}</span>
        <span className="text-gray-300 font-mono text-lg">
          {ticker
            ? Number(ticker.last_price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })
            : NO_VALUE}
        </span>
      </div>
      <div className="flex gap-2 justify-between items-center">
        <span className="text-gray-400 text-xs font-mono">Perpetual</span>
        <span
          className={`text-sm font-mono ${change.isPositive ? "text-green-500" : "text-red-500"}`}
        >
          {change.value}
        </span>
      </div>
    </div>
  );
};

export default React.memo(TickerItem);
