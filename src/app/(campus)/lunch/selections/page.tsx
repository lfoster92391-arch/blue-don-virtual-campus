import { redirect } from "next/navigation";

/** Retired with campus lunch ordering — see /lunch for where lunch lives now. */
export default function LunchSelectionsPage() {
  redirect("/lunch");
}
