import { useEffect, useState } from "react";
import SurplusListings from "./SurplusListings";
import Redistribution from "./Redistribution";
import "./App.css";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  ClipboardList,
  HandHeart,
  Store,
  ChartPie,
  Menu,
  ArrowRight,
  Sprout
} from "lucide-react";

const modules = [
  { name: "Dashboard", icon: LayoutDashboard, desc: "Your food-waste prevention overview" },
  { name: "Forecasting", icon: ChartNoAxesCombined, desc: "Plan demand and prevent surplus" },
  { name: "Surplus Listings", icon: ClipboardList, desc: "Create and manage surplus food listings" },
  { name: "Redistribution", icon: HandHeart, desc: "Connect surplus food with NGOs" },
  { name: "Retail Partners", icon: Store, desc: "Manage near-expiry retail opportunities" },
  { name: "Impact Analytics", icon: ChartPie, desc: "Track food recovery and prevention impact" },
];

function App() {
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [health, setHealth] = useState("checking");
const [summary, setSummary] = useState(null);
const [listingsError, setListingsError] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);
const [refreshing, setRefreshing] = useState(false);
const [lastUpdated, setLastUpdated] = useState(null);

// Fetch dashboard summary
useEffect(() => {
  if (active !== "Dashboard") return;

  let cancelled = false;

  async function loadSummary() {
      setRefreshing(true);
    setListingsError(false);

    try {
      const response = await fetch(
        "http://localhost:5000/api/listings/summary"
      );

      if (!response.ok) {
        throw new Error("Summary failed");
      }

      const data = await response.json();

      if (!cancelled) {
        setSummary(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Dashboard summary error:", error);

      if (!cancelled) {
        setListingsError(true);
      }
    } finally {
      if (!cancelled) {
        setRefreshing(false);
      }
    }
  }

  loadSummary();

  return () => {
    cancelled = true;
  };
}, [active, refreshKey]);


// Check backend connection
useEffect(() => {
  let cancelled = false;

  async function checkHealth() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/health"
      );

      if (!response.ok) {
        throw new Error("Backend offline");
      }

      if (!cancelled) setHealth("online");
    } catch {
      if (!cancelled) setHealth("offline");
    }
  }

  checkHealth();

  const interval = setInterval(checkHealth, 30000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, []);
 
  function navigate(page) {
    setActive(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const current = modules.find((item) => item.name === active);

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">F</div>
          <div>
            <div className="brand-name">FoodWise</div>
            <div className="brand-caption">PREVENTION TO RECOVERY</div>
          </div>
        </div>

        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {modules.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${active === item.name ? "nav-item--active" : ""}`}
              onClick={() => navigate(item.name)}
              aria-current={active === item.name ? "page" : undefined}
            >
             <span className="nav-icon" aria-hidden="true">
  <item.icon size={20} strokeWidth={1.8} />
</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className={`health-dot health-dot--${health}`} />
          <div>
            <strong>System status</strong>
            <small>
              {health === "online" ? "Backend connected" :
               health === "offline" ? "Backend offline" : "Checking connection"}
            </small>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-toggle"
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={22} />
          </button>
          <div>
            <span className="topbar-label">FoodWise workspace</span>
            <div className="breadcrumb">Workspace / {active}</div>
          </div>
          <span className="workspace-pill">Food waste ecosystem</span>
        </header>

        <div className="page-content">
          {active === "Dashboard" ? (
            <>
              <section className="dashboard-hero">
                <div className="hero-content">
                  <span className="hero-eyebrow">FOODWISE • OPERATIONS</span>
                  <h1>Less waste.<br />More impact.</h1>
                  <p>
                    Prevent surplus, redistribute food and connect partners
                    through one intelligent ecosystem.
                  </p>
                  <button
                    className="hero-button"
                    onClick={() => navigate("Surplus Listings")}
                  >
                    Explore surplus listings <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orbit orbit-outer" />
                  <div className="orbit orbit-inner" />
                <div className="hero-symbol">
  <Sprout size={105} strokeWidth={1.2} />
</div>
                  <span className="orbit-dot" />
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <p className="section-kicker">WORKSPACE</p>
                  <h2>Explore modules</h2>
                </div>
                <span className="module-count">6 modules</span>
              </div>

              <div className="module-grid">
                {modules.filter((item) => item.name !== "Dashboard").map((item) => (
                  <button
                    key={item.name}
                    className="module-card"
                    onClick={() => navigate(item.name)}
                  >
                    <span className="module-icon" aria-hidden="true"><item.icon size={20} strokeWidth={1.8} /></span>
                <strong>{item.name}</strong>
<span className={
  ["Surplus Listings", "Redistribution"].includes(item.name)
    ? "module-status module-status--ready"
    : "module-status module-status--planned"
}>
  {["Surplus Listings", "Redistribution"].includes(item.name)
    ? "Available"
    : "Planned"}
</span>
                    <span className="module-description">{item.desc}</span>
                    <span className="module-link">Open module →</span>
                  </button>
                ))}
              </div>
            </>
          ) : active === "Surplus Listings" ? (
            <>
              <div className="page-heading">
                <p className="section-kicker">FOOD RECOVERY</p>
                <h1>Surplus Listings</h1>
                <p>{current.desc}</p>
              </div>
              <SurplusListings />
            </>
          ) : active === "Redistribution" ? (
            <>
              <div className="page-heading">
                <p className="section-kicker">FOOD RECOVERY</p>
                <h1>Redistribution</h1>
                <p>{current.desc}</p>
              </div>
              <Redistribution />
            </>
          ) : (
            <>
              <div className="page-heading">
                <p className="section-kicker">FOODWISE WORKSPACE</p>
                <h1>{active}</h1>
                <p>{current.desc}</p>
              </div>
              <section className="preview-panel">
                <span className="module-icon" aria-hidden="true"><current.icon size={24} strokeWidth={1.8} /></span>
                <h2>{active}</h2>
                <p>
                  This module is planned for a later development stage.
                  Its live data and workflows are not yet available.
                </p>
                <button className="back-button" onClick={() => navigate("Dashboard")}>
                  Return to dashboard
                </button>
          
              </section>
            </>
          )}

        {active === "Dashboard" && (
  <>
    <div className="overview-heading">
      <div>
        <p className="section-kicker">LIVE OPERATIONS</p>
        <h2>Listings overview</h2>
        <p className="last-updated">
  {lastUpdated
    ? `Last updated: ${lastUpdated}`
    : "Waiting for data..."}
</p>
      </div>
<button
  type="button"
  className="overview-label overview-refresh"
  onClick={() => setRefreshKey((key) => key + 1)}
  disabled={refreshing}
>
  {refreshing ? "Refreshing..." : "Refresh data"}
</button>
    </div>

    <div className="dashboard-metrics">
      {[
        { label: "Available", value: summary?.available },
        { label: "Reserved", value: summary?.reserved },
        { label: "Collected", value: summary?.collected }
      ].map((item) => (
        <section
          key={item.label}
          className="preview-panel metric-card"
        >
          <p className="section-kicker">{item.label}</p>

          <h2>
            {listingsError
              ? "Error"
              : item.value ?? "Loading..."}
          </h2>

          <p>Food listings</p>
        </section>
      ))}
    </div>

    <button
      type="button"
      className="live-listings-button"
      onClick={() => navigate("Redistribution")}
    >
      View available food
      <ArrowRight size={17} />
    </button>
  </>
)}
        </div>
      </main>
    </div>
  );
}

export default App;
