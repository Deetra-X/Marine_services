"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/lib/data";
import { loadCart, saveCart } from "@/lib/cart";

export default function ProductDetailPage() {
  const params = useParams<{id:string}>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then((products: Product[]) => setProduct(products.find(p => p.id === params.id) || null));
  }, [params.id]);

  function add() {
    if (!product) return;
    const cart = loadCart();
    const existing = cart.find(item => item.productId === product.id);
    const next = existing
      ? cart.map(item => item.productId === product.id ? {...item, quantity:item.quantity + quantity} : item)
      : [...cart, {productId:product.id, quantity}];
    saveCart(next);
    window.dispatchEvent(new Event("marine-cart-updated"));
    setStatus(`${quantity} × ${product.name} added to your order.`);
  }

  if (!product) return <section className="container"><p role="status">Loading product details...</p></section>;

  return (
    <section className="container">
      <div className="detail-grid">
        <div className="detail-image">
          {product.image ? <Image src={product.image} alt={product.name} width={1000} height={700} /> : null}
        </div>
        <div className="detail-copy">
          <p className="product-meta">{product.category} · {product.partNumber}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p><strong>Price on request</strong></p>
          <p className={`availability ${product.stock === 0 ? "out" : ""}`}>{product.stock === 0 ? "Unavailable" : "Availability subject to confirmation"}</p>
          <ul className="spec-list">
            {Object.entries(product.specifications).map(([key, value]) => <li key={key}><strong>{key}</strong><span>{value}</span></li>)}
            <li><strong>Selling unit</strong><span>{product.sellingUnit}</span></li>
          </ul>
          <div className="quantity-row">
            <label htmlFor="quantity"><strong>Quantity</strong></label>
            <input id="quantity" type="number" min="1" max="999" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <button className="button" type="button" onClick={add} disabled={product.stock === 0}>Add to order</button>
          {status && <p className="alert" role="status">{status}</p>}
          <p>Our team will confirm availability, payment and delivery before the order is finalized.</p>
          <Link className="text-link" href="/order-list">View order list</Link>
        </div>
      </div>
    </section>
  );
}
