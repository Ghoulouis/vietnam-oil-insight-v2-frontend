import { PriceChart, type ChartPoint } from "@/components/PriceChart";
import { PriceChartV2, type WTIPoint, type PlattsPoint, type PlattsPredicPoint } from "@/components/PriceChartV2";
import { fetchYahooDayPrice } from "@/services/wtiCrudeService";

export default async function Home() {
  const endDate = new Date();
  endDate.setHours(1, 0, 0, 0);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const witPointsData = await fetchYahooDayPrice("CL=F", startDate, endDate);
  return (
    <div className="min-h-dvh bg-background text-foreground p-4 md:p-8">
      <main className="max-w-[1440] mx-auto space-y-8">
        {/* Multi-source price chart */}
        <section className="bg-card border border-border p-6 md:p-8">
          <PriceChartV2 wtiData={witPointsData!} plattsData={[]} plattsPredicData={[]} />
          {/* <PriceChartV2 data={CHART_DATA} /> */}
        </section>
      </main>
    </div>
  );
}
