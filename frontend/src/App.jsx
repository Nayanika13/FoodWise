import { useState, useEffect } from "react";

const modules = [
  "Dashboard",
  "Forecasting",
  "Surplus Listings",
  "Redistribution",
  "Retail Partners",
  "Impact Analytics",
];

const descriptions = {
  Dashboard: "Your food-waste prevention overview",
  Forecasting: "Plan demand and prevent excess food",
  "Surplus Listings": "Manage available surplus food",
  Redistribution: "Coordinate food recovery and donations",
  "Retail Partners": "Connect stores with food recovery partners",
  "Impact Analytics": "Track food saved and environmental impact",
};

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [health, setHealth] = useState({
  status: "checking",
  database: "checking",
});

useEffect(() => {
  const controller = new AbortController();

  async function checkHealth() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/health",
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Health check failed");
      }

      const data = await response.json();
      setHealth(data);
    } catch (error) {
      if (error.name !== "AbortError") {
        setHealth({
          status: "offline",
          database: "unknown",
        });
      }
    }
  }

  checkHealth();

  const interval = setInterval(checkHealth, 30000);

  return () => {
    controller.abort();
    clearInterval(interval);
  };
}, []);

  function navigate(module) {
    setActive(module);
    setMenuOpen(false);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: system-ui, sans-serif;
          background: #f4f6ef;
          color: #173c2d;
        }
        #root { min-height: 100vh; }
        .shell { display: flex; min-height: 100vh; }
        .sidebar {
          width: 245px;
          padding: 28px 18px;
          background: #173c2d;
          color: white;
          flex-shrink: 0;
        }
        .brand { font-size: 27px; font-weight: 800; }
        .tagline { color: #b8cbb9; font-size: 13px; }
        nav { display: grid; gap: 8px; margin-top: 40px; }
        button {
          font: inherit;
          cursor: pointer;
          border: 0;
        }
        nav button {
          text-align: left;
          padding: 13px;
          border-radius: 9px;
          color: #d8e5d9;
          background: transparent;
        }
        nav button:hover, nav button.active {
          background: #dceab4;
          color: #173c2d;
        }
        main { flex: 1; padding: 36px; min-width: 0; }
        .eyebrow {
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: 700;
          color: #66805a;
        }
        h1 { font-size: clamp(28px, 4vw, 42px); margin: 12px 0; }
        .hero {
          background: #dceab4;
          border-radius: 20px;
          padding: 28px;
          margin: 28px 0;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
        }
        .card {
          background: white;
          border: 1px solid #dce4d5;
          border-radius: 14px;
          padding: 22px;
          text-align: left;
          color: #173c2d;
        }
        .card:hover { border-color: #66805a; }
        .card strong { display: block; font-size: 18px; }
        .card p { color: #526856; line-height: 1.5; }
        .menu { display: none; }
        @media (max-width: 720px) {
          .shell { display: block; }
          .sidebar { width: 100%; padding: 16px; }
          .menu {
            display: inline-block;
            margin-top: 12px;
            padding: 9px 14px;
            border-radius: 8px;
          }
          nav { display: none; margin-top: 12px; }
          nav.open { display: grid; }
          main { padding: 20px; }
        }
      `}</style>

      <div className="shell">
        <aside className="sidebar">
          <div className="brand">FoodWise</div>
          <div className="tagline">Prevent. Recover. Impact.</div>

          <button
            className="menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Close menu" : "Open menu"}
          </button>

          <nav className={menuOpen ? "open" : ""}>
            {modules.map((module) => (
              <button
                key={module}
                className={active === module ? "active" : ""}
                onClick={() => navigate(module)}
              >
                {module}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          <div className="eyebrow">FOODWISE PLATFORM</div>
          <h1>{active}</h1>
          <p>{descriptions[active]}</p>

          {active === "Dashboard" ? (
            <>
              <section className="hero">
                <h2>Every meal matters.</h2>
                <p>
                  Prevent food waste through smarter planning,
                  surplus recovery, and connected partnerships.
                </p>
              </section>

              <h2>Explore modules</h2>
              <section
               className="hero"
              aria-live="polite"
              >
             <h2>System status</h2>

              <p>
              API: {health.status}
             </p>

            <p>
            Database: {health.database}
             </p>
             </section>
              <div className="cards">
                {modules.slice(1).map((module) => (
                  <button
                    className="card"
                    key={module}
                    onClick={() => navigate(module)}
                  >
                    <strong>{module}</strong>
                    <p>{descriptions[module]}</p>
                    <span>Open module →</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <section className="hero">
              <h2>{active}</h2>
              <p>
                This module's data and workflows will be
                connected during implementation.
              </p>
              <button onClick={() => navigate("Dashboard")}>
                Return to dashboard
              </button>
            </section>
          )}
        </main>
      </div>
    </>
  );
}