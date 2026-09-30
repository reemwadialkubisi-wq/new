import { redirect } from "next/navigation";
import { currentPeriods } from "@/lib/time/current";

export default function CurrentYear() {
  redirect(currentPeriods().year.href);
}
