import { NextResponse } from "next/server";

import { attachGuestSession, getGuestSession } from "../../../lib/server/guest-session";
import { addCommentForArtwork, getCommentsForArtwork } from "../../../lib/server/interactions";
import { getSupabaseAdmin } from "../../../lib/server/supabase-admin";

export async function GET(request, { params }) {
  try {
    const { artworkId } = await params;
    const guestSession = getGuestSession(request);
    const supabase = getSupabaseAdmin();
    const comments = await getCommentsForArtwork(supabase, artworkId);

    if (!comments) {
      return NextResponse.json(
        { error: "Failed to fetch comments." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ comments });
    return attachGuestSession(response, guestSession);
  } catch (error) {
    console.error("Comments route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments." },
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
    const result = await addCommentForArtwork(
      supabase,
      artworkId,
      guestSession.guestId,
      body.guestName,
      body.emoji,
      body.text,
      body.parentId ?? null
    );

    const response = result.ok
      ? NextResponse.json({ ok: true, comment: result.data })
      : NextResponse.json({ error: result.error }, { status: 400 });

    return attachGuestSession(response, guestSession);
  } catch (error) {
    console.error("Add comment route error:", error);
    return NextResponse.json(
      { error: "Failed to save comment." },
      { status: 500 }
    );
  }
}
