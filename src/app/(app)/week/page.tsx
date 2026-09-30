import { redirect } from "next/navigation";
import { currentPeriods } from "@/lib/time/current";

export default function CurrentWeek() {
  redirect(currentPeriods().week.href);
}
