import { Children } from 'react'
import { ProductStudy } from './ProductStudies'
import './uiux.css'

const rows = (items: string[]) => items.map((item, i) => <div key={item} className="ux-row"><span>0{i + 1}</span><strong>{item}</strong><i /></div>)

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const sections = Children.toArray(children)
  return <article className={`ux-case ${className}`}>{sections.slice(0, -1)}<ProductStudy product={className as 'tripmate' | 'medicare' | 'shoply'} />{sections.slice(-1)}</article>
}

function Label({ children }: { children: React.ReactNode }) { return <p className="ux-label">{children}</p> }

export function TripMateCaseStudy() {
  return <Frame className="tripmate">
    <header className="trip-hero">
      <div className="ux-top"><span>TRIPMATE / 01</span><span>TRAVEL PLANNING / 2026</span></div>
      <div className="trip-orbit"><span>MYKONOS</span><span>ATHENS</span><span>ROME</span><b>✦</b></div>
      <div className="trip-hero-copy"><Label>Plan less. Go further.</Label><h1>Trip<br /><em>Mate</em></h1><p>A calm travel companion for turning scattered inspiration into one clear itinerary.</p></div>
      <div className="trip-ticket"><span>TRIP / 04</span><strong>ATH → LIS</strong><small>JUN 18 — JUN 24</small><div className="trip-line" /></div>
    </header>
    <section className="trip-intro"><div><Label>01 — The brief</Label><h2>Travel should feel like a route, not a research project.</h2></div><p>TripMate brings flights, stays, places and daily plans into a single visual rhythm. The interface keeps the next useful decision close, without turning a holiday into a spreadsheet.</p></section>
    <section className="trip-route"><div className="trip-section-head"><Label>02 — Your route</Label><span>7 DAYS / 6 NIGHTS</span></div><div className="route-map"><div className="route-path" /><div className="route-pin pin-a">01<span>Lisbon</span></div><div className="route-pin pin-b">02<span>Sintra</span></div><div className="route-pin pin-c">03<span>Cascais</span></div><div className="route-card"><small>DAY 03 / WEDNESDAY</small><strong>Slow morning<br />in Sintra</strong><span>4 places saved · 2.4 km</span></div></div></section>
    <section className="trip-itinerary"><Label>03 — One clear day</Label><h2>Everything in its place.</h2><div className="trip-day-grid"><div className="trip-day active"><b>WED</b><strong>03</strong><span>Sintra</span></div><div className="trip-day"><b>THU</b><strong>04</strong><span>Cascais</span></div><div className="trip-day"><b>FRI</b><strong>05</strong><span>Lisbon</span></div></div>{rows(['Breakfast at 8:30', 'Palácio da Pena', 'Late lunch / Tascantiga', 'Sunset at Cabo da Roca'])}</section>
    <footer className="ux-footer trip-footer"><strong>Find your way.</strong><span>TripMate / Product design & UX system</span></footer>
  </Frame>
}


