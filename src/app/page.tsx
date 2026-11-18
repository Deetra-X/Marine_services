import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1>Marine supplies.<br />Personal service.</h1>
          <p>Equipment and supply support for your next voyage.</p>
          <div className="hero-actions">
            <Link className="button" href="/about">Discover our company</Link>
            <Link className="text-link" href="/products">Explore products <ArrowRight size={18} style={{verticalAlign:"middle"}} /></Link>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="about-feature">
          <div className="photo-frame">
            <Image src="/images/about-team.jpg" alt="Maritime supply team coordinating equipment" fill sizes="(max-width: 720px) 100vw, 50vw" priority />
          </div>
          <div>
            <p className="eyebrow">About us</p>
            <h2>A personal approach to marine supply.</h2>
            <p>We help customers find marine equipment and coordinate their orders through direct, personal communication.</p>
            <p>Tell us what you need. Our team will confirm availability and arrange payment and delivery with you.</p>
            <Link className="text-link" href="/about">More about our company <ArrowRight size={18} style={{verticalAlign:"middle"}} /></Link>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="section-heading">
          <h2>Support for your marine operations.</h2>
          <Link className="text-link" href="/services">View our services <ArrowRight size={18} style={{verticalAlign:"middle"}} /></Link>
        </div>
        <div className="services-grid">
          {[
            ["Equipment sourcing", "Discuss your equipment and spare-part requirements.", "/images/equipment-sourcing.jpg"],
            ["Supply coordination", "Arrange the details for your order and delivery.", "/images/supply-coordination.jpg"],
            ["Order support", "Speak directly with our team throughout your order.", "/images/order-support.jpg"]
          ].map(([title, copy, image]) => (
            <article className="service-card" key={title}>
              <Image src={image} alt="" width={900} height={600} style={{objectFit:"cover"}} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-banner">
        <div className="contact-banner-inner">
          <div>
            <h2>Let&apos;s discuss what you need.</h2>
            <p>Explore our products or speak with our team.</p>
          </div>
          <div className="contact-banner-actions">
            <Link className="button" href="/contact">Contact our team</Link>
            <Link className="button button-outline" href="/products">Browse products</Link>
          </div>
        </div>
      </section>
    </>
  );
}
