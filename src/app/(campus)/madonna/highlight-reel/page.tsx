import { redirect } from "next/navigation";

/** Legacy URL. The reel now lives under the Sports section of the hub. */
export default function MadonnaHighlightReelPage() {
  redirect("/madonna/sports/reel");
}
