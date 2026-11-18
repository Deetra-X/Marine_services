import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase-server";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("host");
    if (!host || !origin.endsWith(host)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(`inquiry:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  if (!name || !email || !message) return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });

  const supabase = createServiceClient();
  if (supabase) {
    const { error } = await supabase.from("contact_inquiries").insert({
      name, email, phone: String(body.phone || "").trim(), message
    });
    if (error) return NextResponse.json({ error: "Unable to save inquiry" }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY && process.env.SELLER_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Marine Supply <onboarding@resend.dev>",
        to: process.env.SELLER_EMAIL,
        subject: "New website inquiry",
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${body.phone || "-"}\n\n${message}`
      });
    } catch {
      return NextResponse.json({ warning: "Inquiry saved, but email delivery failed" });
    }
  }
  return NextResponse.json({ ok: true });
}
