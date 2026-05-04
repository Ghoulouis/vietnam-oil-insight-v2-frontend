import { PriceChartV2, type WTIPoint, type PlattsPoint, type PlattsPredicPoint } from "@/components/PriceChartV2";
import { getPlattsPrices } from "@/services/priceService";
import { fetchYahooDayPrice } from "@/services/wtiCrudeService";

export const dynamic = "force-dynamic";

export default async function Home() {
  const endDate = new Date();
  endDate.setMinutes(0, 0);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 15);

  const witPointsData = await fetchYahooDayPrice("CL=F", startDate, endDate);

  const plattsData: PlattsPoint[] = await getPlattsPrices(startDate, endDate);
  const CURRENT = {
    date: "21 NOV 2024",
    time: "15:00:00 ICT",
    ron95: { price: 20420, delta: -110, deltaPct: -0.54 },
    diesel: { price: 18350, delta: -180, deltaPct: -0.97 },
    e5: { price: 19340, delta: -109, deltaPct: -0.56 },
    kerosene: { price: 18790, delta: -240, deltaPct: -1.26 },
  };

  console.log("plattsData", plattsData);
  return (
    <div className="min-h-dvh bg-background text-foreground p-4 md:p-8">
      <nav className="max-w-360 mx-auto mb-12 flex justify-between items-end border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-[10px] tracking-widest uppercase text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--cyan-glow)] animate-pulse" />
            Live Feed / Market Terminal
          </div>
          <h1 className="text-xl font-display font-bold text-card-foreground tracking-tighter">
            FUEL_QUANT.VN <span className="text-primary">v4.0</span>
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-[10px] uppercase text-muted-foreground mb-1">Last Adjustment Window</div>
          <div className="text-card-foreground tabular-nums text-sm">
            {CURRENT.date} // {CURRENT.time}
          </div>
        </div>
      </nav>

      <main className="max-w-[1440] mx-auto space-y-8">
        {/* Multi-source price chart */}
        <section className="bg-card border border-border p-6 md:p-8">
          <PriceChartV2 wtiData={witPointsData!} plattsData={plattsData} plattsPredicData={[]} />
        </section>
      </main>
    </div>
  );
}
