import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await auth.service.from("categories").select("id,name,archived").order("name");
  if (error) return NextResponse.json({ error: "Unable to load categories" }, { status: 500 });
  return NextResponse.json(data || []);
}
