// Stripe webhook: credits STAK after a successful payment.
// Deploy with: supabase functions deploy stak-webhook --no-verify-jwt
// Secrets: STRIPE_WEBHOOK_SECRET. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Must match stak-checkout. The amount credited always comes from this table, never from request data.
const PACKS: Record<string, { stak: number; cents: number }> = {
  "pack-1500": { stak: 1500, cents: 1000 },
  "pack-2500": { stak: 2500, cents: 1500 },
  "pack-10000": { stak: 10000, cents: 5000 },
};

const encoder = new TextEncoder();

async function verifySignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((part) => part.split("=") as [string, string]));
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
  const expected = Array.from(mac).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const header = req.headers.get("stripe-signature");
  if (!secret || !header) return new Response("Bad request", { status: 400 });

  const payload = await req.text();
  if (!(await verifySignature(payload, header, secret))) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(payload);
  const handled = event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
  if (!handled) return new Response("ignored", { status: 200 });

  const session = event.data.object;
  if (session.payment_status !== "paid") return new Response("not paid", { status: 200 });

  const userId = session.metadata?.user_id;
  const pack = PACKS[session.metadata?.pack_id];
  if (!userId || !pack || session.amount_total !== pack.cents) return new Response("invalid order", { status: 400 });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await admin.rpc("stak_credit_from_payment", {
    p_session_id: session.id,
    p_user_id: userId,
    p_pack_id: session.metadata.pack_id,
    p_stak: pack.stak,
    p_amount_cents: session.amount_total,
    p_currency: session.currency || "usd",
  });
  if (error) return new Response("credit failed", { status: 500 });
  return new Response("ok", { status: 200 });
});
