"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories, demoProducts, Product } from "@/lib/data";
import { loadCart, saveCart } from "@/lib/cart";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("/api/products").then(async r => {
      if (!r.ok) throw new Error("Unable to load products");
      return r.json();
    }).then(setProducts).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => products.filter(p =>
    (category === "All" || p.category === category) &&
    `${p.name} ${p.partNumber}`.toLowerCase().includes(search.toLowerCase())
  ), [products, search, category]);

  function add(product: Product) {
    const cart = loadCart();
    const existing = cart.find(item => item.productId === product.id);
    const next = existing
      ? cart.map(item => item.productId === product.id ? {...item, quantity:item.quantity + 1} : item)
      : [...cart, { productId: product.id, quantity:1 }];
    saveCart(next);
    window.dispatchEvent(new Event("marine-cart-updated"));
  }

  return (
    <>
      <section className="page-hero"><div className="page-hero-inner"><h1>Marine products</h1><p>Browse available equipment and add items to an order request.</p></div></section>
      <section className="container">
        <div className="catalog-toolbar">
          <div className="field"><label htmlFor="catalog-search">Search by name or part number</label><input id="catalog-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products" /></div>
          <div className="field"><label htmlFor="catalog-category">Category</label><select id="catalog-category" value={category} onChange={e => setCategory(e.target.value)}><option>All</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
        </div>
        <div className="category-pills" aria-label="Product categories">
          {["All", ...categories].map(c => <button key={c} className={`pill ${category === c ? "active" : ""}`} onClick={() => setCategory(c)} type="button">{c}</button>)}
        </div>
        {loading && <p role="status">Loading products...</p>}
        {error && <p className="alert" role="alert">{error}</p>}
        {!loading && !error && visible.length === 0 && <p className="alert">No products match this search. Try another category or term.</p>}
        <div className="product-grid">
          {visible.map(product => (
            <article className="product-card" key={product.id}>
              <div className="product-card-image">
                {product.image ? <Image src={product.image} alt={product.name} width={900} height={600} /> : <div style={{height:"100%", background:"#dfe5ed"}} />}
              </div>
              <div className="product-card-body">
                <p className="product-meta">{product.category} · {product.partNumber}</p>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <span className={`availability ${product.stock === 0 ? "out" : product.stock <= product.lowStockThreshold ? "low" : ""}`}>
                  {product.stock === 0 ? "Unavailable" : product.stock <= product.lowStockThreshold ? "Low stock — confirm availability" : "Available"}
                </span>
                <p><strong>Price on request</strong></p>
                <div className="card-actions">
                  <Link className="button button-outline" href={`/products/${product.id}`}>View details</Link>
                  <button className="button" type="button" onClick={() => add(product)} disabled={product.stock === 0}>Add to order</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
