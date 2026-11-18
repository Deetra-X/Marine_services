import Link from "next/link";
import { Ship } from "lucide-react";
import { company } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link className="brand footer-brand" href="/"><Ship /><span>MARINE SUPPLY</span></Link>
        <p>Marine equipment and supply support.</p>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/products">Products</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/order-list">Order list</Link>
        </nav>
      </div>
    </footer>
  );
}
