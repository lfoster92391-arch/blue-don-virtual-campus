import { revalidatePath } from "next/cache";

import { PHONE_LIVE_ROUTE, PUBLIC_WATCH_PATH } from "@/config/phone-live";

/** Cache bust for campus media surfaces. Not a Server Action — call from actions only. */
export function revalidateMediaPaths() {
  revalidatePath("/media");
  revalidatePath("/organizations/broadcasting");
  revalidatePath("/broadcast/studio");
  revalidatePath("/home");
  revalidatePath("/madonna");
  revalidatePath("/madonna/today");
  revalidatePath("/madonna/broadcast");
  revalidatePath("/madonna/sports");
  revalidatePath("/madonna/sports/reel");
  revalidatePath(PUBLIC_WATCH_PATH);
  revalidatePath(PHONE_LIVE_ROUTE);
}
