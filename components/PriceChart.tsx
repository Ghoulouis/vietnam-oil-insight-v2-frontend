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

export type ChartPoint = {
  date: string;
  // WTI OHLC in USD/bbl
  wtiOpen: number;
  wtiHigh: number;
  wtiLow: number;
  wtiClose: number;
  // Singapore Platts MOPS RON95 in USD/bbl
  platts: number;
  // True if platts is a predicted/estimated value (not yet published at 7AM)
  plattsPredicted?: boolean;
  // Vietnam RON95 retail in VND/L
  vietnam: number;
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

function fmtVnd(n: number) {
  return n.toLocaleString("en-US");
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
    <div className="bg-card border border-border p-4 text-xs font-mono shadow-xl min-w-[240px]">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{label}</div>
      <div className="space-y-2">
        <div className="flex justify-between gap-4">
          <span className="text-cyan-glow uppercase">WTI O/H/L/C</span>
          <span className="tabular-nums text-card-foreground">
            {p.wtiOpen.toFixed(2)} / {p.wtiHigh.toFixed(2)} / {p.wtiLow.toFixed(2)} /{" "}
            <strong>${p.wtiClose.toFixed(2)}</strong>
          </span>
        </div>
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
        <div className="flex justify-between gap-4">
          <span className="text-foreground uppercase">VN RON95</span>
          <span className="tabular-nums text-card-foreground">
            {fmtVnd(p.vietnam)} <span className="text-muted-foreground">VND/L</span>
          </span>
        </div>
      </div>
      {p.plattsPredicted && (
        <div className="mt-3 pt-2 border-t border-border text-[9px] text-amber-glow">
          * Predicted Platts value — official 7AM fixing not yet published
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
    { color: "oklch(0.92 0.01 270)", label: "Vietnam RON95 VND/L", style: "dashed" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-2 mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          {i.style === "candle" ? (
            <span className="inline-block w-2 h-3 border" style={{ borderColor: i.color, background: "transparent" }} />
          ) : i.style === "dashed" ? (
            <span className="inline-block w-5 h-px" style={{ borderTop: `1.5px dashed ${i.color}` }} />
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

export function PriceChart({ data }: { data: ChartPoint[] }) {
  // Left axis: USD/bbl (WTI + Platts)
  const usdValues = data.flatMap((d) => [d.wtiHigh, d.wtiLow, d.platts]);
  const usdMin = Math.floor(Math.min(...usdValues) - 2);
  const usdMax = Math.ceil(Math.max(...usdValues) + 2);

  // Right axis: VND/L (Vietnam retail)
  const vndValues = data.map((d) => d.vietnam);
  const vndRaw = Math.max(...vndValues) - Math.min(...vndValues);
  const vndPad = Math.max(vndRaw * 0.15, 200);
  const vndMin = Math.floor((Math.min(...vndValues) - vndPad) / 100) * 100;
  const vndMax = Math.ceil((Math.max(...vndValues) + vndPad) / 100) * 100;

  // Split platts series into confirmed vs predicted segments for visual treatment
  const plattsConfirmed = data.map((d) => ({
    ...d,
    plattsLine: d.plattsPredicted ? null : d.platts,
  }));
  const plattsPredicted = data.map((d) => ({
    ...d,
    plattsPred: d.plattsPredicted ? d.platts : null,
  }));

  // Find first predicted index to draw a connecting dotted segment from last confirmed
  const merged = data.map((d, i) => {
    const prev = data[i - 1];
    // To make the predicted dotted line connect to the previous confirmed point,
    // include the previous value at the first predicted index.
    const showPredHere = d.plattsPredicted;
    const connectFromPrev = showPredHere && prev && !prev.plattsPredicted ? prev.platts : null;
    return {
      ...d,
      plattsConfirmedLine: d.plattsPredicted ? null : d.platts,
      plattsPredictedLine: d.plattsPredicted ? d.platts : connectFromPrev,
      plattsPredictedDot: d.plattsPredicted ? d.platts : null,
    };
  });

  return (
    <div className="w-full">
      <div className="h-[440px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={merged} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="oklch(1 0 0 / 6%)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="oklch(0.55 0.01 270)"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "oklch(0.55 0.01 270)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(1 0 0 / 8%)" }}
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
            <YAxis
              yAxisId="vnd"
              orientation="right"
              domain={[vndMin, vndMax]}
              stroke="oklch(0.55 0.01 270)"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "oklch(0.55 0.01 270)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
              width={52}
              label={{
                value: "VND / L",
                angle: 90,
                position: "insideRight",
                offset: 14,
                style: {
                  fontSize: 9,
                  fontFamily: "JetBrains Mono",
                  fill: "oklch(0.92 0.01 270)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                },
              }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--cyan-glow)", strokeWidth: 1, strokeOpacity: 0.3 }}
            />
            {/* WTI candles on USD axis */}
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
            {/* Platts confirmed: solid amber line on USD axis */}
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
            {/* Platts predicted: dotted amber line on USD axis */}
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
            {/* Predicted-point highlight markers */}
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
            {/* Vietnam retail on VND axis */}
            <Line
              yAxisId="vnd"
              type="monotone"
              dataKey="vietnam"
              stroke="oklch(0.92 0.01 270)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4, fill: "oklch(0.92 0.01 270)", stroke: "var(--obsidian)" }}
              isAnimationActive={false}
            />
            <Legend content={<CustomLegend />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
