import { NextResponse } from "next/server";

import { attachGuestSession, getGuestSession } from "../../../lib/server/guest-session";
import { getSupabaseAdmin } from "../../../lib/server/supabase-admin";
import { toggleCommentLike } from "../../../lib/server/interactions";

export async function POST(request, { params }) {
  try {
    const { commentId } = await params;
    const guestSession = getGuestSession(request);
    const supabase = getSupabaseAdmin();
    const result = await toggleCommentLike(
      supabase,
      Number(commentId),
      guestSession.guestId
    );

    const response = result.ok
      ? NextResponse.json({ liked: result.liked })
      : NextResponse.json({ error: result.error }, { status: 400 });

    return attachGuestSession(response, guestSession);
  } catch (error) {
    console.error("Toggle comment like route error:", error);
    return NextResponse.json(
      { error: "Failed to update like." },
      { status: 500 }
    );
  }
}
