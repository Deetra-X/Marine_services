import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase-server";
import { demoProducts } from "@/lib/data";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("host");
    if (!host || !origin.endsWith(host)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(`order:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many order requests. Please try again shortly." }, { status: 429 });
  }
  const body = await request.json();
  const idempotency = request.headers.get("x-idempotency-key") || randomUUID();
  const required = ["customerName","email","phone","deliveryAddress"];
  for (const field of required) {
    if (!String(body[field] || "").trim()) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) return NextResponse.json({ error: "Your order list is empty" }, { status: 400 });

  const supabase = createServiceClient();
  let authoritative: any[] = demoProducts;
  if (supabase) {
    const ids = body.items.map((item:any) => String(item.productId));
    const { data, error } = await supabase.from("products").select("id,name,part_number,description,selling_unit,stock_quantity,low_stock_threshold,published,archived,specifications").in("id", ids);
    if (error) return NextResponse.json({ error: "Unable to validate products" }, { status: 500 });
    authoritative = data || [];

    const { data: existing } = await supabase.from("orders").select("*").eq("idempotency_key", idempotency).maybeSingle();
    if (existing) return NextResponse.json({ reference: existing.reference, items: body.items, duplicate: true });
  }

  const unavailable: string[] = [];
  const items = body.items.map((submitted:any) => {
    const product = authoritative.find(p => p.id === submitted.productId);
    if (!product) return null;
    const stock = product.stock_quantity ?? product.stock;
    const quantity = Math.max(1, Math.min(999, Number(submitted.quantity) || 1));
    if (
      product.published === false ||
      product.archived === true ||
      !Number.isInteger(stock) ||
      stock < quantity
    ) {
      unavailable.push(product.name);
    }
    return {
      productId: product.id,
      name: product.name,
      partNumber: product.part_number ?? product.partNumber,
      sellingUnit: product.selling_unit ?? product.sellingUnit,
      quantity,
      specifications: product.specifications || {}
    };
  }).filter(Boolean);

  if (unavailable.length) return NextResponse.json({ error: "Some products are no longer available", unavailable }, { status: 409 });
  if (items.length !== body.items.length) return NextResponse.json({ error: "One or more products could not be found" }, { status: 409 });

  const reference = `MS-${new Date().getFullYear()}-${randomUUID().slice(0,8).toUpperCase()}`;
  if (supabase) {
    const { data: order, error } = await supabase.from("orders").insert({
      reference,
      idempotency_key: idempotency,
      customer_name: body.customerName,
      email: body.email,
      phone: body.phone,
      company_name: body.companyName || null,
      delivery_address: body.deliveryAddress,
      vessel_name: body.vesselName || null,
      port: body.port || null,
      required_delivery_date: body.requiredDeliveryDate || null,
      customer_notes: body.additionalNotes || null,
      status: "pending"
    }).select("id").single();
    if (error) return NextResponse.json({ error: "Unable to save order" }, { status: 500 });

    const { error: itemsError } = await supabase.from("order_items").insert(items.map((item:any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name_snapshot: item.name,
      part_number_snapshot: item.partNumber,
      selling_unit_snapshot: item.sellingUnit,
      specifications_snapshot: item.specifications,
      quantity: item.quantity
    })));
    if (itemsError) return NextResponse.json({ error: "Unable to save order items" }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY && process.env.SELLER_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const text = `Order ${reference}\nCustomer: ${body.customerName}\nEmail: ${body.email}\nPhone: ${body.phone}\nDelivery: ${body.deliveryAddress}\n\nItems:\n${items.map((i:any) => `${i.quantity} × ${i.name} (${i.partNumber})`).join("\n")}\n\nNotes: ${body.additionalNotes || "-"}`;
    await resend.emails.send({ from: process.env.EMAIL_FROM || "Marine Supply <onboarding@resend.dev>", to: process.env.SELLER_EMAIL, subject: `New order request ${reference}`, text });
    await resend.emails.send({ from: process.env.EMAIL_FROM || "Marine Supply <onboarding@resend.dev>", to: body.email, subject: `We received your order request ${reference}`, text: `Your request ${reference} has been received and is pending seller confirmation. Our team will contact you to confirm availability, payment and delivery.` });
  }

  return NextResponse.json({ reference, items });
}
