import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL("/portal-login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
