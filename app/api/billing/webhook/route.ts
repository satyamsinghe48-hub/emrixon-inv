import { NextResponse } from "next/server";
import { getBillingProvider } from "@/features/billing/provider";
import { NO_STORE_HEADERS } from "@/lib/security/securityHeaders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("x-billing-signature")?.trim() ?? "";
  if (!signature || signature.length > 4096) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Unsupported webhook content type." }, { status: 415, headers: NO_STORE_HEADERS });
  }

  const payload = await request.text();
  if (!payload || payload.length > 1_000_000) {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  try {
    const provider = getBillingProvider();
    const event = await provider.verifyWebhook(payload, signature);
    // P09 keeps the live provider disabled until a verified adapter is connected.
    // Once enabled, the adapter must atomically persist provider_event_id and
    // update the subscription state server-side.
    return NextResponse.json({ ok: true, event_id: event.id, event_type: event.type }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("No live billing provider")) {
      return NextResponse.json({ error: "Billing provider is not configured." }, { status: 503, headers: NO_STORE_HEADERS });
    }
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400, headers: NO_STORE_HEADERS });
  }
}
