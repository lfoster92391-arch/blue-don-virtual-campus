import { redirect } from "next/navigation";

/** Retired with campus lunch ordering — allergies go to the office directly. */
export default function AdminDietaryPage() {
  redirect("/lunch");
}
