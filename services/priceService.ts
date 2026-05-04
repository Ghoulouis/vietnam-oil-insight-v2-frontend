// /services/priceService.ts
import { PlattsPoint } from "@/components/PriceChartV2";
import { supabase } from "@/lib/supabaseClient";

function toDateOnly(date: Date) {
  return date.toISOString().split("T")[0];
}
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export async function getPlattsPrices(startDate: Date, endDate: Date): Promise<PlattsPoint[]> {
  startDate = new Date(startDate);
  console.log(
    "Fetching Platts prices from Supabase for date range:",
    toDateOnly(startDate),
    "to",
    toDateOnly(tomorrow),
  );
  const { data, error } = await supabase
    .from("price")
    .select("date, platts_singapore_diesel_usd")
    .gte("date", toDateOnly(startDate))
    .lte("date", toDateOnly(tomorrow))
    .order("date", { ascending: true });
  if (error) throw error;

  return data.map((item) => {
    return {
      timestamp: new Date(item.date).getTime() / 1000 + 9 * 3600,
      price: item.platts_singapore_diesel_usd,
    };
  });
}
