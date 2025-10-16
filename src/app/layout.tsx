import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/themes.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { PWAProvider } from "@/components/PWAProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { reportWebVitals } from "@/lib/performance";
import { QueryClientProvider } from "../components/QueryClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KANTONG - Personal Finance Manager",
  description: "Catat keuangan pribadi & keluarga, simpel dan cerdas.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1220" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider>
          <ThemeProvider>
            <LanguageProvider>
              <PWAProvider />
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

// Web Vitals reporting
export { reportWebVitals };
