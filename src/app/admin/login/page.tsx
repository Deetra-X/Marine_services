"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add the environment variables in .env.local.");
      setLoading(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password"))
    });
    if (signInError) setError(signInError.message);
    else router.push("/admin");
    setLoading(false);
  }

  return (
    <section className="container" style={{maxWidth:520}}>
      <div className="contact-card">
        <p className="eyebrow">Authorized personnel</p>
        <h1>Admin login</h1>
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
          <div className="field" style={{marginTop:16}}><label htmlFor="password">Password</label><input id="password" name="password" type="password" required /></div>
          {error && <p className="alert" role="alert">{error}</p>}
          <button className="button button-navy" type="submit" disabled={loading} style={{marginTop:18}}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
      </div>
    </section>
  );
}
