import { redirect } from "next/navigation";
import { currentPeriods } from "@/lib/time/current";

export default function CurrentQuarter() {
  redirect(currentPeriods().quarter.href);
}
