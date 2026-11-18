import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";

function failOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("host");
  return host ? !origin.endsWith(host) : true;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await auth.service
    .from("products")
    .select("id,name,part_number,description,specifications,selling_unit,stock_quantity,low_stock_threshold,published,archived,image_url,category_id")
    .eq("archived", false)
    .order("name");
  if (error) return NextResponse.json({ error: "Unable to load products" }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (failOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = String(body.name || "").trim();
  const partNumber = String(body.partNumber || "").trim();
  const description = String(body.description || "").trim();
  const sellingUnit = String(body.sellingUnit || "piece").trim();
  const stock = Number(body.stock);
  const lowStock = Number(body.lowStockThreshold);

  if (!name || !partNumber) {
    return NextResponse.json({ error: "Name and part number are required" }, { status: 400 });
  }
  if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(lowStock) || lowStock < 0) {
    return NextResponse.json({ error: "Stock values must be valid non-negative numbers" }, { status: 400 });
  }

  let specifications: Record<string, string> = {};
  if (typeof body.specifications === "object" && body.specifications) {
    specifications = Object.fromEntries(
      Object.entries(body.specifications)
        .filter(([key, value]) => String(key).trim() && String(value).trim())
        .map(([key, value]) => [String(key).trim().slice(0, 100), String(value).trim().slice(0, 500)])
    );
  }

  const { data, error } = await auth.service
    .from("products")
    .insert({
      name: name.slice(0, 200),
      part_number: partNumber.slice(0, 100),
      category_id: body.categoryId || null,
      description: description.slice(0, 5000),
      specifications,
      selling_unit: sellingUnit.slice(0, 100),
      stock_quantity: stock,
      low_stock_threshold: lowStock,
      published: Boolean(body.published),
      archived: false,
      image_url: String(body.imageUrl || "/images/equipment-sourcing.jpg").slice(0, 1000)
    })
    .select("id")
    .single();

  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json({ error: duplicate ? "That part number already exists" : "Unable to create product" }, { status: duplicate ? 409 : 500 });
  }
  return NextResponse.json({ id: data.id });
}
