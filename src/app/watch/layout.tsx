import { Pacifico } from "next/font/google";

const watchScript = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-watch-script",
  display: "swap",
});

export default function WatchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`${watchScript.variable} min-h-full`}>{children}</div>;
}
