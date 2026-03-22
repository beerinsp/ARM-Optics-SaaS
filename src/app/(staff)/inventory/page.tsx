import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, RefreshCw, Search } from "lucide-react";
import type { GensoftProduct } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("gensoft_products")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .limit(100);

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,supplier.ilike.%${q}%`);
  }

  const { data: products, error } = await query;
  const { data: lastSync } = await supabase
    .from("gensoft_products")
    .select("synced_at")
    .order("synced_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="GenSoft MoneyWorks product catalogue"
      />

      {/* Sync status */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-4 h-4 text-gold" />
          <div>
            <p className="text-sm font-medium text-dark-200">GenSoft MoneyWorks Integration</p>
            <p className="text-xs text-dark-400">
              {lastSync?.synced_at
                ? `Last synced: ${formatDate(lastSync.synced_at)}`
                : "Not yet synced"}
            </p>
          </div>
        </div>
        <span className="text-xs text-dark-500">
          Auto-synced periodically via edge function
        </span>
      </div>

      {/* Search */}
      <form className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            name="q"
            defaultValue={q}
            className="input-base w-full pl-10"
            placeholder="Search by name, SKU, or supplier..."
          />
        </div>
      </form>

      {/* Products */}
      <div className="card overflow-hidden">
        {!products || products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400 text-sm mb-1">
              {q ? `No products found for "${q}"` : "No products in catalogue yet."}
            </p>
            <p className="text-dark-500 text-xs">
              Products sync automatically from GenSoft MoneyWorks. Configure the integration in settings.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <p className="text-sm text-dark-400">{products.length} products</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(products as GensoftProduct[]).map((product) => (
                <div key={product.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-dark-100">{product.name}</p>
                    <p className="text-xs text-dark-400">
                      SKU: {product.sku}
                      {product.supplier && ` · ${product.supplier}`}
                      {product.category && ` · ${product.category}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    {product.stock_qty !== null && (
                      <div>
                        <p className="text-xs text-dark-400">Stock</p>
                        <p className={`text-sm font-medium ${product.stock_qty > 0 ? "text-green-400" : "text-red-400"}`}>
                          {product.stock_qty}
                        </p>
                      </div>
                    )}
                    {product.sell_price !== null && (
                      <div>
                        <p className="text-xs text-dark-400">Price</p>
                        <p className="text-sm font-medium text-dark-200">
                          {formatCurrency(product.sell_price)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
