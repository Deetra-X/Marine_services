"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCart, saveCart } from "@/lib/cart";
import { demoProducts, Product } from "@/lib/data";

export default function OrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState(loadCart());
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [result, setResult] = useState<{reference:string;items:any[]} | null>(null);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({});
    setError("");
    setUnavailable([]);
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form) as Record<string,string>;
    const nextErrors: Record<string,string> = {};
    if (!values.customerName?.trim()) nextErrors.customerName = "Enter your name";
    if (!values.email?.trim()) nextErrors.email = "Enter your email";
    if (!values.phone?.trim()) nextErrors.phone = "Enter your phone";
    if (!values.deliveryAddress?.trim()) nextErrors.deliveryAddress = "Enter a delivery address or location";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setSubmitting(false);
      return;
    }
    let idempotencyKey = sessionStorage.getItem("marine-order-idempotency");
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      sessionStorage.setItem("marine-order-idempotency", idempotencyKey);
    }
    const response = await fetch("/api/orders", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-idempotency-key": idempotencyKey },
      body:JSON.stringify({
        customerName:values.customerName,
        email:values.email,
        phone:values.phone,
        companyName:values.companyName,
        deliveryAddress:values.deliveryAddress,
        vesselName:values.vesselName,
        port:values.port,
        requiredDeliveryDate:values.requiredDeliveryDate,
        additionalNotes:values.additionalNotes,
        items:cart
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to submit the order");
      setUnavailable(data.unavailable || []);
      setSubmitting(false);
      return;
    }
    saveCart([]);
    sessionStorage.removeItem("marine-order-idempotency");
    setCart([]);
    window.dispatchEvent(new Event("marine-cart-updated"));
    setResult(data);
    setSubmitting(false);
  }

  if (result) return (
    <section className="container">
      <div className="alert" role="status">
        <h1>Order request received</h1>
        <p><strong>Order reference:</strong> {result.reference}</p>
        <p>Your request has been received and is pending seller confirmation.</p>
        <p>Our team will contact you to confirm availability, payment and delivery.</p>
      </div>
      <h2>Submitted items</h2>
      <ul>{result.items.map((item:any) => <li key={item.productId}>{item.quantity} × {item.name} ({item.partNumber})</li>)}</ul>
    </section>
  );

  const entries = cart.map(item => ({item, product:products.find(p => p.id === item.productId)})).filter(row => row.product);

  return (
    <section className="container">
      <h1 style={{fontSize:48, marginTop:0}}>Submit order request</h1>
      {entries.length === 0 ? <div className="alert"><p>Your order list is empty.</p><button className="button button-navy" type="button" onClick={() => router.push("/products")}>Browse products</button></div> : (
        <div className="checkout-layout">
          <form onSubmit={submit}>
            <div className="form-grid">
              <Field name="customerName" label="Customer name *" errors={errors} />
              <Field name="email" label="Email *" type="email" errors={errors} />
              <Field name="phone" label="Phone *" errors={errors} />
              <Field name="companyName" label="Company name" errors={errors} />
              <div className="field form-wide"><label htmlFor="deliveryAddress">Delivery address or location *</label><textarea id="deliveryAddress" name="deliveryAddress" />{errors.deliveryAddress && <span className="field-error">{errors.deliveryAddress}</span>}</div>
              <Field name="vesselName" label="Vessel name" errors={errors} />
              <Field name="port" label="Port" errors={errors} />
              <Field name="requiredDeliveryDate" label="Required delivery date" type="date" errors={errors} />
              <div className="field form-wide"><label htmlFor="additionalNotes">Additional notes</label><textarea id="additionalNotes" name="additionalNotes" /></div>
            </div>
            {error && <p className="alert" role="alert">{error}{unavailable.length > 0 && <>: {unavailable.join(", ")}</>}</p>}
            <p>Our team will contact you to confirm availability, payment and delivery.</p>
            <button className="button" type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit order request"}</button>
          </form>
          <aside className="checkout-summary"><h2>Order summary</h2><ul style={{listStyle:"none",padding:0}}>
            {entries.map(({item,product}) => product && <li key={item.productId}><span>{item.quantity} × {product.name}</span><span>{product.partNumber}</span></li>)}
          </ul></aside>
        </div>
      )}
    </section>
  );
}

function Field({name,label,type="text",errors}:{name:string;label:string;type?:string;errors:Record<string,string>}) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} />{errors[name] && <span className="field-error">{errors[name]}</span>}</div>;
}
