import { redirect } from "next/navigation";

/** Legacy URL. The recap library moved into the Sports section of the hub. */
export default function MadonnaSportsRecapPage() {
  redirect("/madonna/sports");
}
