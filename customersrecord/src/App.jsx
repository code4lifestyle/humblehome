import { useEffect, useMemo, useState } from "react";

const demoCredentials = {
  email: "admin@drivebase.com",
  password: "Drivebase2026",
};

const starterCustomers = [
  { id: "c-1001", name: "Olivia Martin", email: "olivia.martin@email.com", phone: "(415) 555-0138", vehicle: "2024 Porsche Macan", status: "Interested", added: "Oct 24, 2026", notes: "Looking for a weekend test drive." },
  { id: "c-1002", name: "Ethan Brooks", email: "ethan.brooks@email.com", phone: "(415) 555-0192", vehicle: "2025 BMW i4", status: "Contacted", added: "Oct 22, 2026", notes: "Follow up with EV finance options." },
  { id: "c-1003", name: "Sophia Chen", email: "sophia.chen@email.com", phone: "(415) 555-0175", vehicle: "2024 Mercedes-Benz GLC", status: "Purchased", added: "Oct 20, 2026", notes: "Delivery arranged for next Friday." },
  { id: "c-1004", name: "Noah Williams", email: "noah.williams@email.com", phone: "(415) 555-0124", vehicle: "2025 Audi Q5", status: "Interested", added: "Oct 18, 2026", notes: "Prefers a dark exterior with light interior." },
  { id: "c-1005", name: "Amara Johnson", email: "amara.johnson@email.com", phone: "(415) 555-0163", vehicle: "2024 Tesla Model Y", status: "Contacted", added: "Oct 16, 2026", notes: "Requested a trade-in estimate." },
  { id: "c-1006", name: "Luca Moretti", email: "luca.moretti@email.com", phone: "(415) 555-0118", vehicle: "2025 Volvo XC60", status: "Purchased", added: "Oct 12, 2026", notes: "Repeat customer. Great experience." },
];

const iconPaths = {
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  check: <><path d="m5 12 4 4L19 6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
};

function Icon({ name, size = 18 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name]}
    </svg>
  );
}

function getPageFromPath() {
  if (window.location.pathname === "/admin/dashboard") return "dashboard";
  if (window.location.pathname === "/admin") return "login";
  return "home";
}

