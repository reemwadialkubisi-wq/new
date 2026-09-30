import { Sidebar } from "@/components/shell/sidebar";
import { TimeBar } from "@/components/shell/time-bar";
import { BottomBar } from "@/components/shell/mobile-nav";
import { QuickCaptureProvider } from "@/components/shell/quick-capture";
import { authConfigured } from "@/lib/config";
import { currentPeriods } from "@/lib/time/current";

// "Today" must be computed per request, never frozen at build time.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const now = currentPeriods();
  return (
    <QuickCaptureProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="flex min-h-dvh">
        <Sidebar authConfigured={authConfigured} />
        <div className="min-w-0 flex-1">
          <TimeBar
            authConfigured={authConfigured}
            data={{
              year: now.year,
              quarter: { ...now.quarter, theme: null },
              month: { ...now.month, theme: null },
              week: now.week,
              day: now.day,
              energy: null,
            }}
          />
          <main id="main" className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-8 sm:px-8 sm:pt-10 md:pb-16 lg:px-10">
            {children}
          </main>
        </div>
      </div>
      <BottomBar />
    </QuickCaptureProvider>
  );
}
