import { CricutCartProvider } from "@/components/cricut/cricut-cart-context";

export default function CricutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CricutCartProvider>{children}</CricutCartProvider>;
}
