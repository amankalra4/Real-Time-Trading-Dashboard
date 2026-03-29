import { memo, useEffect, useRef } from "react";
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
  const barRef = useRef<HTMLDivElement>(null);
  const barWidthTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const widthPercent = maximum > 0 ? (level.total / maximum) * 100 : 0;
  
  const isAsk = type === "ask";

  useEffect(() => {
    if (barWidthTimeoutRef.current) {
      clearTimeout(barWidthTimeoutRef.current);
    }

    if (barRef.current) {
      barRef.current.style.transition = "none";
      requestAnimationFrame(() => {
        if (barRef.current) {
          barRef.current.style.width = `${widthPercent}%`;
        }
      });
    }
  }, [widthPercent]);

  useEffect(() => {
    const prevSize = prevSizeRef.current;
    const currentSize = level.size;

    if (prevSize > 0) {
      const percentChange = Math.abs(currentSize - prevSize) / prevSize;

      if (percentChange >= _10_PERCENT_CHANGE && rowRef.current) {
        const flashClass = currentSize > prevSize ? GREEN_FLASH : RED_FLASH;
        const el = rowRef.current;

        el.classList.remove(GREEN_FLASH, RED_FLASH);
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "";
        el.classList.add(flashClass);

        if (barRef.current) {
          if (flashTimeoutRef.current) {
            clearTimeout(flashTimeoutRef.current);
          }
          flashTimeoutRef.current = setTimeout(() => {
            if (barRef.current) {
              barRef.current.style.transition = "width 0.1s ease-out";
            }
            flashTimeoutRef.current = null;
          }, 150);
        }
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
        ref={barRef}
        className={`absolute top-0 ${isAsk ? "left-0" : "right-0"} h-full opacity-15 pointer-events-none ${isAsk ? "bg-red-500" : "bg-green-500"}`}
        style={{
          transition: "none",
          willChange: "width",
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

const arePropsEqual = (
  prev: ICoinDetailsRowProps,
  next: ICoinDetailsRowProps,
) => {
  return (
    prev.level.size === next.level.size &&
    prev.level.total === next.level.total &&
    prev.level.priceStr === next.level.priceStr &&
    prev.maximum === next.maximum &&
    prev.type === next.type
  );
};

export default memo(CoinDetailsRow, arePropsEqual);
