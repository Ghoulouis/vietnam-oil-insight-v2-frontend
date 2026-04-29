// /services/priceService.ts
import { PlattsPoint } from "@/components/PriceChartV2";
import { supabase } from "@/lib/supabaseClient";

export async function getPlattsPrices(startDate: Date, endDate: Date): Promise<PlattsPoint[]> {
  const { data, error } = await supabase
    .from("price")
    .select("date, platts_singapore_diesel_usd")
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: true });

  if (error) throw error;

  return data.map((item) => {
    return {
      timestamp: new Date(item.date).getTime() / 1000 + 12 * 3600,
      price: item.platts_singapore_diesel_usd,
    };
  });
}
