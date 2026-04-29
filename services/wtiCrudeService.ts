import axios, { AxiosError } from "axios";

import { WTIPoint } from "@/components/PriceChartV2";

type YahooSymbol = "BZ=F" | "CL=F";

interface YahooChartResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: number[];
          open: number[];
          high: number[];
          low: number[];
        }>;
      };
    }> | null;
  };
}

async function fetchYahooDayPrice(symbol: YahooSymbol, startDate: Date, endDate: Date): Promise<WTIPoint[] | null> {
  try {
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000);

    const { data } = await axios.get<YahooChartResponse>(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: { interval: "1h", period1, period2 },
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 10_000,
      },
    );

    const result = data.chart?.result?.[0];
    if (!result) return null;

    const timestamps = result.timestamp;
    if (!timestamps) return null;

    const quote = result.indicators.quote[0];

    return timestamps
      .map((t, i) => ({
        timestamp: t,
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
      }))
      .filter((c) => c.open && c.high && c.low && c.close); // bỏ candle null
  } catch (err) {
    const error = err as AxiosError;
    console.error(`[Yahoo:${symbol}] fetch failed:`, error.message);
    return null;
  }
}

export { fetchYahooDayPrice };
