import { NextResponse } from "next/server";

import { attachGuestSession, getGuestSession } from "../../lib/server/guest-session";
import { getLikedCommentIds } from "../../lib/server/interactions";
import { getSupabaseAdmin } from "../../lib/server/supabase-admin";

export async function POST(request) {
  try {
    const guestSession = getGuestSession(request);
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const likedCommentIds = await getLikedCommentIds(
      supabase,
      body.commentIds || [],
      guestSession.guestId
    );

    const response = NextResponse.json({ likedCommentIds });
    return attachGuestSession(response, guestSession);
  } catch (error) {
    console.error("Comment likes route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch liked comments." },
      { status: 500 }
    );
  }
}
