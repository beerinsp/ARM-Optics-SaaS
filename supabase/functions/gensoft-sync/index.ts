// Supabase Edge Function: gensoft-sync
// Syncs product catalogue from GenSoft MoneyWorks into the gensoft_products table
// Can be triggered manually or via Supabase cron

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GENSOFT_API_URL = Deno.env.get("GENSOFT_API_URL")!;
const GENSOFT_API_USER = Deno.env.get("GENSOFT_API_USER")!;
const GENSOFT_API_PASSWORD = Deno.env.get("GENSOFT_API_PASSWORD")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface MoneyWorksProduct {
  code: string;
  name: string;
  type?: string;
  costprice?: number;
  sellprice?: number;
  qtyonhand?: number;
  supplier?: string;
  [key: string]: unknown;
}

Deno.serve(async (req) => {
  // Support both GET (cron) and POST (manual trigger)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // MoneyWorks REST API query
    // Adjust the endpoint and query to match your MoneyWorks server config
    const auth = btoa(`${GENSOFT_API_USER}:${GENSOFT_API_PASSWORD}`);
    const response = await fetch(
      `${GENSOFT_API_URL}/REST/1/DB/product?format=json&fields=code,name,type,costprice,sellprice,qtyonhand,supplier`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`MoneyWorks API error: ${response.status}`);
    }

    const products: MoneyWorksProduct[] = await response.json();
    let synced = 0;
    let errors = 0;

    for (const product of products) {
      const { error } = await supabase
        .from("gensoft_products")
        .upsert({
          sku: product.code,
          name: product.name,
          category: product.type ?? null,
          supplier: product.supplier ?? null,
          cost_price: product.costprice ?? null,
          sell_price: product.sellprice ?? null,
          stock_qty: product.qtyonhand != null ? Math.round(product.qtyonhand) : null,
          is_active: true,
          raw_data: product,
          synced_at: new Date().toISOString(),
        }, {
          onConflict: "sku",
        });

      if (error) {
        errors++;
        console.error(`Failed to sync product ${product.code}:`, error.message);
      } else {
        synced++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, total: products.length, synced, errors }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("GenSoft sync error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
