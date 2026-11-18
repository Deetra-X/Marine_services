"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving inquiry...");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/inquiries", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(Object.fromEntries(form)) });
    setStatus(res.ok ? "Your inquiry has been received. Our team will contact you." : "The inquiry could not be sent. Please try again.");
    if (res.ok) event.currentTarget.reset();
  }

  return (
    <>
      <section className="page-hero"><div className="page-hero-inner"><h1>Contact our team</h1><p>Tell us what you need and we&apos;ll help arrange the next step.</p></div></section>
      <section className="container contact-layout">
        <aside className="contact-card">
          <p className="eyebrow">Marine Supply</p>
          <h2>How can we help?</h2>
          <p>Ask about an item, request sourcing support or share delivery details for an upcoming order.</p>
          <p><strong>Email</strong><br />info@marinesupply.example</p>
        </aside>
        <form className="contact-card" onSubmit={submit}>
          <div className="form-grid">
            <div className="field"><label htmlFor="name">Name *</label><input id="name" name="name" required /></div>
            <div className="field"><label htmlFor="email">Email *</label><input id="email" name="email" type="email" required /></div>
            <div className="field form-wide"><label htmlFor="phone">Phone</label><input id="phone" name="phone" /></div>
            <div className="field form-wide"><label htmlFor="message">Message *</label><textarea id="message" name="message" required /></div>
          </div>
          <button className="button button-navy" type="submit" style={{marginTop:18}}>Send inquiry</button>
          {status && <p className="alert" role="status">{status}</p>}
        </form>
      </section>
    </>
  );
}
