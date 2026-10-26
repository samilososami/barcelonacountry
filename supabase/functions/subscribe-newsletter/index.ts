import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://barcelonacountry.com",
  "https://www.barcelonacountry.com",
  "https://bcncountryfest.com",
  "https://www.bcncountryfest.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

const jsonHeaders = (origin: string | null) => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://bcncountryfest.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
});

const respond = (body: Record<string, unknown>, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders(origin) });

const normalizeText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[character] ?? character));

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return new Response("ok", { headers: jsonHeaders(origin) });
  if (request.method !== "POST") return respond({ error: "method_not_allowed" }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return respond({ error: "origin_not_allowed" }, 403, origin);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return respond({ error: "invalid_json" }, 400, origin);
  }

  const fullName = normalizeText(payload.full_name, 160);
  const phone = normalizeText(payload.phone, 40);
  const email = normalizeText(payload.email, 320).toLowerCase();
  const countryIso = normalizeText(payload.country_iso, 2).toUpperCase();
  const danceLocation = normalizeText(payload.dance_location, 180);
  const locale = normalizeText(payload.locale, 2).toLowerCase();
  const privacyAccepted = payload.privacy_accepted === true;
  const newsletterConsent = payload.newsletter_consent === true;

  if (!fullName || phone.length < 5 || !email.includes("@") || !privacyAccepted || !newsletterConsent) {
    return respond({ error: "invalid_subscription" }, 422, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return respond({ error: "service_unavailable" }, 503, origin);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .insert({
      full_name: fullName,
      phone,
      email,
      country_iso: /^[A-Z]{2}$/.test(countryIso) ? countryIso : null,
      dance_location: danceLocation || null,
      newsletter_consent: true,
      privacy_accepted_at: new Date().toISOString(),
      subscription_locale: ["de", "es", "ca", "fr", "en", "it"].includes(locale) ? locale : "es"
    })
    .select("id")
    .single();

  if (registrationError) {
    if (registrationError.code === "23505") return respond({ error: "duplicate" }, 409, origin);
    console.error("registration_insert_failed", registrationError.code);
    return respond({ error: "registration_failed" }, 500, origin);
  }

  const { data: issue } = await supabase
    .from("newsletter_issues")
    .select("title, excerpt, content")
    .eq("issue_number", 1)
    .eq("is_published", true)
    .maybeSingle();

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("NEWSLETTER_FROM_EMAIL");
  if (!issue || !resendApiKey || !fromEmail) {
    return respond({ ok: true, welcome_email: "pending_configuration" }, 201, origin);
  }

  const paragraphs = issue.content
    .split(/\n{2,}/)
    .map((paragraph: string) => `<p style="margin:0 0 18px;line-height:1.65">${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `Barcelona Country Fest <${fromEmail}>`,
      to: [email],
      subject: `Newsletter nº 1 · ${issue.title}`,
      html: `<div style="background:#0b0b0b;padding:32px 18px;color:#f7f4ee;font-family:Arial,sans-serif"><div style="max-width:640px;margin:auto;border-top:6px solid #c40000;padding:32px;background:#171717"><p style="color:#c40000;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Barcelona Country Fest · Newsletter nº 1</p><h1 style="font-size:34px;line-height:1.05;margin:18px 0 24px">${escapeHtml(issue.title)}</h1><p>Hola ${escapeHtml(fullName)},</p>${paragraphs}<p style="margin-top:30px;color:#aaa">22–24 de octubre de 2027 · Fira Cornellà</p></div></div>`
    })
  });

  if (emailResponse.ok) {
    await supabase.from("registrations").update({ welcome_newsletter_sent_at: new Date().toISOString() }).eq("id", registration.id);
    return respond({ ok: true, welcome_email: "sent" }, 201, origin);
  }

  console.error("welcome_email_failed", emailResponse.status);
  return respond({ ok: true, welcome_email: "failed" }, 201, origin);
});
