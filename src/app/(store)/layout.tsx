import { Suspense, type ReactNode } from "react";

import { NoticeBanner } from "@/components/notice-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WishlistProvider } from "@/components/wishlist-provider";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <SiteHeader />
      <Suspense fallback={null}>
        <NoticeBanner />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </WishlistProvider>
  );
}
