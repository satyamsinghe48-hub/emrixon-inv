import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runReminderWorker } from "@/features/reminders/worker/processJob";
import { NO_STORE_HEADERS } from "@/lib/security/securityHeaders";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const expected = process.env.CRON_SECRET ?? "";
  const provided = request.headers.get("authorization") ?? "";
  const expectedHeader = `Bearer ${expected}`;
  if (expected.length < 24 || provided.length !== expectedHeader.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expectedHeader));
}

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return response({ ok: false, error: "Unauthorized" }, 401);
  try {
    const workerId = `vercel-cron-${crypto.randomUUID()}`;
    const result = await runReminderWorker(workerId);
    return response({ ok: true, claimed: result.claimed, results: result.results });
  } catch {
    // Do not expose provider/database/internal errors through a public worker endpoint.
    return response({ ok: false, error: "Worker execution failed." }, 500);
  }
}

export const POST = GET;