function App() {
  const [page, setPage] = useState(getPageFromPath);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const onPopState = () => setPage(getPageFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(destination) {
    const path = destination === "dashboard" ? "/admin/dashboard" : destination === "login" ? "/admin" : "/";
    window.history.pushState({}, "", path);
    setPage(destination);
    window.scrollTo(0, 0);
  }

  if (page === "dashboard" && loggedIn) {
    return <Dashboard onLogout={() => { setLoggedIn(false); navigate("home"); }} />;
  }
  if (page === "login" || page === "dashboard") {
    return <LoginPage onLogin={() => { setLoggedIn(true); navigate("dashboard"); }} onHome={() => navigate("home")} />;
  }
  return <LandingPage onAdmin={() => navigate("login")} />;
}

function LandingPage({ onAdmin }) {
  return (
    <main className="landing">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Drivebase home">
          <span className="brand-mark"><CarMark /></span>
          <span>drivebase<span className="brand-period">.</span></span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#features">Why Drivebase</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <button className="button button-dark header-login" onClick={onAdmin}>Admin login <Icon name="arrow" size={16} /></button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR DEALERSHIP, IN THE DRIVER'S SEAT</div>
          <h1>Every customer.<br />A <span>better drive.</span></h1>
          <p className="hero-description">The customer record system built for people who love cars as much as they love a great customer experience.</p>
          <div className="hero-actions">
            <button className="button button-lime" onClick={onAdmin}>Get behind the wheel <Icon name="arrow" size={17} /></button>
            <a className="text-link" href="#features">Take a look around <span>↓</span></a>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true"><span>JM</span><span>AK</span><span>SL</span><span>+</span></div>
            <div><strong>Built for the long drive</strong><small>Good relationships go places.</small></div>
          </div>
        </div>
        <div className="hero-visual" aria-label="Illustration of a sports car in motion">
          <div className="visual-caption"><span>01 / 03</span><span>MADE TO MOVE</span></div>
          <div className="motion-glow" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="speed-line speed-line-one" /><div className="speed-line speed-line-two" /><div className="speed-line speed-line-three" />
          <svg className="hero-car" viewBox="0 0 760 350" role="img" aria-label="A lime green sports car driving forward">
            <defs>
              <linearGradient id="carPaint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d5ff8d" /><stop offset=".5" stopColor="#9ce345" /><stop offset="1" stopColor="#5d9c28" /></linearGradient>
              <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b8d9d0" /><stop offset="1" stopColor="#526d69" /></linearGradient>
              <filter id="carShadow" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="12" /></filter>
            </defs>
            <ellipse cx="375" cy="283" rx="290" ry="24" fill="#000" opacity=".58" filter="url(#carShadow)" />
            <g className="car-body">
              <path d="M112 220c13-28 44-48 81-60l81-26 49-64c14-18 31-27 59-27h91c31 0 58 14 77 37l61 72 77 22c24 7 40 25 43 48l4 30c2 17-9 31-26 34l-30 5H144c-23 0-37-12-39-34l-2-17c-1-8 2-15 9-20Z" fill="url(#carPaint)" stroke="#d9ffae" strokeWidth="3" />
              <path d="m302 129 42-55c9-12 22-18 39-18h36v77Z" fill="url(#glass)" stroke="#d8f1d5" strokeWidth="3" />
              <path d="M433 56h40c23 0 42 11 58 31l35 42H433Z" fill="url(#glass)" stroke="#d8f1d5" strokeWidth="3" />
              <path d="m101 224 77-20-12 35-63 6M634 200l75 19 6 22-75-1" fill="#f7fff0" />
              <path d="M235 167c86 9 244 9 345-2M183 201l420 3" fill="none" stroke="#e4ffc5" strokeWidth="2" opacity=".72" />
              <path d="m112 252 577 4" fill="none" stroke="#32432f" strokeWidth="9" strokeLinecap="round" opacity=".5" />
              <path d="M277 261h229" fill="none" stroke="#f0ffd8" strokeWidth="5" strokeLinecap="round" opacity=".75" />
              <circle cx="229" cy="254" r="50" fill="#17211f" stroke="#a5ee52" strokeWidth="5" />
              <circle cx="229" cy="254" r="29" fill="#81918a" stroke="#d5e4d9" strokeWidth="4" />
              <circle cx="229" cy="254" r="10" fill="#202927" />
              <path d="M229 226v56M201 254h56m-48-20 40 40m0-40-40 40" stroke="#d8e6de" strokeWidth="3" />
              <circle cx="583" cy="254" r="50" fill="#17211f" stroke="#a5ee52" strokeWidth="5" />
              <circle cx="583" cy="254" r="29" fill="#81918a" stroke="#d5e4d9" strokeWidth="4" />
              <circle cx="583" cy="254" r="10" fill="#202927" />
              <path d="M583 226v56m-28-28h56m-48-20 40 40m0-40-40 40" stroke="#d8e6de" strokeWidth="3" />
              <path d="m119 220 48-13m480-4 48 12" stroke="#fff2cf" strokeWidth="5" strokeLinecap="round" />
            </g>
          </svg>
          <div className="visual-tag"><span className="tag-icon"><Icon name="arrow" size={17} /></span><span><strong>Relationships first.</strong><small>Every mile of the way.</small></span></div>
          <div className="visual-index">DB / 2026</div>
        </div>
        <div className="hero-bottom"><span>BUILT FOR THE ROAD AHEAD</span><span className="bottom-line" /><span>SCROLL TO EXPLORE <b>↓</b></span></div>
      </section>

      <section className="feature-section" id="features">
        <div className="section-kicker">A LITTLE MORE CONNECTION. A LOT LESS CHAOS.</div>
        <div className="feature-heading-row"><h2>Good service starts<br />with <span>knowing their name.</span></h2><p>From first hello to their next set of keys, keep every detail in the right gear.</p></div>
        <div className="feature-grid">
          <article className="feature-card feature-card-dark"><div className="feature-number">01 / REMEMBER</div><div className="feature-icon icon-profile">✳</div><h3>People, not paperwork.</h3><p>Keep names, numbers, vehicle interests, and those little details that make every follow-up feel personal.</p><span className="feature-arrow">↗</span></article>
          <article className="feature-card feature-card-green"><div className="feature-number">02 / STAY IN GEAR</div><div className="feature-icon icon-wave">↗</div><h3>Never miss a moment.</h3><p>Know who's just browsing, who's ready to test drive, and who's already headed home happy.</p><span className="feature-arrow">↗</span></article>
          <article className="feature-card feature-card-light"><div className="feature-number">03 / KEEP IT SIMPLE</div><div className="feature-icon icon-record"><Icon name="users" size={25} /></div><h3>Your whole garage, organized.</h3><p>One clear view of every customer relationship. Easy to update, easy to find, easy to love.</p><span className="feature-arrow">↗</span></article>
        </div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="process-copy"><div className="section-kicker">LESS SPINNING YOUR WHEELS</div><h2>Everything in its<br />right <span>lane.</span></h2><p>A customer record should feel as smooth as a Sunday drive. Add a contact, keep their details up to date, and find exactly who you're looking for — all in a few clicks.</p><button className="button button-dark" onClick={onAdmin}>See your dashboard <Icon name="arrow" size={16} /></button></div>
        <div className="process-steps">
          <div className="process-step"><span>01</span><div><h3>Meet your next customer</h3><p>Add their details and the car that caught their eye.</p></div><Icon name="chevron" size={18} /></div>
          <div className="process-step"><span>02</span><div><h3>Keep the conversation rolling</h3><p>Update their status whenever the journey moves forward.</p></div><Icon name="chevron" size={18} /></div>
          <div className="process-step"><span>03</span><div><h3>Make the next visit personal</h3><p>See their history at a glance and pick up right where you left off.</p></div><Icon name="chevron" size={18} /></div>
        </div>
      </section>
      <footer className="site-footer"><a className="brand" href="#"><span className="brand-mark"><CarMark /></span><span>drivebase<span className="brand-period">.</span></span></a><span>Made for the people who move us.</span><button onClick={onAdmin}>Admin portal <Icon name="arrow" size={14} /></button><span>© 2026 Drivebase</span></footer>
    </main>
  );
}

function CarMark() {
  return <svg aria-hidden="true" viewBox="0 0 34 22" fill="none"><path d="M3 14.5 6 8h5l3.5-4h7L25 8h4l3 4v5h-4a3.5 3.5 0 0 0-7 0h-9a3.5 3.5 0 0 0-7 0H3v-2.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="8.5" cy="17" r="2.5" fill="currentColor" /><circle cx="24.5" cy="17" r="2.5" fill="currentColor" /></svg>;
}

function LoginPage({ onLogin, onHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (email.trim().toLowerCase() !== demoCredentials.email || password !== demoCredentials.password) {
      setError("Those details don't match our demo admin account. Try the credentials below.");
      return;
    }
    setError("");
    onLogin();
  }

  return (
    <main className="login-page">
      <div className="login-decoration"><div className="login-orbit" /><div className="login-decoration-copy"><span>DRIVEBASE / ADMIN</span><h2>Good to have<br />you in the<br /><em>driver's seat.</em></h2><p>One place for every customer relationship.</p><div className="login-car-art"><CarMark /></div></div><span className="login-decoration-foot">A BETTER DRIVE, TOGETHER — 2026</span></div>
      <section className="login-side">
        <a className="brand login-brand" href="/" onClick={(event) => { event.preventDefault(); onHome(); }}><span className="brand-mark"><CarMark /></span><span>drivebase<span className="brand-period">.</span></span></a>
        <div className="login-form-wrap">
          <div className="login-eyebrow"><span className="status-indicator" /> SECURE ADMIN ACCESS</div>
          <h1>Welcome back.</h1><p className="login-subtitle">Sign in to get back on the road.</p>
          <form onSubmit={submit}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="username" placeholder="you@dealership.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <div className="password-label"><label htmlFor="password">Password</label></div>
            <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-lime login-submit" type="submit">Sign in to Drivebase <Icon name="arrow" size={17} /></button>
          </form>
          <div className="demo-credentials"><div className="demo-credentials-icon"><Icon name="check" size={15} /></div><div><strong>Demo admin access</strong><span>Email: {demoCredentials.email}</span><span>Password: {demoCredentials.password}</span></div></div>
          <p className="login-back"><button onClick={onHome}>← Back to the homepage</button></p>
        </div>
        <p className="login-legal">Demo mode · Data is stored in this browser only</p>
      </section>
    </main>
  );
}

function Dashboard({ onLogout }) {
  const [customers, setCustomers] = useState(() => {
    const stored = localStorage.getItem("drivebase-customers");
    return stored ? JSON.parse(stored) : starterCustomers;
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All customers");
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("drivebase-customers", JSON.stringify(customers));
  }, [customers]);

  const filteredCustomers = useMemo(() => customers.filter((customer) => {
    const matchesSearch = `${customer.name} ${customer.email} ${customer.phone} ${customer.vehicle}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (statusFilter === "All customers" || customer.status === statusFilter);
  }), [customers, search, statusFilter]);

  const interested = customers.filter((customer) => customer.status === "Interested").length;
  const purchased = customers.filter((customer) => customer.status === "Purchased").length;

  function saveCustomer(customer) {
    setCustomers((current) => customer.id ? current.map((item) => item.id === customer.id ? customer : item) : [{ ...customer, id: `c-${Date.now()}`, added: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, ...current]);
    setEditing(null);
    setNotice(customer.id ? "Customer details updated." : "Customer added to your records.");
    window.setTimeout(() => setNotice(""), 2800);
  }

  function deleteCustomer(customer) {
    if (!window.confirm(`Delete ${customer.name} from your customer records?`)) return;
    setCustomers((current) => current.filter((item) => item.id !== customer.id));
    setNotice(`${customer.name} was deleted.`);
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <main className="dashboard-app">
      <aside className="sidebar">
        <a className="brand sidebar-brand" href="/"><span className="brand-mark"><CarMark /></span><span>drivebase<span className="brand-period">.</span></span></a>
        <div className="sidebar-label">WORKSPACE</div>
        <button className="sidebar-link active"><Icon name="dashboard" /> Overview</button>
        <button className="sidebar-link" onClick={() => document.getElementById("customer-search")?.focus()}><Icon name="users" /> Customers <span className="sidebar-count">{customers.length}</span></button>
        <div className="sidebar-bottom"><div className="sidebar-profile"><div className="profile-avatar">DB</div><div><strong>Drivebase Admin</strong><span>Administrator</span></div><button aria-label="Sign out" onClick={onLogout}><Icon name="logout" size={17} /></button></div><div className="sidebar-demo">DEMO WORKSPACE <span>LOCAL ONLY</span></div></div>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-topbar"><div className="breadcrumb">Workspace <Icon name="chevron" size={14} /> <strong>Overview</strong></div><div className="topbar-right"><span className="today-label">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span><div className="topbar-avatar">DB</div><button className="mobile-logout" onClick={onLogout}><Icon name="logout" size={17} /></button></div></header>
        <div className="dashboard-content">
          <div className="dashboard-heading"><div><div className="dashboard-greeting">TUESDAY, OCTOBER 27, 2026</div><h1>Your customers</h1><p>A little care goes a long way. Here's your customer overview.</p></div><button className="button button-dark add-customer" onClick={() => setEditing({ name: "", email: "", phone: "", vehicle: "", status: "Interested", notes: "" })}><Icon name="plus" size={17} /> Add customer</button></div>
          <div className="stat-grid">
            <article className="stat-card"><div className="stat-top"><span>Total customers</span><span className="stat-icon"><Icon name="users" size={17} /></span></div><strong>{customers.length}</strong><span className="stat-foot"><span className="stat-positive">Your whole community</span></span></article>
            <article className="stat-card"><div className="stat-top"><span>Interested</span><span className="stat-icon stat-icon-lime">↗</span></div><strong>{interested}</strong><span className="stat-foot">Ready for a conversation</span></article>
            <article className="stat-card"><div className="stat-top"><span>Purchased</span><span className="stat-icon stat-icon-green"><Icon name="check" size={17} /></span></div><strong>{purchased}</strong><span className="stat-foot">Keys handed over</span></article>
            <article className="stat-card stat-card-accent"><div className="stat-top"><span>Keep the momentum</span><span className="stat-icon stat-icon-dark"><Icon name="arrow" size={16} /></span></div><strong>Good things<br />start here.</strong><span className="stat-foot">Every record is a relationship.</span></article>
          </div>
          <section className="customer-panel">
            <div className="panel-heading"><div><h2>Customer records</h2><p>Keep every conversation moving forward.</p></div><span className="record-count">{filteredCustomers.length} RECORDS</span></div>
            <div className="table-controls"><label className="search-field" htmlFor="customer-search"><Icon name="search" size={18} /><input id="customer-search" type="search" placeholder="Search name, email, or vehicle..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="filter-label"><span className="sr-only">Filter customers by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All customers</option><option>Interested</option><option>Contacted</option><option>Purchased</option></select></label></div>
            <div className="customer-table-scroll"><table className="customer-table"><thead><tr><th>CUSTOMER</th><th>VEHICLE INTEREST</th><th>STATUS</th><th>ADDED</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
              {filteredCustomers.map((customer, index) => <tr key={customer.id}><td><div className="customer-identity"><span className={`customer-avatar avatar-${index % 5}`}>{customer.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span><strong>{customer.name}</strong><small>{customer.email}</small></span></div></td><td><div className="vehicle-cell">{customer.vehicle || "—"}<small>{customer.phone}</small></div></td><td><span className={`status-pill status-${customer.status.toLowerCase()}`}><span />{customer.status}</span></td><td className="added-date">{customer.added || "—"}</td><td><div className="row-actions"><button aria-label={`Edit ${customer.name}`} onClick={() => setEditing({ ...customer })}><Icon name="edit" size={16} /></button><button aria-label={`Delete ${customer.name}`} onClick={() => deleteCustomer(customer)}><Icon name="trash" size={16} /></button></div></td></tr>)}
              {filteredCustomers.length === 0 && <tr><td colSpan="5"><div className="empty-state"><span>⌕</span><strong>No customers found</strong><p>Try another search or add a new customer record.</p><button onClick={() => { setSearch(""); setStatusFilter("All customers"); }}>Clear filters</button></div></td></tr>}
            </tbody></table></div>
            <div className="panel-footer"><span>Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customers</span><span>Updated just now <span className="live-dot" /></span></div>
          </section>
          <footer className="dashboard-footer"><span>DRIVEBASE / KEEP GOOD COMPANY.</span><span>Demo workspace — records stay in this browser.</span></footer>
        </div>
      </section>
      {notice && <div className="toast" role="status"><span><Icon name="check" size={16} /></span>{notice}</div>}
      {editing && <CustomerForm customer={editing} onSave={saveCustomer} onClose={() => setEditing(null)} />}
    </main>
  );
}

function CustomerForm({ customer, onSave, onClose }) {
  const [form, setForm] = useState(customer);
  const [error, setError] = useState("");
  const editingExisting = Boolean(customer.id);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please add a name, email, and phone number.");
      return;
    }
    onSave({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), vehicle: form.vehicle.trim(), notes: form.notes.trim() });
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title"><div className="modal-heading"><div><div className="dashboard-greeting">{editingExisting ? "CUSTOMER RECORD" : "NEW RELATIONSHIP"}</div><h2 id="customer-modal-title">{editingExisting ? "Edit customer" : "Add a customer"}</h2></div><button className="modal-close" aria-label="Close form" onClick={onClose}><Icon name="close" /></button></div><form onSubmit={submit}><label htmlFor="customer-name">Full name <span>*</span></label><input id="customer-name" autoFocus value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Jordan Lee" required /><div className="form-two-col"><div><label htmlFor="customer-email">Email address <span>*</span></label><input id="customer-email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="jordan@email.com" required /></div><div><label htmlFor="customer-phone">Phone number <span>*</span></label><input id="customer-phone" type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="(555) 123-4567" required /></div></div><label htmlFor="customer-vehicle">Vehicle interest</label><input id="customer-vehicle" value={form.vehicle} onChange={(event) => update("vehicle", event.target.value)} placeholder="e.g. 2025 Audi Q5" /><label htmlFor="customer-status">Relationship status</label><select id="customer-status" value={form.status} onChange={(event) => update("status", event.target.value)}><option>Interested</option><option>Contacted</option><option>Purchased</option></select><label htmlFor="customer-notes">Notes <span className="label-optional">OPTIONAL</span></label><textarea id="customer-notes" rows="3" value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="What would be good to remember?" />{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button type="submit" className="button button-dark"><Icon name={editingExisting ? "check" : "plus"} size={16} /> {editingExisting ? "Save changes" : "Add customer"}</button></div></form></section></div>;
}

export default App;
