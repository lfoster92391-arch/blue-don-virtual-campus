import { redirect } from "next/navigation";

/** Retired with campus lunch ordering — the kitchen works from FuelTheDons. */
export default function LunchKitchenPage() {
  redirect("/lunch");
}
