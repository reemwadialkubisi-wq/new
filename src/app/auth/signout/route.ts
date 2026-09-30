import { NextResponse, type NextRequest } from "next/server";
import { authConfigured } from "@/lib/config";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (authConfigured) {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
