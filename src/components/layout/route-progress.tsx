"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

function RouteProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);

  // Turn off loading once route has updated
  React.useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  // Intercept link clicks to show immediate progress feedback
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore hash links, external links, mailto, etc.
      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        target.getAttribute("target") === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // If linking to same path and params, don't trigger loading
      if (href === pathname) return;

      setLoading(true);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div className="h-full w-full bg-gradient-to-r from-[#E07B4C] via-[#ED9455] to-[#E07B4C] shadow-[0_0_8px_rgba(224,123,76,0.6)] animate-route-progress" />
    </div>
  );
}

export function RouteProgress() {
  return (
    <React.Suspense fallback={null}>
      <RouteProgressBarContent />
    </React.Suspense>
  );
}
