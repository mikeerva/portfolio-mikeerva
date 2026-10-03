import { Children, useEffect, useState } from 'react'
import './product-studies.css'

type Product = 'tripmate' | 'medicare' | 'shoply' | 'fittrack'
const content = {
  tripmate: {
    title: 'A trip has two coordinates: where, and when.', audience: 'The independent planner travelling with a partner or a small group.', task: 'Turn scattered saved places into a feasible day, then carry the plan offline.',
    hypothesis: 'Keeping the map beside a chronological list should reveal backtracking before it becomes a problem.',
    branches: [['Trip', 'Dates · destination · companions'], ['Plan', 'Days · stops · transport'], ['Library', 'Saved places · discovery'], ['Travel', 'Bookings · notes · offline pack']],
    flow: ['Create trip', 'Destination + dates', 'Save places', 'Assign a day', 'Arrange stops', 'Preview route', 'Download plan'],
    wires: [['Early / list only', 'Day 1', 'Pena Palace', 'Lunch', 'Coast', 'Open map'], ['Iteration / spatial split', 'Map | day timeline', '09:00 Palace', '25 min by car', '13:00 Lunch', 'Reorder stop'], ['Final / travel mode', 'Wednesday · Sintra', 'Next: Pena Palace', 'Booking at 09:00', 'Offline plan ready', 'Mark visited']],
    decision: 'The list-only sketch concealed distances. The second structure adds transport between stops; the final version surfaces the next stop and reservation before discovery.',
    system: ['Inter Tight / destination hierarchy', '8 / 16 / 24 spacing', 'Navy = structure, orange = route', 'Numbered pins match the timeline', 'Place cards hold duration and booking', 'Offline labels separate stored and live data'],
    responsive: 'Desktop supports planning with map and timeline together. On a phone the day comes first, with a Map / Timeline switch and reorder buttons alongside drag. Bookings and downloaded notes remain reachable with one thumb.',
    limits: 'Routes are schematic and transport times are illustrative. Offline mode demonstrates a downloaded plan, not real map caching. The next validation would test whether route changes are understood without reopening the map.',
  },
  medicare: {
    title: 'Make the next decision unambiguous.', audience: 'A patient booking routine care while balancing availability, travel and cost.', task: 'Compare a specialist, choose a real slot, confirm details and manage changes.',
    hypothesis: 'A short sequence with a persistent appointment summary should reduce uncertainty and accidental bookings.',
    branches: [['Find care', 'Specialty · location · availability'], ['Appointments', 'Upcoming · past · reschedule · cancel'], ['Preparation', 'Checklist · documents · reminders'], ['Account', 'Patient details · communication settings']],
    flow: ['Dashboard', 'Specialty', 'Doctor', 'Date + time', 'Patient details', 'Review', 'Confirmation'],
    wires: [['Early / everything together', 'Doctor search', '12 filters', 'Doctor cards', 'Calendar', 'Patient form'], ['Iteration / guided selection', 'Step 2 of 6', 'Doctor summary', 'Available days', 'Time options', 'Continue'], ['Final / review first', 'Review appointment', 'Doctor + location', 'Full date + time', 'Patient details', 'Confirm booking']],
    decision: 'The first sketch overloaded search with booking controls. The revised flow separates comparison from commitment and adds an explicit review before confirmation. Cancellation is a separate two-step action.',
    system: ['Inter / plain language hierarchy', '8 / 16 / 32 spacing', 'Dark teal = primary text', 'Visible focus / 44px controls', 'Explicit labels + inline errors', 'Status text accompanies every color'],
    responsive: 'On desktop the booking summary sits beside the current step. Mobile puts it above the form, keeps one column, and avoids compressing the calendar into tiny targets. Errors remain adjacent to the relevant field.',
    limits: 'This is a fictional appointment product, not a healthcare provider. No clinical advice or real bookings are offered. The next validation would test comprehension of changed availability and cancellation language.',
  },
  shoply: {
    title: 'Discovery earns attention. Details earn a decision.', audience: 'A considered shopper exploring useful home objects and everyday accessories.', task: 'Narrow a catalog, check a variant, understand the total and complete an order.',
    hypothesis: 'Visible filter feedback and a stable product / price / option / action hierarchy should make the purchase path easier to follow.',
    branches: [['Discover', 'Editorial edit · categories · search'], ['Catalog', 'Filter · sort · compare · wishlist'], ['Product', 'Gallery · details · variants · stock'], ['Order', 'Bag · delivery · review · tracking']],
    flow: ['Discover', 'Search / category', 'Filter', 'Product', 'Variant', 'Bag', 'Checkout', 'Order confirmation'],
    wires: [['Early / editorial-heavy', 'Featured story', 'Large product image', 'Small price', 'Hidden options', 'Buy'], ['Iteration / decision order', 'Image | product name', 'Price', 'Variant + stock', 'Delivery note', 'Add to bag'], ['Final / transparent checkout', 'Delivery address', 'Shipping option', 'Payment choice', 'Full order total', 'Place demo order']],
    decision: 'The early layout gave the campaign more weight than product information. The revision brings price and availability above the action; checkout reveals shipping before the order review.',
    system: ['Inter Tight / editorial titles', 'Mono / prices and inventory', '4-column desktop, 2-column mobile', 'Selected filters remain visible', 'Variant buttons show stock', 'Mini-bag confirms quantity and subtotal'],
    responsive: 'Desktop gives imagery room beside product information. Mobile opens filters in a compact disclosure, keeps variant targets large, and places the purchase controls directly after availability. Checkout becomes one labelled column.',
    limits: 'Prices, inventory and delivery are sample data. No payment information is collected and no order is sent. The next validation would compare quick add against product-detail selection for items with variants.',
  },
  fittrack: {
    title: 'The important screen is the one used between sets.', audience: 'A consistent recreational lifter logging training while tired and using one hand.', task: 'Record reps and load quickly, rest, finish the session and interpret progression.',
    hypothesis: 'Keeping the current exercise, last set and one main action visible should reduce navigation during training.',
    branches: [['Today', 'Workout · exercise · active set'], ['Log', 'Reps · load · rest · completion'], ['Progress', 'Volume · frequency · records'], ['Plan', 'Goals · preferences · history']],
    flow: ['Today', 'Workout detail', 'Exercise', 'Log set', 'Rest', 'Next set', 'Session summary', 'Updated progress'],
    wires: [['Early / spreadsheet log', 'Exercise list', 'Set | reps | load', 'Small inputs', 'More menus', 'Save row'], ['Iteration / one active set', 'Exercise 1 of 2', 'Previous set', 'Reps + load', 'Large log action', 'Rest state'], ['Final / meaningful summary', 'Session completed', 'Sets + training volume', 'Record comparison', 'Weekly consistency', 'See progression']],
    decision: 'The table was efficient to scan but difficult to operate during training. The active-set layout removes competing actions; the summary compares the same exercise over time rather than a decorative wellness score.',
    system: ['IBM Plex Mono / active training', 'Inter / explanations and summaries', 'Orange = current set / yellow = rest', '56px primary action', 'Numeric inputs with previous values', 'Charts labelled with kg, sets and sessions'],
    responsive: 'Mobile prioritises reps, load and the log button in one vertical sequence. Desktop and tablet place the session beside the training history. The logging model stays identical so changing devices does not change the workflow.',
    limits: 'Training history is illustrative and the prototype is not coaching or a health assessment. Volume is calculated as reps × load. The next validation would test accidental taps and data entry while users are in a training context.',
  },
}

