import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource-variable/newsreader/opsz.css";
import "./globals.css";
import { Providers } from "@/components/shell/theme";

export const metadata: Metadata = {
  title: { default: "REEM LIFE OS", template: "%s · REEM LIFE OS" },
  description: "نظام ريم لإدارة الحياة السنوية — a personal Life Operating System.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0f1420",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
