// Creates a Stripe Checkout Session for a STAK pack.
// Secrets: STRIPE_SECRET_KEY, SITE_URL (e.g. https://yoursite.com). SUPABASE_URL / SUPABASE_ANON_KEY are provided automatically.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Server-side source of truth for pack prices. Keep in sync with stak-webhook and stak.js.
const PACKS: Record<string, { stak: number; cents: number; name: string }> = {
  "pack-1500": { stak: 1500, cents: 1000, name: "1,500 STAK" },
  "pack-2500": { stak: 2500, cents: 1500, name: "2,500 STAK" },
  "pack-10000": { stak: 10000, cents: 5000, name: "10,000 STAK" },
};

const SITE_URL = (Deno.env.get("SITE_URL") || "").replace(/\/$/, "");
const cors = {
  "Access-Control-Allow-Origin": SITE_URL || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey || !SITE_URL) return json({ error: "PAYMENTS_NOT_CONFIGURED" }, 500);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ error: "NOT_AUTHENTICATED" }, 401);

  let packId = "";
  try { packId = String((await req.json()).packId || ""); } catch { /* handled below */ }
  const pack = PACKS[packId];
  if (!pack) return json({ error: "UNKNOWN_PACK" }, 400);

  const form = new URLSearchParams({
    mode: "payment",
    "payment_method_types[0]": "card",
    client_reference_id: userData.user.id,
    success_url: `${SITE_URL}/shop.html?stak=success`,
    cancel_url: `${SITE_URL}/shop.html?stak=cancelled`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(pack.cents),
    "line_items[0][price_data][product_data][name]": `ANIVIA ${pack.name}`,
    "metadata[user_id]": userData.user.id,
    "metadata[pack_id]": packId,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const session = await response.json();
  if (!response.ok || !session.url) return json({ error: "CHECKOUT_FAILED" }, 502);
  return json({ url: session.url });
});
