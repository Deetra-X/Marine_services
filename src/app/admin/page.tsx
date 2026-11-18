"use client";

import { useEffect, useState } from "react";

export default function AdminOverviewPage() {
  const [message, setMessage] = useState("Loading dashboard data...");
  useEffect(() => { setMessage("Connect Supabase to display live pending orders, active products and stock levels."); }, []);
  return (
    <>
      <h1>Overview</h1>
      <p className="alert">{message}</p>
      <div className="stats">
        <article className="stat-card"><span>Pending orders</span><strong>—</strong></article>
        <article className="stat-card"><span>Active products</span><strong>—</strong></article>
        <article className="stat-card"><span>Low-stock products</span><strong>—</strong></article>
      </div>
      <section className="admin-panel"><h2>Recent orders</h2><p>Recent order records will appear here after Supabase is connected.</p></section>
    </>
  );
}
