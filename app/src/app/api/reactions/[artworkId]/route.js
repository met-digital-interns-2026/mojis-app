import { NextResponse } from "next/server";

import { attachGuestSession, getGuestSession } from "../../../lib/server/guest-session";
import { getMyReactionForArtwork, saveReactionForArtwork } from "../../../lib/server/interactions";
import { getSupabaseAdmin } from "../../../lib/server/supabase-admin";

export async function GET(request, { params }) {
  try {
    const { artworkId } = await params;
    const guestSession = getGuestSession(request);
    const supabase = getSupabaseAdmin();
    const reaction = await getMyReactionForArtwork(supabase, artworkId, guestSession.guestId);

    const response = NextResponse.json({ reaction });
    return attachGuestSession(response, guestSession);
  } catch (error) {
    console.error("Get reaction route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reaction." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { artworkId } = await params;
    const guestSession = getGuestSession(request);
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const result = await saveReactionForArtwork(
      supabase,
      artworkId,
      guestSession.guestId,
      body
    );

    const response = result.ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: result.error }, { status: 400 });

    return attachGuestSession(response, guestSession);
  } catch (error) {
    console.error("Save reaction route error:", error);
    return NextResponse.json(
      { error: "Failed to save reaction." },
      { status: 500 }
    );
  }
}