export function MedicareCaseStudy() {
  return <Frame className="medicare">
    <header className="med-hero"><div className="ux-top"><span>MEDICARE / 02</span><span>HEALTHCARE / 2026</span></div><div className="med-brand"><span className="med-cross">+</span><span>medicare</span></div><div className="med-hero-content"><Label>Care, made easier.</Label><h1>Good care<br /><i>starts here.</i></h1><p>Making the first step toward better health feel simple, human and immediate.</p></div><div className="med-search"><span>⌕</span><span>Find a doctor, specialty or symptom</span><b>↗</b></div></header>
    <section className="med-problem"><div><Label>01 — The opportunity</Label><h2>Healthcare is complex enough.</h2></div><p>Medicare turns appointment anxiety into a guided, reassuring flow. Clear choices, plain language and a patient profile that remembers what matters.</p><div className="med-metrics"><div><strong>Find</strong><span>specialty & availability</span></div><div><strong>Book</strong><span>review before confirming</span></div><div><strong>Manage</strong><span>reschedule & cancel</span></div></div></section>
    <section className="med-dashboard"><div className="med-dash-head"><Label>02 — Patient home</Label><span className="med-avatar">MA</span></div><div className="med-welcome"><span>Good morning, Maya</span><strong>How can we help today?</strong></div><div className="med-actions"><div className="med-action primary"><b>＋</b><strong>Book an appointment</strong><span>Find the right care</span></div><div className="med-action"><b>◷</b><strong>My appointments</strong><span>Next: Jun 18, 10:30</span></div><div className="med-action"><b>♡</b><strong>Saved doctors</strong><span>4 specialists</span></div></div><div className="med-appointment"><div><Label>UPCOMING APPOINTMENT</Label><h3>Dr. Eleni Papadopoulou</h3><p>Dermatology · Wednesday, Jun 18 at 10:30</p></div><span>Appointment overview</span></div></section>
    <section className="med-flow"><Label>03 — Booking flow</Label><h2>Less form. More reassurance.</h2><div className="med-steps"><div className="med-step done"><span>01</span><strong>Choose care</strong><p>Specialty or symptom</p></div><div className="med-step current"><span>02</span><strong>Pick a time</strong><p>Only real availability</p></div><div className="med-step"><span>03</span><strong>Feel prepared</strong><p>Clear confirmation</p></div></div></section>
    <footer className="ux-footer med-footer"><strong>Care is a conversation.</strong><span>Medicare / Product design & UX system</span></footer>
  </Frame>
}


export function ShoplyCaseStudy() {
  return <Frame className="shoply"><header className="shop-hero"><div className="ux-top"><span>SHOPLY / 03</span><span>COMMERCE / 2025</span></div><div className="shop-nav"><strong>shoply<span>.</span></strong><span>New / Men / Women / Objects</span><b>Bag (02)</b></div><div className="shop-hero-type"><small>DROP 08 — NEW SEASON</small><h1>Make<br /><i>room.</i></h1><a href="#shoply-prototype" onClick={(e) => { e.preventDefault(); document.getElementById("shoply-prototype")?.scrollIntoView({ behavior: "smooth", block: "start" }) }}>Explore the interactive edit</a></div><div className="shop-disc">OBJECTS<br />FOR<br />EVERYDAY</div></header><section className="shop-statement"><Label>01 — The idea</Label><h2>An online store with the energy of a good discovery.</h2><p>Shoply uses a bold editorial grid, fast filters and a frictionless bag to make browsing feel tactile. The product is always the hero.</p></section><section className="shop-catalog"><div className="shop-catalog-head"><Label>02 — The new edit</Label><span>24 PRODUCTS / FILTER + SORT</span></div><div className="shop-filters"><b>All</b><span>Clothing</span><span>Objects</span><span>Accessories</span><span className="shop-sort">Sort: Featured ↓</span></div><div className="shop-grid"><Product name="Soft form chair" price="€420" color="orange" tag="NEW" /><Product name="Daily carry tote" price="€84" color="blue" tag="BESTSELLER" /><Product name="Object 04 lamp" price="€190" color="green" tag="LIMITED" /><Product name="Everyday cap" price="€42" color="pink" tag="" /></div></section><section className="shop-cart"><div><Label>03 — Designed to convert</Label><h2>One visible next step.</h2></div><div className="shop-cart-card"><span>02 ITEMS</span><strong>Your bag is ready.</strong><span>Bag → delivery → review</span></div></section><footer className="ux-footer shop-footer"><strong>Objects with a point of view.</strong><span>Shoply / Product design & UX system</span></footer></Frame>
}

function Product({ name, price, color, tag }: { name: string; price: string; color: string; tag: string }) {
  const asset = name.includes('chair') ? 'chair' : name.includes('tote') ? 'tote' : name.includes('lamp') ? 'lamp' : 'cap'
  return <div className="product"><div className={`product-art ${color}`}><span>{tag}</span><img src={`/projects/uiux/${asset}.svg`} alt={`${name} / concept illustration`} loading="lazy" /></div><div className="product-meta"><strong>{name}</strong><span>{price}</span></div></div>
}
