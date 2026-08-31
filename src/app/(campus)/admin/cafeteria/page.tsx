import { redirect } from "next/navigation";

/** Retired — cafeteria money is handled on FuelTheDons, not in this app. */
export default function AdminCafeteriaPage() {
  redirect("/lunch");
}
