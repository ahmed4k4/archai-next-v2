import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY, configured } from "../../../lib/supabase";

/* Called by the dashboard after every content change. Only a verified admin can trigger it. */
export async function POST(req) {
  if (!configured) return NextResponse.json({ ok: false }, { status: 503 });
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } = {} } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { data: isAdmin, error: roleError } = await sb.rpc("is_admin");
  if (roleError || isAdmin !== true) return NextResponse.json({ ok: false }, { status: 403 });
  revalidateTag("content");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