export function ProductStudy({ product }: { product: Product }) {
  const c = content[product]
  const story = <div className={`product-study study-${product}`}>
    <section className="study-context">
      <p className="study-kicker">02 / 04 — UI / UX · Independent concept · Sample data</p>
      <h2>{c.title}</h2>
      <div className="study-context-grid"><div><h3>Design archetype</h3><p>{c.audience}</p></div><div><h3>Primary task</h3><p>{c.task}</p></div><div><h3>Design hypothesis</h3><p>{c.hypothesis}</p></div></div>
      <p className="study-honesty">Scope: UX architecture, selected wireframes, interface system and an interactive primary flow. These are design explorations; research and business outcomes have not been measured.</p>
    </section>
    <section className="study-architecture"><p className="study-kicker">Product logic / information architecture</p><div className="study-tree">{c.branches.map(([name, children]) => <div key={name}><h3>{name}</h3><p>{children}</p></div>)}</div><ol className="study-flow">{c.flow.map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, '0')}</span>{step}</li>)}</ol></section>
    <section className="study-exploration"><p className="study-kicker">Selected structural explorations</p><div className="study-wires">{c.wires.map(([title, ...parts], index) => <figure key={title} className={`study-wire wire-${index}`}><figcaption>{title}</figcaption><div className="wire-surface"><div className="wire-nav">{product.toUpperCase()} <span>•••</span></div>{parts.map((part, i) => <div key={part} className={`wire-part wire-part-${i}`}>{part}</div>)}</div></figure>)}</div><p className="study-decision"><b>Why it changed</b>{c.decision}</p></section>
    <section className="study-interaction" id={`${product}-prototype`}><p className="study-kicker">Try the primary flow / interactive concept</p>{product === 'tripmate' ? <TravelDemo /> : product === 'medicare' ? <CareDemo /> : product === 'shoply' ? <CommerceDemo /> : <TrainingDemo />}</section>
    <section className="study-system"><p className="study-kicker">A system shaped by the task</p><div className="study-system-grid">{c.system.map((item) => <div key={item}>{item}</div>)}</div><div className="study-specimen"><span>Aa / 0123456789</span><button type="button">Primary action</button><label>Input label<input placeholder="Visible label, clear value" /></label><button disabled>Unavailable</button></div><p>Keyboard focus stays visible. Status changes are announced. Input errors describe a correction. Reduced motion keeps state changes immediate.</p></section>
    <section className="study-responsive"><p className="study-kicker">Responsive decision</p><h2>The context changes the hierarchy.</h2><p>{c.responsive}</p><div className="study-device-model"><div><b>Planning / larger screen</b><span>Overview</span><span>Detail + next action</span></div><div><b>On the move / phone</b><span>Current task</span><span>One clear next action</span></div></div></section>
    <section className="study-review"><p className="study-kicker">Reflection / next validation</p><p>{c.limits}</p></section>
  </div>
  const chapters = Children.toArray(story.props.children)
  const order = {
    tripmate: [0, 1, 3, 2, 5, 4, 6],
    medicare: [0, 1, 2, 4, 3, 5, 6],
    shoply: [0, 3, 1, 2, 5, 4, 6],
    fittrack: [0, 3, 2, 1, 4, 5, 6],
  }
  return <div className={`product-study study-${product}`}>{order[product].map((index) => chapters[index])}</div>
}

