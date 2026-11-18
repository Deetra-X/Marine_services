"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadCart, saveCart, CartItem } from "@/lib/cart";
import { Product } from "@/lib/data";

export default function OrderListPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setCart(loadCart());
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  function update(items: CartItem[]) {
    setCart(items);
    saveCart(items);
    window.dispatchEvent(new Event("marine-cart-updated"));
  }

  const entries = cart.map(item => ({item, product:products.find(p => p.id === item.productId)})).filter(row => row.product);

  return (
    <section className="container">
      <h1 style={{fontSize:48, marginTop:0}}>Your order list</h1>
      {entries.length === 0 ? (
        <div className="alert"><p>Your order list is empty.</p><Link className="button button-navy" href="/products">Browse products</Link></div>
      ) : (
        <>
          <table className="cart-table">
            <thead><tr><th>Product</th><th>Part number</th><th>Quantity</th><th></th></tr></thead>
            <tbody>
              {entries.map(({item, product}) => product && (
                <tr key={item.productId}>
                  <td><div style={{display:"flex", alignItems:"center", gap:12}}>{product.image && <Image src={product.image} alt="" width={76} height={76} />}<strong>{product.name}</strong></div></td>
                  <td>{product.partNumber}</td>
                  <td><input aria-label={`Quantity for ${product.name}`} type="number" min="1" max="999" value={item.quantity} onChange={e => update(cart.map(row => row.productId === item.productId ? {...row, quantity:Math.max(1, Number(e.target.value)||1)} : row))} /></td>
                  <td><button className="remove-button" type="button" onClick={() => update(cart.filter(row => row.productId !== item.productId))}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary">
            <Link className="button button-outline" href="/products">Continue browsing</Link>
            <Link className="button" href="/order">Proceed to submit request</Link>
          </div>
        </>
      )}
    </section>
  );
}
