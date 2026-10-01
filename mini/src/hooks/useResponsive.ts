import { useEffect, useState } from "react";

export type BreakpointName = "mobile" | "tablet" | "desktop" | "wide";

function getBreakpoint(width: number): BreakpointName {
  if (width < 700) return "mobile";
  if (width < 1100) return "tablet";
  if (width < 1440) return "desktop";
  return "wide";
}

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<BreakpointName>(
    () => getBreakpoint(window.innerWidth),
  );

  useEffect(() => {
    const handler = () => setBreakpoint(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";
  const isDesktop = breakpoint === "desktop" || breakpoint === "wide";
  const isNarrow = breakpoint === "mobile" || breakpoint === "tablet";

  return { breakpoint, isMobile, isTablet, isDesktop, isNarrow };
}
