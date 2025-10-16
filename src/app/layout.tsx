import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/themes.css";
import { AppInitializer } from "@/components/AppInitializer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { OnboardingProvider } from "@/components/OnboardingProvider";
import { PWAProvider } from "@/components/PWAProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
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
        <link rel="icon" href="/icons/new icon-non-bg.png" sizes="any" />
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
