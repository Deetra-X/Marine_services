import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "About — Marine Supply" };

export default function AboutPage() {
  return (
    <>
      <section className="page-hero"><div className="page-hero-inner"><h1>About Marine Supply</h1><p>Responsive supply support built around clear communication and customer needs.</p></div></section>
      <section className="container content-grid">
        <div>
          <p className="eyebrow">Our approach</p>
          <h2>Practical help, one order at a time.</h2>
          <p>Marine Supply helps customers source equipment and coordinate marine supply orders. We focus on understanding the vessel, the required equipment and the delivery context before confirming an order.</p>
          <p>Our process keeps communication direct: browse the catalog, submit an order request, and let our team confirm availability, payment and delivery arrangements with you personally.</p>
          <Link className="button button-navy" href="/contact">Talk to our team</Link>
        </div>
        <div className="photo-frame">
          <Image src="/images/about-team.jpg" alt="Team member reviewing maritime supply requirements" fill sizes="(max-width: 720px) 100vw, 50vw" />
        </div>
      </section>
    </>
  );
}
