import "./overlay.css";

/**
 * Graphics overlay route group — a transparent 16:9 surface for an OBS Browser
 * Source. No campus chrome, no navigation, and no background: everything the
 * page does not paint is see-through so OBS composites it over the program.
 */
export default function OverlayRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-dvh w-dvw overflow-hidden">{children}</div>;
}
