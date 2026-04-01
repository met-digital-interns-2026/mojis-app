import { NextResponse } from "next/server";

import { attachGuestSession, getGuestSession } from "../../lib/server/guest-session";
import { upsertArtworkRecord } from "../../lib/server/interactions";
import { getSupabaseAdmin } from "../../lib/server/supabase-admin";

export async function POST(request) {
  try {
    const guestSession = getGuestSession(request);
    const supabase = getSupabaseAdmin();
    const artwork = await request.json();
    const result = await upsertArtworkRecord(supabase, artwork);

    const response = result.ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: result.error }, { status: 400 });

    return attachGuestSession(response, guestSession);
  } catch (error) {
    console.error("Artwork upsert route error:", error);
    return NextResponse.json(
      { error: "Failed to save artwork." },
      { status: 500 }
    );
  }
}
