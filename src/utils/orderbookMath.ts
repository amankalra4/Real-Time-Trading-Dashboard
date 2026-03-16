import type { IOrderBook } from "../types";

export interface IProcessedLevel {
  price: number;
  size: number;
  total: number;
  priceStr: string;
}

const groupLevels = (
  levels: IOrderBook[],
  interval: number,
  isBid: boolean,
  precision: number,
): IProcessedLevel[] => {
  const grouped = new Map<number, number>();

  for (let i = 0; i < levels.length; i++) {
    const rawPrice = parseFloat(levels[i][0]);
    const rawSize = parseFloat(levels[i][1]);

    const factor = 1 / interval;
    let groupedPrice = isBid
      ? Math.floor(rawPrice * factor) / factor
      : Math.ceil(rawPrice * factor) / factor;

    groupedPrice = Number(groupedPrice.toFixed(precision));

    const currentSize = grouped.get(groupedPrice) || 0;
    grouped.set(groupedPrice, currentSize + rawSize);
  }

  const result = [];
  let total = 0;

  const sortedPrices = Array.from(grouped.keys()).sort((a, b) =>
    isBid ? b - a : a - b,
  );

  for (const price of sortedPrices) {
    const size = grouped.get(price)!;
    total += size;

    result.push({
      price,
      size,
      total: total,
      priceStr: price.toFixed(precision),
    });
  }
  return result;
};

export const processOrderBook = (
  bids: IOrderBook[],
  asks: IOrderBook[],
  grouping: number,
  precision: number,
) => {
  const groupedAsks = groupLevels(asks, grouping, false, precision);
  const groupedBids = groupLevels(bids, grouping, true, precision);

  let midPrice = "0.00",
    spread = "0.00",
    spreadBp = "0.00",
    imbalance = 1;

  if (groupedBids.length > 0 && groupedAsks.length > 0) {
    const firstAsk = groupedAsks[0].price;
    const firstBid = groupedBids[0].price;

    const spreadNum = firstAsk - firstBid;
    const midPriceNum = (firstAsk + firstBid) / 2;

    spread = spreadNum.toFixed(precision);

    midPrice = midPriceNum.toFixed(precision);

    spreadBp = ((spreadNum / midPriceNum) * 10000).toFixed(1);

    const totalAskSize =
      groupedAsks.length > 0 ? groupedAsks[groupedAsks.length - 1].total : 0;
    const totalBidSize =
      groupedBids.length > 0 ? groupedBids[groupedBids.length - 1].total : 0;

    if (totalAskSize > 0) {
      imbalance = totalBidSize / totalAskSize;
    }
  }

  return {
    bids: groupedBids,
    asks: groupedAsks.reverse(),
    metrics: { midPrice, spread, spreadBp, imbalance },
  };
};
