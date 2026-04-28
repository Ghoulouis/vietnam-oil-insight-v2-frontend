"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Scatter,
} from "recharts";

export type WTIPoint = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type PlattsPoint = {
  timestamp: number;
  price: number;
};

export type PlattsPredicPoint = {
  timestamp: number;
  price: number;
};

// Internal merged type used by the chart
type ChartPoint = {
  timestamp: number;
  wtiOpen: number;
  wtiHigh: number;
  wtiLow: number;
  wtiClose: number;
  plattsConfirmedLine: number | null;
  plattsPredictedLine: number | null;
  plattsPredictedDot: number | null;
  plattsPredicted: boolean;
  platts: number | null;
};

type CandleProps = {
  x?: number;
  width?: number;
  payload?: ChartPoint;
  background?: { y: number; height: number };
  yDomain: [number, number];
};

function Candle(props: CandleProps) {
  const { x = 0, width = 0, payload, background, yDomain } = props;
  if (!payload || !background) return null;
  const [minY, maxY] = yDomain;
  const range = maxY - minY || 1;
  const toPx = (v: number) => background.y + ((maxY - v) / range) * background.height;

  const openY = toPx(payload.wtiOpen);
  const closeY = toPx(payload.wtiClose);
  const highY = toPx(payload.wtiHigh);
  const lowY = toPx(payload.wtiLow);

  const isUp = payload.wtiClose >= payload.wtiOpen;
  const color = isUp ? "var(--cyan-glow)" : "var(--neon-red)";
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
  const candleWidth = Math.max(width * 0.55, 3);
  const candleX = x + (width - candleWidth) / 2;
  const wickX = x + width / 2;

  return (
    <g>
      <line x1={wickX} x2={wickX} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isUp ? "transparent" : color}
        stroke={color}
        strokeWidth={1.2}
      />
    </g>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-card border border-border p-4 text-xs font-mono shadow-xl min-w-60">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        {getTickFormat(Number(label))}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between gap-4">
          <span className="text-cyan-glow uppercase">WTI O/H/L/C</span>
          <span className="tabular-nums text-card-foreground">
            {p.wtiOpen.toFixed(2)} / {p.wtiHigh.toFixed(2)} / {p.wtiLow.toFixed(2)} /{" "}
            <strong>${p.wtiClose.toFixed(2)}</strong>
          </span>
        </div>
        {p.platts != null && (
          <div className="flex justify-between gap-4 items-center">
            <span className="text-amber-glow uppercase flex items-center gap-1.5">
              Platts MOPS
              {p.plattsPredicted && (
                <span className="text-[8px] px-1 py-px border border-amber-glow text-amber-glow tracking-widest">
                  PRED
                </span>
              )}
            </span>
            <span className="tabular-nums text-card-foreground">
              ${p.platts.toFixed(2)}
              {p.plattsPredicted && <span className="text-amber-glow"> *</span>}
            </span>
          </div>
        )}
      </div>
      {p.plattsPredicted && (
        <div className="mt-3 pt-2 border-t border-border text-[9px] text-amber-glow">
          * Predicted Platts value — official fixing not yet published
        </div>
      )}
    </div>
  );
}

