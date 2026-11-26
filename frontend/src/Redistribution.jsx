import { useEffect, useState } from "react";
import "./SurplusListings.css";

const API = "http://localhost:5000/api/listings";

export default function Redistribution() {
  const [ngoName, setNgoName] = useState("Foodwise NGO Test");
  const [available, setAvailable] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadListings() {
    try {
      const [availableRes, reservedRes] = await Promise.all([
        fetch(API),
        fetch(`${API}/reserved?ngoName=${encodeURIComponent(ngoName.trim())}`)
      ]);

      if (!availableRes.ok || !reservedRes.ok) {
        throw new Error("Could not load listings");
      }

      setAvailable(await availableRes.json());
      setReserved(await reservedRes.json());
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function reserveFood(id) {
    if (!ngoName.trim()) {
      setMessage("Enter an NGO name first.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/${id}/reserve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ngoName: ngoName.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reservation failed");

      setMessage("Food reserved successfully.");
      await loadListings();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function collectFood(id) {
    setBusy(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/${id}/collect`, {
        method: "PATCH"
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Collection failed");

      setMessage("Food collected successfully.");
      await loadListings();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="listing-panel">
      <h2>Food Redistribution</h2>

      <label>
        NGO name
        <input
          value={ngoName}
          onChange={(e) => setNgoName(e.target.value)}
        />
      </label>

      <button
        disabled={busy || !ngoName.trim()}
        onClick={loadListings}
      >
        Load NGO Listings
      </button>

      {message && <p>{message}</p>}

      <h3>Available Food</h3>
      {available.length === 0 && <p>No available listings.</p>}

      {available.map((food) => (
        <div className="card" key={food._id}>
          <h4>{food.foodName}</h4>
          <p>{food.quantity} {food.unit}</p>
          <p>Source: {food.sourceName}</p>
          <button
            disabled={busy || !ngoName.trim()}
            onClick={() => reserveFood(food._id)}
          >
            Reserve Food
          </button>
        </div>
      ))}

      <h3>My Reserved Food</h3>
      {reserved.length === 0 && <p>No reserved listings.</p>}

      {reserved.map((food) => (
        <div className="card" key={food._id}>
          <h4>{food.foodName}</h4>
          <p>{food.quantity} {food.unit}</p>
          <p>Reserved by: {food.reservedBy}</p>
          <button
            disabled={busy}
            onClick={() => collectFood(food._id)}
          >
            Mark as Collected
          </button>
        </div>
      ))}
    </section>
  );
}