import React, { useEffect, useRef } from "react";
import { _10_PERCENT_CHANGE } from "../utils/constants";
import type { IProcessedLevel } from "../utils/orderbookMath";

interface ICoinDetailsRowProps {
  level: IProcessedLevel;
  maximum: number;
  type: "ask" | "bid";
}

const GREEN_FLASH = "flash-green";
const RED_FLASH = "flash-red";
const DECIMAL_PLACES = 4;

const CoinDetailsRow = ({ level, maximum, type }: ICoinDetailsRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const prevSizeRef = useRef(level.size);

  const widthPercent = maximum > 0 ? (level.total / maximum) * 100 : 0;
  const isAsk = type === "ask";

  useEffect(() => {
    const prevSize = prevSizeRef.current;
    const currentSize = level.size;

    if (
      prevSize > 0 &&
      Math.abs(currentSize - prevSize) / prevSize >= _10_PERCENT_CHANGE
    ) {
      if (rowRef.current) {
        const flashClass = currentSize > prevSize ? GREEN_FLASH : RED_FLASH;

        rowRef.current.classList.remove(GREEN_FLASH, RED_FLASH);

        requestAnimationFrame(() => {
          rowRef.current?.classList.add(flashClass);
        });
      }
    }

    prevSizeRef.current = currentSize;
  }, [level.size]);

  return (
    <div
      ref={rowRef}
      className="relative flex justify-between px-4 py-0.5 text-sm font-mono cursor-pointer hover:bg-gray-800 transition-colors z-10"
    >
      <div
        className={`absolute top-0 ${isAsk ? "left-0" : "right-0"} h-full opacity-15 pointer-events-none ${isAsk ? "bg-red-500" : "bg-green-500"}`}
        style={{
          width: `${widthPercent}%`,
          transition: "width 0.1s ease-out",
        }}
      />

      {isAsk ? (
        <>
          <div className="w-1/3 text-left text-gray-400">
            {level.total.toFixed(DECIMAL_PLACES)}
          </div>
          <div className="w-1/3 text-right text-gray-200 pr-4">
            {level.size.toFixed(DECIMAL_PLACES)}
          </div>
          <div className="w-1/3 text-right text-red-500">{level.priceStr}</div>
        </>
      ) : (
        <>
          <div className="w-1/3 text-left text-green-500">{level.priceStr}</div>
          <div className="w-1/3 text-right text-gray-200 pr-4">
            {level.size.toFixed(DECIMAL_PLACES)}
          </div>
          <div className="w-1/3 text-right text-gray-400">
            {level.total.toFixed(DECIMAL_PLACES)}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(CoinDetailsRow);
