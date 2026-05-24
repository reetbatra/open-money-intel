import { NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber } from "@/lib/db/client";

export const runtime = "nodejs";

const body = z.object({
  email: z.string().email().max(320),
  source: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const result = await addSubscriber(parsed.email, parsed.source ?? "web");
    return NextResponse.json({
      ok: true,
      message: result.created
        ? "Subscribed. The next briefing lands Monday."
        : "You're already on the list.",
    });
  } catch (err) {
    console.error("subscribe error", err);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