function CustomLegend() {
  const items = [
    { color: "var(--cyan-glow)", label: "WTI Crude USD/bbl (Candle)", style: "candle" },
    { color: "var(--amber-glow)", label: "Platts MOPS RON95 USD/bbl", style: "line" },
    { color: "var(--amber-glow)", label: "Platts (Predicted)", style: "predicted" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-2 mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          {i.style === "candle" ? (
            <span className="inline-block w-2 h-3 border" style={{ borderColor: i.color, background: "transparent" }} />
          ) : i.style === "predicted" ? (
            <span className="inline-block w-5 h-px" style={{ borderTop: `1.5px dotted ${i.color}` }} />
          ) : (
            <span className="inline-block w-5 h-px" style={{ background: i.color }} />
          )}
          <span>{i.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PriceChartV2({
  wtiData,
  plattsData,
  plattsPredicData,
}: {
  wtiData: WTIPoint[];
  plattsData: PlattsPoint[];
  plattsPredicData: PlattsPredicPoint[];
}) {
  // Build lookup maps for Platts confirmed and predicted by timestamp
  const plattsMap = new Map(plattsData.map((p) => [p.timestamp, p.price]));
  const plattsPredicMap = new Map(plattsPredicData.map((p) => [p.timestamp, p.price]));

  // Merge WTI candles with Platts data
  const merged: ChartPoint[] = wtiData.map((wti, i) => {
    const confirmedPrice = plattsMap.get(wti.timestamp) ?? null;
    const predictedPrice = plattsPredicMap.get(wti.timestamp) ?? null;
    const isPredicted = predictedPrice != null && confirmedPrice == null;
    const plattsPrice = confirmedPrice ?? predictedPrice;

    // Connect predicted line from last confirmed point
    const prev = wtiData[i - 1];
    const prevConfirmed = prev ? (plattsMap.get(prev.timestamp) ?? null) : null;
    const connectFromPrev = isPredicted && prevConfirmed != null ? prevConfirmed : null;

    return {
      timestamp: wti.timestamp,
      wtiOpen: wti.open,
      wtiHigh: wti.high,
      wtiLow: wti.low,
      wtiClose: wti.close,
      platts: plattsPrice,
      plattsPredicted: isPredicted,
      plattsConfirmedLine: confirmedPrice,
      plattsPredictedLine: isPredicted ? plattsPrice : connectFromPrev,
      plattsPredictedDot: isPredicted ? plattsPrice : null,
    };
  });

  // Y axis domain: USD/bbl
  const usdValues = merged.flatMap((d) => {
    const vals = [d.wtiHigh, d.wtiLow];
    if (d.platts != null) vals.push(d.platts);
    return vals;
  });
  const usdMin = Math.floor(Math.min(...usdValues) - 2);
  const usdMax = Math.ceil(Math.max(...usdValues) + 2);

  return (
    <div className="w-full">
      <div className="h-110 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={merged} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="oklch(1 0 0 / 6%)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="timestamp"
              stroke="oklch(0.55 0.01 270)"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "oklch(0.55 0.01 270)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(1 0 0 / 8%)" }}
              tickFormatter={(value: number) => {
                return getTickFormat(value);
              }}
            />
            <YAxis
              yAxisId="usd"
              orientation="left"
              domain={[usdMin, usdMax]}
              stroke="oklch(0.55 0.01 270)"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "oklch(0.55 0.01 270)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}`}
              width={52}
              label={{
                value: "USD / bbl",
                angle: -90,
                position: "insideLeft",
                offset: 14,
                style: {
                  fontSize: 9,
                  fontFamily: "JetBrains Mono",
                  fill: "var(--cyan-glow)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                },
              }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--cyan-glow)", strokeWidth: 1, strokeOpacity: 0.3 }}
            />
            {/* WTI Candles */}
            <Bar
              yAxisId="usd"
              dataKey="wtiHigh"
              fill="transparent"
              isAnimationActive={false}
              shape={(props: unknown) => {
                const p = props as {
                  x: number;
                  width: number;
                  background: { y: number; height: number };
                  payload: ChartPoint;
                };
                return (
                  <Candle
                    x={p.x}
                    width={p.width}
                    payload={p.payload}
                    background={p.background}
                    yDomain={[usdMin, usdMax]}
                  />
                );
              }}
              background={{ fill: "transparent" }}
            >
              {merged.map((_, i) => (
                <Cell key={i} />
              ))}
            </Bar>

            {/* Platts confirmed: solid amber */}
            <Line
              yAxisId="usd"
              type="monotone"
              dataKey="plattsConfirmedLine"
              stroke="var(--amber-glow)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--amber-glow)", stroke: "var(--obsidian)" }}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Platts predicted: dotted amber */}
            <Line
              yAxisId="usd"
              type="monotone"
              dataKey="plattsPredictedLine"
              stroke="var(--amber-glow)"
              strokeWidth={2}
              strokeDasharray="2 3"
              strokeOpacity={0.85}
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Predicted dot markers */}
            <Scatter
              yAxisId="usd"
              dataKey="plattsPredictedDot"
              shape={(props: unknown) => {
                const p = props as { cx?: number; cy?: number };
                if (p.cx == null || p.cy == null) return <g />;
                return (
                  <g>
                    <circle cx={p.cx} cy={p.cy} r={6} fill="none" stroke="var(--amber-glow)" strokeOpacity={0.35} />
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r={3}
                      fill="var(--obsidian)"
                      stroke="var(--amber-glow)"
                      strokeWidth={1.5}
                    />
                  </g>
                );
              }}
            />

            <Legend content={<CustomLegend />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getTickFormat(value: number) {
  const date = new Date(value * 1000);
  const hour = date.getHours();
  const minute = date.getMinutes();
  if (hour === 0 && minute === 0) {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
