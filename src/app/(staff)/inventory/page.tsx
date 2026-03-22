import { createClient } from "@/lib/supabase/server";
import { getLocale, getDict } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Search } from "lucide-react";
import type { GensoftProduct } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.inventory;

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

  const { data: products } = await query;
  const { data: lastSync } = await supabase
    .from("gensoft_products")
    .select("synced_at")
    .order("synced_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <div>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      {/* Sync status */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-4 h-4 text-accent" />
          <div>
            <p className="text-sm font-medium text-brand-800">{t.integration}</p>
            <p className="text-xs text-brand-500">
              {lastSync?.synced_at
                ? `${t.lastSynced}: ${formatDate(lastSync.synced_at)}`
                : t.notSynced}
            </p>
          </div>
        </div>
        <span className="text-xs text-brand-400">
          {t.autoSync}
        </span>
      </div>

      {/* Search */}
      <form className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
          <input
            name="q"
            defaultValue={q}
            className="input-base w-full pl-10"
            placeholder={t.searchPlaceholder}
          />
        </div>
      </form>

      {/* Products */}
      <div className="card overflow-hidden">
        {!products || products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-brand-400 mx-auto mb-3" />
            <p className="text-brand-500 text-sm mb-1">
              {q ? `${t.noProductsFound} "${q}"` : t.noProducts}
            </p>
            <p className="text-brand-400 text-xs">
              {t.configureIntegration}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-100">
              <p className="text-sm text-brand-500">{products.length} {t.productCount}</p>
            </div>
            <div className="divide-y divide-brand-100">
              {(products as GensoftProduct[]).map((product) => (
                <div key={product.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-brand-900">{product.name}</p>
                    <p className="text-xs text-brand-500">
                      SKU: {product.sku}
                      {product.supplier && ` · ${product.supplier}`}
                      {product.category && ` · ${product.category}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    {product.stock_qty !== null && (
                      <div>
                        <p className="text-xs text-brand-500">{t.stock}</p>
                        <p className={`text-sm font-medium ${product.stock_qty > 0 ? "text-green-400" : "text-red-400"}`}>
                          {product.stock_qty}
                        </p>
                      </div>
                    )}
                    {product.sell_price !== null && (
                      <div>
                        <p className="text-xs text-brand-500">{t.price}</p>
                        <p className="text-sm font-medium text-brand-800">
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
