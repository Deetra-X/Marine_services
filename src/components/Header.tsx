"use client";

import Link from "next/link";
import { Menu, Ship, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { company } from "@/lib/data";
import { loadCart } from "@/lib/cart";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(loadCart().reduce((sum, item) => sum + item.quantity, 0));
    update();
    window.addEventListener("storage", update);
    window.addEventListener("marine-cart-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("marine-cart-updated", update);
    };
  }, []);

  const links = [
    ["Home", "/"],
    ["About", "/about"],
    ["Services", "/services"],
    ["Products", "/products"],
    ["Contact", "/contact"]
  ] as const;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label={`${company.name} home`}>
          <Ship aria-hidden="true" />
          <span>MARINE SUPPLY</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="order-list" href="/order-list">
            <ShoppingBag size={18} aria-hidden="true" />
            <span>Order list ({count})</span>
          </Link>
          <Link className="button button-small" href="/contact">Contact us</Link>
          <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav">
            {open ? <X /> : <Menu />}<span className="sr-only">Menu</span>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
      )}
    </header>
  );
}
