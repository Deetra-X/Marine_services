"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Boxes, ClipboardList, Tags } from "lucide-react";

export default function AdminLayout({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <Link href="/admin"><LayoutDashboard size={19}/>Overview</Link>
        <Link href="/admin/products"><Package size={19}/>Products</Link>
        <Link href="/admin/inventory"><Boxes size={19}/>Inventory</Link>
        <Link href="/admin/orders"><ClipboardList size={19}/>Orders</Link>
        <Link href="/admin/categories"><Tags size={19}/>Categories</Link>
      </aside>
      <section className="admin-main">{children}</section>
    </div>
  );
}
