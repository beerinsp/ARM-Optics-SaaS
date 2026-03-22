"use client";
import { useLocale } from "@/lib/i18n/context";
import { LOCALE_COOKIE } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  const router = useRouter();

  const toggle = () => {
    const next = locale === "en" ? "bg" : "en";
    // Persist for 1 year
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const isBg = locale === "bg";

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={isBg ? "Switch to English" : "Превключи на Български"}
        className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-900 transition-colors px-2 py-1.5 rounded-md hover:bg-brand-50"
      >
        <span className="text-sm leading-none">{isBg ? "🇬🇧" : "🇧🇬"}</span>
        <span className="uppercase tracking-wide">{isBg ? "EN" : "BG"}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-brand-100 text-xs font-semibold">
      <button
        onClick={() => {
          if (locale !== "en") {
            document.cookie = `${LOCALE_COOKIE}=en; path=/; max-age=31536000; SameSite=Lax`;
            router.refresh();
          }
        }}
        className={`px-2.5 py-1.5 transition-colors ${
          locale === "en"
            ? "bg-brand-900 text-white"
            : "text-brand-500 hover:text-brand-800 hover:bg-brand-50"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => {
          if (locale !== "bg") {
            document.cookie = `${LOCALE_COOKIE}=bg; path=/; max-age=31536000; SameSite=Lax`;
            router.refresh();
          }
        }}
        className={`px-2.5 py-1.5 transition-colors ${
          locale === "bg"
            ? "bg-brand-900 text-white"
            : "text-brand-500 hover:text-brand-800 hover:bg-brand-50"
        }`}
      >
        БГ
      </button>
    </div>
  );
}
