"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/types/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";

interface CustomerSearchBarProps {
  onSelect?: (customer: Customer) => void;
  placeholder?: string;
  navigateOnSelect?: boolean;
}

export function CustomerSearchBar({
  onSelect,
  navigateOnSelect = true,
}: CustomerSearchBarProps) {
  const { dict } = useLocale();
  const t = dict.search;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("customers")
      .select("*")
      .or(
        `phone.ilike.%${q}%,mobile.ilike.%${q}%,email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`
      )
      .order("last_name")
      .limit(8);
    setResults(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (customer: Customer) => {
    setOpen(false);
    setQuery("");
    if (onSelect) onSelect(customer);
    if (navigateOnSelect) router.push(`/customers/${customer.id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
        <input
          type="text"
          className="input-base w-full pl-10 pr-4"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 animate-spin" />
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-brand-200 rounded-xl shadow-2xl overflow-hidden">
          {results.length === 0 && !loading ? (
            <div className="p-4">
              <p className="text-sm text-brand-500 mb-3">
                {t.noCustomersFound} &ldquo;{query}&rdquo;
              </p>
              <Link
                href={`/customers/new?prefill=${encodeURIComponent(query)}`}
                className="flex items-center gap-2 text-sm text-accent hover:text-accent-light transition-colors"
                onClick={() => setOpen(false)}
              >
                <UserPlus className="w-4 h-4" />
                {t.createNew}
              </Link>
            </div>
          ) : (
            <ul>
              {results.map((customer) => (
                <li key={customer.id}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-brand-50 transition-colors text-left"
                    onClick={() => handleSelect(customer)}
                  >
                    <div>
                      <p className="text-sm font-medium text-brand-900">
                        {customer.first_name} {customer.last_name}
                      </p>
                      <p className="text-xs text-brand-500">
                        {customer.phone || customer.mobile}{" "}
                        {customer.email && `· ${customer.email}`}
                      </p>
                    </div>
                    <span className="text-xs text-brand-400">
                      {customer.suburb}
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-t border-brand-100 p-2">
                <Link
                  href="/customers/new"
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-brand-500 hover:text-accent transition-colors rounded"
                  onClick={() => setOpen(false)}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {t.createNew}
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
