import type { Metadata } from "next";
import { Manrope, Barlow_Condensed } from "next/font/google";
import { Toaster } from "sonner";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/i18n/context";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

// Used only for the sidebar logo mark — closest Google Font match to the
// condensed geometric typeface in the ARM Optics brand logo.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "900"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: {
    default: "ARM Optics CRM",
    template: "%s | ARM Optics CRM",
  },
  description: "Customer management platform for ARM Optics",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDict(locale);

  return (
    <html lang={locale}>
      <body className={`${manrope.variable} ${barlowCondensed.variable} font-sans`}>
        <LocaleProvider locale={locale} dict={dict}>
          {children}
          <Toaster
            toastOptions={{
              classNames: {
                toast: "bg-white border border-brand-200 text-brand-900 shadow-md",
                title: "text-brand-900",
                description: "text-brand-500",
                success: "border-green-200",
                error: "border-red-200",
              },
            }}
          />
        </LocaleProvider>
      </body>
    </html>
  );
}
