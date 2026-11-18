import { NextResponse } from "next/server";
import { demoProducts } from "@/lib/data";
import { createServiceClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json(demoProducts);

  const { data, error } = await supabase
    .from("products")
    .select("id,name,part_number,description,selling_unit,stock_quantity,low_stock_threshold,published,archived,image_url,category:categories(name), specifications")
    .eq("published", true)
    .eq("archived", false)
    .order("name");

  if (error) return NextResponse.json({ error: "Unable to load products" }, { status: 500 });

  const products = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    partNumber: row.part_number,
    category: Array.isArray(row.category) ? row.category[0]?.name : row.category?.name,
    description: row.description,
    specifications: row.specifications || {},
    sellingUnit: row.selling_unit,
    stock: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    published: row.published,
    archived: row.archived,
    image: row.image_url || ""
  }));
  return NextResponse.json(products);
}