type Place = { id: string; name: string; x: number; y: number; minutes: number }
const places: Place[] = [{ id: 'palace', name: 'Pena Palace', x: 30, y: 24, minutes: 90 }, { id: 'lunch', name: 'Tascantiga lunch', x: 49, y: 50, minutes: 60 }, { id: 'coast', name: 'Cabo da Roca', x: 75, y: 72, minutes: 45 }]
function TravelDemo() {
  const [created, setCreated] = useState(false)
  const [destination, setDestination] = useState('Sintra')
  const [date, setDate] = useState('2026-06-18')
  const [days, setDays] = useState<Record<string, Place[]>>({ 'Day 1': [], 'Day 2': [] })
  const [view, setView] = useState('Timeline')
  const [offline, setOffline] = useState(false)
  const [day, setDay] = useState('Day 1')
  const selected = days[day]
  const setSelected = (stops: Place[]) => setDays({ ...days, [day]: stops })
  const [search, setSearch] = useState('')
  const [transport, setTransport] = useState('Car')
  const [visited, setVisited] = useState<string[]>([])
  const [note, setNote] = useState('Bring the reservation confirmation.')
  const [message, setMessage] = useState('Create a trip to begin.')
  const [dragged, setDragged] = useState<number | null>(null)
  const reorder = (from: number, to: number) => { const next = [...selected]; const [item] = next.splice(from, 1); next.splice(to, 0, item); setSelected(next); setMessage('Stop order and route updated.') }
  const route = selected.map((p) => `${p.x},${p.y}`).join(' ')
  return <div className="travel-demo demo-surface">
    <header><b>TripMate</b><span>Plan / explore / travel</span></header>
    {!created ? <form onSubmit={(e) => { e.preventDefault(); setCreated(true); setMessage('Trip created. Save a place to your day.') }} className="demo-form"><h3>Your next trip</h3><label>Destination<select value={destination} onChange={(e) => setDestination(e.target.value)}><option>Sintra</option><option disabled>Lisbon / next destination</option></select></label><label>Start date<input required type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><label>Travel companions<select><option>Just me</option><option>2 people</option><option>Small group</option></select></label><button>Create trip</button></form> : <>
      <div className="travel-tools"><h3>{destination} / {date}</h3><label>Plan day<select value={day} onChange={(e) => setDay(e.target.value)}><option>Day 1</option><option>Day 2</option></select></label><button aria-pressed={offline} onClick={() => { setOffline(!offline); setMessage(offline ? 'Live discovery available.' : 'Downloaded plan available. Live discovery paused.') }}>{offline ? 'Offline pack ready' : 'Download / go offline'}</button></div>
      <div className="travel-switch">{['Timeline', 'Map'].map((v) => <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{v}</button>)}</div>
      <div className={`travel-workspace show-${view.toLowerCase()}`}><div className="travel-map"><svg viewBox="0 0 100 100" role="img" aria-label={`Schematic route: ${selected.map((p) => p.name).join(', ') || 'no stops yet'}`}><path d="M0 15 L100 40 M5 100 L55 0 M0 60 L100 90" stroke="#d4deda" fill="none" strokeWidth="7" /><polyline points={route} fill="none" stroke="#b84c23" strokeWidth="1.5" />{selected.map((p, i) => <g key={p.id}><circle cx={p.x} cy={p.y} r="5" fill="#13233c" /><text x={p.x} y={p.y + 1.5} textAnchor="middle" fill="white" fontSize="4">{i + 1}</text></g>)}</svg><p>Schematic map · route follows stop order</p></div><div className="travel-timeline"><label>Transport<select value={transport} onChange={(e) => setTransport(e.target.value)}><option>Car</option><option>Bus</option><option>Walk</option></select></label><button disabled={selected.length < 2} onClick={() => { setSelected([...selected].sort((a, b) => a.x - b.x)); setMessage('Route ordered west to east. Preview before travelling.') }}>Optimize stop order</button><h4>{day} / {selected.reduce((s, p) => s + p.minutes, 0)} min of activities</h4>{selected.length === 0 && <p>No places yet. Add a saved place below.</p>}{selected.map((p, i) => <div className="travel-stop" draggable key={p.id} onDragStart={() => setDragged(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragged !== null) reorder(dragged, i); setDragged(null) }}><span>{i + 1}</span><div><b>{p.name}</b><small>{p.minutes} min · {i === 0 ? 'Morning' : i === 1 ? 'Afternoon' : 'Evening'}</small>{i > 0 && <small>Transport: {transport} · illustrative {transport === 'Walk' ? '60' : transport === 'Bus' ? '35' : '25'} min</small>}</div><button disabled={i === 0} aria-label={`Move ${p.name} earlier`} onClick={() => reorder(i, i - 1)}>↑</button><button aria-pressed={visited.includes(p.id)} onClick={() => setVisited(visited.includes(p.id) ? visited.filter((id) => id !== p.id) : [...visited, p.id])}>{visited.includes(p.id) ? 'Visited' : 'Done'}</button></div>)}</div></div>
      <details open><summary>Discover / saved places</summary><label>Search saved places<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Try palace" /></label>{!places.some((p) => p.name.toLowerCase().includes(search.toLowerCase())) && <p>No matching saved places. Try another search.</p>}<div className="travel-discover">{places.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => <div key={p.id}><b>{p.name}</b><span>{p.minutes} min · saved recommendation</span><details><summary>Place details</summary><p>{p.name} / allow {p.minutes} minutes. Check opening hours and tickets before travelling.</p></details><button disabled={offline || selected.some((s) => s.id === p.id)} onClick={() => { setSelected([...selected, p]); setMessage(`${p.name} added to ${day}.`) }}>{selected.some((s) => s.id === p.id) ? 'Added' : 'Add to day'}</button></div>)}</div></details>
      <div className="travel-records"><div><h4>Reservation</h4><p>Pena Palace · 09:00<br />Reference TM-204 / sample booking</p></div><label>Trip note<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label></div>
    </>}<p className="demo-status" role="status">{message}</p>
  </div>
}

