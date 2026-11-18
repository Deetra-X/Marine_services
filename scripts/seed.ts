import { createClient } from "@supabase/supabase-js";
import { categories, demoProducts } from "../src/lib/data";

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.");
  const supabase = createClient(url, key);

  for (const name of categories) {
    await supabase.from("categories").upsert({ name }, { onConflict: "name" });
  }
  const { data: categoryRows } = await supabase.from("categories").select("id,name");
  for (const product of demoProducts) {
    const category = categoryRows?.find(row => row.name === product.category);
    await supabase.from("products").upsert({
      id: product.id,
      category_id: category?.id,
      name: product.name,
      part_number: product.partNumber,
      description: product.description,
      specifications: product.specifications,
      selling_unit: product.sellingUnit,
      stock_quantity: product.stock,
      low_stock_threshold: product.lowStockThreshold,
      published: product.published,
      archived: product.archived,
      image_url: product.image
    }, { onConflict: "id" });
  }
  console.log("Seeded development categories and products.");
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
