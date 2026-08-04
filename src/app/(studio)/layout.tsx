/**
 * Production console route group — full-bleed dark chrome with no campus
 * sidebar, header, or mobile nav. Auth gating lives in each studio page so the
 * crew check stays next to the data it protects.
 */
export default function StudioRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-[#050B14] text-slate-200 [color-scheme:dark]">
      {children}
    </div>
  );
}
