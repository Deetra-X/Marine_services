import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Services — Marine Supply" };

export default function ServicesPage() {
  const services = [
    ["Equipment sourcing", "We help identify suitable safety, deck, engine and electrical equipment based on the details you provide.", "/images/equipment-sourcing.jpg"],
    ["Supply coordination", "We organize the order details and confirm stock, payment and delivery before moving forward.", "/images/supply-coordination.jpg"],
    ["Order support", "Our team stays available to answer questions and provide updates throughout the request process.", "/images/order-support.jpg"]
  ];
  return (
    <>
      <section className="page-hero"><div className="page-hero-inner"><h1>Marine supply services</h1><p>Clear support from equipment sourcing through order confirmation and delivery coordination.</p></div></section>
      <section className="container">
        <div className="services-grid">
          {services.map(([title, copy, image]) => (
            <article className="service-card" key={title}>
              <Image src={image} alt="" width={900} height={600} />
              <h3>{title}</h3><p>{copy}</p>
            </article>
          ))}
        </div>
        <div className="hero-actions" style={{marginTop:32}}>
          <Link className="button button-navy" href="/contact">Contact our team</Link>
          <Link className="button button-outline" href="/products">Browse products</Link>
        </div>
      </section>
    </>
  );
}
