import { redirect } from "next/navigation";
import { currentPeriods } from "@/lib/time/current";

export default function CurrentMonth() {
  redirect(currentPeriods().month.href);
}
