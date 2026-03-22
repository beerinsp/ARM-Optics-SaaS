import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "ARM Optics CRM",
    template: "%s | ARM Optics CRM",
  },
  description: "Customer management platform for ARM Optics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "bg-dark-800 border border-white/10 text-dark-100",
              title: "text-dark-100",
              description: "text-dark-400",
              success: "border-green-500/30",
              error: "border-red-500/30",
            },
          }}
        />
      </body>
    </html>
  );
}
