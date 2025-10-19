import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/themes.css";
import { AppInitializer } from "@/components/AppInitializer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { OnboardingProvider } from "@/components/OnboardingProvider";
import { PWAProvider } from "@/components/PWAProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { reportWebVitals } from "@/lib/performance";
import { QueryClientProvider } from "../components/QueryClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monii - Personal Finance Manager",
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
        <link rel="icon" href="/icons/icon-192.png" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1220" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider>
          <ThemeProvider>
            <LanguageProvider>
              <OnboardingProvider>
                <AppInitializer>
                  <PWAProvider />
                  {children}
                  <Toaster />
                </AppInitializer>
              </OnboardingProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

// Web Vitals reporting
export { reportWebVitals };
