import { exportAll } from "@/db/repo";

export const dynamic = "force-dynamic";

/** Downloads everything as one JSON file. */
export function GET() {
  const data = exportAll();
  const date = data.exportedAt.slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="reem-life-os-backup-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