function CareDemo() {
  const [step, setStep] = useState(0)
  const [doctor, setDoctor] = useState('Dr. Eleni Papadopoulou')
  const [date, setDate] = useState('2026-06-18')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [cancel, setCancel] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [reschedule, setReschedule] = useState(false)
  const [changed, setChanged] = useState(false)
  const labels = ['Dashboard', 'Specialty', 'Doctor', 'Date and time', 'Patient details', 'Review', 'Confirmed']
  return <div className="care-demo demo-surface"><header><b>medicare / appointment concept</b><span>{labels[step]}</span></header><div className="care-layout"><aside><h4>Appointment summary</h4><p>Dermatology</p><p>{doctor}</p><p>{date} {time || 'Time not selected'}</p><p>Athens clinic / sample location</p><small>No real appointment is made.</small></aside><div className="care-main"><ol className="care-progress">{labels.slice(1, 6).map((l, i) => <li key={l} aria-current={step === i + 1 ? 'step' : undefined}>{i + 1}<span>{l}</span></li>)}</ol>
      {step === 0 && <><h3>Your appointments</h3><p>No upcoming appointments. Find a specialist to start.</p><button onClick={() => setStep(1)}>Find care</button><details><summary>Patient profile & preparation</summary><p>Contact details, documents and reminders are kept separate from booking. Appointment confirmation provides a preparation checklist.</p></details></>}
      {step === 1 && <><h3>Choose a specialty</h3><button onClick={() => setStep(2)}>Dermatology</button><button disabled>Cardiology / unavailable in this demo</button></>}
      {step === 2 && <><h3>Compare doctors</h3><label>Location<select><option>Athens</option></select></label>{['Dr. Eleni Papadopoulou', 'Dr. Nikos Antoniou'].map((d) => <button aria-pressed={doctor === d} key={d} onClick={() => setDoctor(d)}><strong>{d}</strong><span>Dermatology · Athens · sample fee €60</span></button>)}<p>Profiles show location, specialty, fees and availability before commitment.</p><button onClick={() => setStep(3)}>Choose availability</button></>}
      {step === 3 && <><h3>{reschedule ? 'Choose a replacement time' : 'Choose date and time'}</h3><label>Appointment date<input type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime('') }} /></label><fieldset><legend>Available times / Athens local time</legend>{['10:30', '14:00', '16:00'].map((t) => <button key={t} disabled={t === '16:00' || changed && t === '10:30'} aria-pressed={time === t} onClick={() => { setTime(t); setError('') }}>{t}{t === '16:00' ? ' / unavailable' : ''}</button>)}</fieldset><button onClick={() => { setChanged(true); if (time === '10:30') { setTime(''); setError('10:30 is no longer available. Choose 14:00 to continue.') } }}>Simulate availability change</button><button disabled={!time || !date} onClick={() => setStep(reschedule ? 5 : 4)}>Continue</button></>}
      {step === 4 && <form onSubmit={(e) => { e.preventDefault(); setError(''); setStep(5) }}><h3>Patient details</h3><label>Full name<input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label><label>Email for confirmation<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><p>Only the information needed for this appointment is requested.</p><button>Review appointment</button></form>}
      {step === 5 && <><h3>Review before confirming</h3><dl><dt>Doctor</dt><dd>{doctor}</dd><dt>When</dt><dd>{new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {time} / Athens time</dd><dt>Patient</dt><dd>{name} / {email}</dd></dl><button onClick={() => { setStep(6); setReschedule(false); setCancelled(false) }}>Confirm {reschedule ? 'new time' : 'appointment'}</button></>}
      {step === 6 && <><h3>{cancelled ? 'Appointment cancelled' : 'Appointment confirmed'}</h3><p role="status">{cancelled ? 'No upcoming appointment. You can start a new booking.' : `${doctor} · ${date} at ${time}`}</p>{!cancelled && <><details open><summary>Prepare for your visit</summary><p>Check the clinic location. Keep your booking reference. Follow any instructions sent by the clinic.</p><label><input type="checkbox" defaultChecked /> Reminder 24 hours before</label></details><button onClick={() => { setReschedule(true); setStep(3) }}>Reschedule</button><button onClick={() => setCancel(true)}>Cancel appointment</button>{cancel && <div className="care-cancel" role="alert"><p>Cancel this appointment? The selected time will be released.</p><button onClick={() => { setCancelled(true); setCancel(false) }}>Yes, cancel</button><button onClick={() => setCancel(false)}>Keep appointment</button></div>}</>}<button onClick={() => { setStep(0); setTime(''); setChanged(false) }}>Return to dashboard</button></>}
      {error && <p role="alert" className="demo-error">{error}</p>}{step > 0 && step < 6 && <button className="demo-secondary" onClick={() => { setStep(step - 1); setError('') }}>Previous step</button>}
    </div></div></div>
}

