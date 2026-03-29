import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_SESSION_COOKIE, encodeSession } from "@/lib/server/demo-session";
import type { DemoSession } from "@/lib/types";

const bodySchema = z.object({
  role: z.enum(["public", "chapter-lead", "global-admin"]),
  chapterSlug: z.string().trim().optional(),
  displayName: z.string().trim().min(2).max(80).default("WIAL workspace user")
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const session: DemoSession = {
      role: body.role,
      chapterSlug: body.role === "chapter-lead" ? body.chapterSlug ?? "brazil" : null,
      displayName: body.displayName
    };

    const response = NextResponse.json({ ok: true, session });
    response.cookies.set({
      name: DEMO_SESSION_COOKIE,
      value: encodeSession(session),
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 12
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create session." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: DEMO_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0
  });
  return response;
}
