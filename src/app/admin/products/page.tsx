"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type Category = { id:string; name:string; archived:boolean };
type Product = { id:string; name:string; part_number:string; stock_quantity:number; published:boolean; image_url:string };

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [preview, setPreview] = useState("/images/equipment-sourcing.jpg");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [categoryRes, productRes] = await Promise.all([
      fetch("/api/admin/categories"),
      fetch("/api/admin/products")
    ]);
    if (categoryRes.ok) setCategories(await categoryRes.json());
    if (productRes.ok) setProducts(await productRes.json());
  }

  useEffect(() => { load(); }, []);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/product-images", { method:"POST", body:form });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Image upload failed");
      return;
    }
    setPreview(data.url);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const specifications = String(form.get("specifications") || "")
      .split("\n")
      .map(line => line.split(":").map(part => part.trim()))
      .filter(parts => parts.length >= 2)
      .reduce<Record<string,string>>((result, [key, ...value]) => {
        if (key) result[key] = value.join(":");
        return result;
      }, {});

    const res = await fetch("/api/admin/products", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        name:form.get("name"),
        partNumber:form.get("partNumber"),
        categoryId:form.get("categoryId") || null,
        description:form.get("description"),
        specifications,
        sellingUnit:form.get("sellingUnit"),
        stock:Number(form.get("stock")),
        lowStockThreshold:Number(form.get("lowStockThreshold")),
        published:form.get("published") === "on",
        imageUrl:preview
      })
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Unable to create product");
    else {
      setMessage("Product created successfully.");
      event.currentTarget.reset();
      setPreview("/images/equipment-sourcing.jpg");
      setShowForm(false);
      await load();
    }
    setSaving(false);
  }

  return (
    <>
      <div className="admin-heading">
        <h1>Products</h1>
        <button className="button button-navy" type="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "Add product"}
        </button>
      </div>

      {showForm && (
        <div className="admin-panel">
          <h2>Add product</h2>
          <form className="admin-product-layout" onSubmit={create}>
            <div>
              <div className="image-preview">
                <Image src={preview} alt="Selected product preview" fill sizes="280px" />
              </div>
              <div className="field" style={{marginTop:12}}>
                <label htmlFor="product-image">Product image</label>
                <input id="product-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />
              </div>
            </div>
            <div className="form-grid">
              <div className="field"><label htmlFor="name">Product name *</label><input id="name" name="name" required maxLength={200} /></div>
              <div className="field"><label htmlFor="partNumber">Part number *</label><input id="partNumber" name="partNumber" required maxLength={100} /></div>
              <div className="field">
                <label htmlFor="categoryId">Category</label>
                <select id="categoryId" name="categoryId">
                  <option value="">No category</option>
                  {categories.filter(c => !c.archived).map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="field"><label htmlFor="sellingUnit">Selling unit</label><input id="sellingUnit" name="sellingUnit" defaultValue="piece" maxLength={100} /></div>
              <div className="field"><label htmlFor="stock">Stock quantity</label><input id="stock" name="stock" type="number" min="0" defaultValue="0" required /></div>
              <div className="field"><label htmlFor="lowStockThreshold">Low-stock threshold</label><input id="lowStockThreshold" name="lowStockThreshold" type="number" min="0" defaultValue="0" required /></div>
              <div className="field form-wide"><label htmlFor="description">Description</label><textarea id="description" name="description" maxLength={5000} /></div>
              <div className="field form-wide"><label htmlFor="specifications">Specifications (one per line: Name: Value)</label><textarea id="specifications" name="specifications" placeholder="Diameter: 750 mm&#10;Material: Polyethylene" /></div>
              <label className="checkbox-field form-wide"><input name="published" type="checkbox" /> Publish to public catalog</label>
              <button className="button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save product"}</button>
            </div>
          </form>
        </div>
      )}

      {message && <p className="alert" role="status">{message}</p>}

      <div className="admin-panel">
        <h2>Product list</h2>
        {products.length === 0 ? <p>No products have been created yet.</p> : (
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Part number</th><th>Stock</th><th>Status</th></tr></thead>
            <tbody>{products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.part_number}</td>
                <td>{product.stock_quantity}</td>
                <td><span className="status">{product.published ? "Published" : "Draft"}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