const catalog = [
  { id: 'chair', name: 'Soft form chair', category: 'Objects', price: 420, image: '/projects/uiux/chair.svg', variants: ['Terracotta', 'Ink', 'Sand'] },
  { id: 'tote', name: 'Daily carry tote', category: 'Accessories', price: 84, image: '/projects/uiux/tote.svg', variants: ['Natural', 'Ink'] },
  { id: 'lamp', name: 'Object 04 lamp', category: 'Objects', price: 190, image: '/projects/uiux/lamp.svg', variants: ['Cobalt', 'Clay'] },
]
function CommerceDemo() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('Featured')
  const [product, setProduct] = useState<typeof catalog[number] | null>(null)
  const [variant, setVariant] = useState('')
  const [cart, setCart] = useState<{ name: string; variant: string; price: number; quantity: number }[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [stage, setStage] = useState('Catalog')
  const [shipping, setShipping] = useState(0)
  const [message, setMessage] = useState('Explore the edit.')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postal, setPostal] = useState('')
  const filtered = catalog.filter((p) => (category === 'All' || p.category === category || category === 'Saved' && saved.includes(p.id)) && p.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'Price: low to high' ? a.price - b.price : 0)
  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0)
  const add = () => { if (!product || !variant) return; const existing = cart.findIndex((p) => p.name === product.name && p.variant === variant); setCart(existing < 0 ? [...cart, { name: product.name, variant, price: product.price, quantity: 1 }] : cart.map((p, i) => i === existing ? { ...p, quantity: p.quantity + 1 } : p)); setMessage(`${product.name} / ${variant} added to bag.`) }
  return <div className="commerce-demo demo-surface"><header><b>shoply.</b><button onClick={() => setStage('Catalog')}>The edit</button><button onClick={() => setStage('Bag')}>Bag ({cart.reduce((s, p) => s + p.quantity, 0)})</button></header>
    {stage === 'Catalog' && <><div className="commerce-search"><label>Search products<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try chair" /></label><label>Sort<select value={sort} onChange={(e) => setSort(e.target.value)}><option>Featured</option><option>Price: low to high</option></select></label></div><div className="commerce-filters">{['All', 'Objects', 'Accessories', 'Saved'].map((c) => <button aria-pressed={category === c} key={c} onClick={() => setCategory(c)}>{c}</button>)}</div><p>{filtered.length} products · {category}{query ? ` · “${query}”` : ''}</p>{filtered.length === 0 && <div><h3>No matching products</h3><button onClick={() => { setQuery(''); setCategory('All') }}>Clear search and filters</button></div>}<div className="commerce-products">{filtered.map((p) => <div key={p.id}><button className="commerce-image" onClick={() => { setProduct(p); setVariant(''); setStage('Product') }}><img src={p.image} alt={`${p.name}, illustrated concept product`} /></button><b>{p.name}</b><span>€{p.price}</span><button aria-pressed={saved.includes(p.id)} onClick={() => setSaved(saved.includes(p.id) ? saved.filter((id) => id !== p.id) : [...saved, p.id])}>{saved.includes(p.id) ? 'Saved' : 'Save item'}</button></div>)}</div></>}
    {stage === 'Product' && product && <div className="commerce-detail"><img src={product.image} alt={product.name} /><div><p>{product.category}</p><h3>{product.name}</h3><strong>€{product.price}</strong><p>Designed for everyday use. Sample materials and dimensions are shown for this concept.</p><fieldset><legend>Select finish</legend>{product.variants.map((v, i) => <button disabled={i === product.variants.length - 1} aria-pressed={variant === v} key={v} onClick={() => setVariant(v)}>{v}{i === product.variants.length - 1 ? ' / out of stock' : ''}</button>)}</fieldset><p>{variant ? `${variant} available / ships in 3–5 days` : 'Choose an available finish before adding.'}</p><button disabled={!variant} onClick={add}>Add to bag</button><button onClick={() => setStage('Bag')}>Review bag</button><details><summary>Product information</summary><p>Care: wipe clean. Delivery estimate and returns information are shown before checkout. All details are sample content.</p></details></div></div>}
    {stage === 'Bag' && <><h3>Your bag</h3>{cart.length === 0 ? <><p>Your bag is empty.</p><button onClick={() => setStage('Catalog')}>Explore products</button></> : <>{cart.map((p, i) => <div className="commerce-bag-row" key={`${p.name}-${p.variant}`}><div><b>{p.name}</b><span>{p.variant} / €{p.price}</span></div><label>Quantity<input type="number" min="1" max="9" value={p.quantity} onChange={(e) => setCart(cart.map((item, index) => index === i ? { ...item, quantity: Math.min(9, Math.max(1, Number(e.target.value))) } : item))} /></label><button onClick={() => setCart(cart.filter((_, index) => index !== i))}>Remove</button></div>)}<h4>Subtotal €{total}</h4><p>Delivery calculated next. Sample tax-inclusive prices.</p><button onClick={() => setStage('Checkout')}>Checkout</button></>}</>}
    {stage === 'Checkout' && <form className="demo-form" onSubmit={(e) => { e.preventDefault(); setStage('Review') }}><h3>Delivery / payment</h3><label>Street address<input required value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" /></label><label>City<input required value={city} onChange={(e) => setCity(e.target.value)} /></label><label>Postal code<input required value={postal} onChange={(e) => setPostal(e.target.value)} /></label><label>Shipping<select value={shipping} onChange={(e) => setShipping(Number(e.target.value))}><option value={0}>Standard / free / 3–5 days</option><option value={12}>Express / €12 / 1–2 days</option></select></label><p>Payment: demo method selected. No card data is requested.</p><button>Review order / €{total + shipping}</button></form>}
    {stage === 'Review' && <><h3>Review your order</h3><p>{address}, {city}, {postal}</p>{cart.map((p) => <p key={`${p.name}-${p.variant}`}>{p.quantity} × {p.name} / {p.variant}</p>)}<p>Items €{total} · Shipping €{shipping}</p><h4>Total €{total + shipping}</h4><button onClick={() => setStage('Confirmed')}>Place demo order</button><button onClick={() => setStage('Checkout')}>Edit delivery</button></>}
    {stage === 'Confirmed' && <><h3>Order SL-204 confirmed</h3><p>Sample confirmation / nothing has been purchased.</p><ol className="commerce-tracking"><li>Confirmed</li><li>Preparing / next</li><li>Dispatched / pending</li><li>Delivered / pending</li></ol><button onClick={() => { setCart([]); setStage('Catalog') }}>Return to the edit</button></>}
    <p className="demo-status" role="status">{message}</p>
  </div>
}

function TrainingDemo() {
  const [phase, setPhase] = useState('Setup')
  const [goal, setGoal] = useState('Build consistency')
  const [exercise, setExercise] = useState(0)
  const [reps, setReps] = useState(10)
  const [load, setLoad] = useState(18)
  const [logs, setLogs] = useState<{ exercise: string; reps: number; load: number }[]>([])
  const [rest, setRest] = useState(60)
  const exercises = ['Goblet squat', 'Dumbbell row']
  const exerciseSets = logs.filter((l) => l.exercise === exercises[exercise]).length
  const volume = logs.reduce((s, l) => s + l.reps * l.load, 0)
  useEffect(() => { if (phase !== 'Rest' || rest <= 0) return; const timer = setTimeout(() => setRest(rest - 1), 1000); return () => clearTimeout(timer) }, [phase, rest])
  const next = () => { if (exerciseSets >= 2) { if (exercise === 1) setPhase('Summary'); else { setExercise(1); setPhase('Active') } } else setPhase('Active') }
  return <div className="training-demo demo-surface"><header><b>FITTRACK / TRAINING LOG</b><span>{phase}</span></header>
    {phase === 'Setup' && <form className="demo-form" onSubmit={(e) => { e.preventDefault(); setPhase('Today') }}><h3>Your training focus</h3><label>Goal<select value={goal} onChange={(e) => setGoal(e.target.value)}><option>Build consistency</option><option>Increase strength</option></select></label><label>Weekly sessions<select><option>3 sessions</option><option>2 sessions</option></select></label><p>A short preference step creates a starting plan. Targets remain editable.</p><button>Set up my week</button></form>}
    {phase === 'Today' && <><h3>Today / Full body A</h3><p>{goal} · 2 exercises · 2 sets each</p><ol><li>Goblet squat / 10 reps × 18 kg</li><li>Dumbbell row / 10 reps × 18 kg</li></ol><details><summary>Exercise details</summary><p>The demo focuses on logging. Exercise instructions would be reviewed by qualified contributors in a real product.</p></details><button className="training-main" onClick={() => setPhase('Active')}>Start session</button></>}
    {(phase === 'Active' || phase === 'Rest') && <><div className="training-current"><p>Exercise {exercise + 1} / 2 · Set {Math.min(2, exerciseSets + 1)} / 2</p><h3>{exercises[exercise]}</h3><p>Previous: 10 reps × 18 kg / sample history</p></div>{phase === 'Active' ? <form onSubmit={(e) => { e.preventDefault(); setLogs([...logs, { exercise: exercises[exercise], reps, load }]); setRest(60); setPhase('Rest') }}><div className="training-inputs"><label>Repetitions<input required type="number" min="1" max="100" value={reps} onChange={(e) => setReps(Number(e.target.value))} /></label><label>Load / kg<input required type="number" min="0" max="300" step="0.5" value={load} onChange={(e) => setLoad(Number(e.target.value))} /></label></div><button className="training-main">Log set / start rest</button></form> : <div className="training-rest" role="status"><span>Rest</span><strong>{Math.floor(rest / 60)}:{String(rest % 60).padStart(2, '0')}</strong><p>Set saved: {reps} reps × {load} kg</p><button className="training-main" onClick={next}>{exerciseSets < 2 ? 'Next set' : exercise === 0 ? 'Next exercise' : 'Finish session'} / skip rest</button></div>}<table><caption>Session log</caption><thead><tr><th>Exercise</th><th>Reps</th><th>kg</th></tr></thead><tbody>{logs.map((l, i) => <tr key={i}><td>{l.exercise}</td><td>{l.reps}</td><td>{l.load}</td></tr>)}</tbody></table></>}
    {phase === 'Summary' && <><h3>Session completed</h3><div className="training-summary"><div><span>Sets</span><strong>{logs.length}</strong></div><div><span>Volume / kg</span><strong>{volume}</strong></div><div><span>This week</span><strong>3 / 3</strong></div></div><p role="status">Training log updated. Volume measures total reps × load, not effort or recovery.</p><figure className="training-chart"><figcaption>Session volume / kg · sample history + your session</figcaption>{[540, 620, 680, volume].map((v, i) => <div key={i}><span style={{ height: `${Math.max(4, v / Math.max(680, volume) * 120)}px` }} /><b>{v} kg</b><small>{i === 3 ? 'Today' : `Session ${i + 1}`}</small></div>)}</figure><p>Consistency: 3 sessions this week. Personal record comparison: {load > 18 ? 'new demo load record' : 'previous load matched or below'}.</p><button onClick={() => { setPhase('Today'); setExercise(0); setLogs([]) }}>Return to today</button></>}
  </div>
}
