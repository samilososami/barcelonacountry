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

const headersFor = (origin: string | null) => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://bcncountryfest.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
});

const respond = (body: Record<string, unknown>, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: headersFor(origin) });

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[character] ?? character));

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return new Response("ok", { headers: headersFor(origin) });
  if (request.method !== "POST") return respond({ error: "method_not_allowed" }, 405, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization") ?? "";
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) return respond({ error: "unauthorized" }, 401, origin);

  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) return respond({ error: "unauthorized" }, 401, origin);

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: admin } = await serviceClient.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return respond({ error: "forbidden" }, 403, origin);

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("NEWSLETTER_FROM_EMAIL");
  if (!resendApiKey || !fromEmail) return respond({ error: "email_not_configured" }, 503, origin);

  const { data: issue } = await serviceClient
    .from("newsletter_issues")
    .select("title, content")
    .eq("issue_number", 1)
    .eq("is_published", true)
    .maybeSingle();
  if (!issue) return respond({ error: "issue_one_not_published" }, 409, origin);

  const { data: registrations, error: registrationsError } = await serviceClient
    .from("registrations")
    .select("id, full_name, email")
    .eq("newsletter_consent", true)
    .is("welcome_newsletter_sent_at", null)
    .limit(100);
  if (registrationsError) return respond({ error: "registrations_unavailable" }, 500, origin);

  const paragraphs = issue.content
    .split(/\n{2,}/)
    .map((paragraph: string) => `<p style="margin:0 0 18px;line-height:1.65">${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
  let sent = 0;
  let failed = 0;

  for (const registration of registrations ?? []) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Barcelona Country Fest <${fromEmail}>`,
        to: [registration.email],
        subject: `Newsletter nº 1 · ${issue.title}`,
        html: `<div style="background:#0b0b0b;padding:32px 18px;color:#f7f4ee;font-family:Arial,sans-serif"><div style="max-width:640px;margin:auto;border-top:6px solid #c40000;padding:32px;background:#171717"><p style="color:#c40000;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Barcelona Country Fest · Newsletter nº 1</p><h1 style="font-size:34px;line-height:1.05;margin:18px 0 24px">${escapeHtml(issue.title)}</h1><p>Hola ${escapeHtml(registration.full_name)},</p>${paragraphs}<p style="margin-top:30px;color:#aaa">22–24 de octubre de 2027 · Fira Cornellà</p></div></div>`
      })
    });
    if (response.ok) {
      sent += 1;
      await serviceClient.from("registrations").update({ welcome_newsletter_sent_at: new Date().toISOString() }).eq("id", registration.id);
    } else {
      failed += 1;
    }
  }

  return respond({ ok: true, sent, failed, remaining_batch: (registrations?.length ?? 0) === 100 }, 200, origin);
});
