// /services/priceService.ts
import { supabase } from "@/lib/supabaseClient";

export type Price = {
  id: string;
  date: string;
  wti_usd: number;
  brent_crude_usd: number;
  platts_singapore_95ron_usd: number;
  platts_singapore_diesel_usd: number;
  ty_gia_usd_vnd: number;
  source: string;
  created_at: string;
};

export async function getPrices(): Promise<Price[]> {
  const { data, error } = await supabase.from("price").select("*").order("date", { ascending: true });
  if (error) throw error;
  return data as Price[];
}
