import { useEffect, useState } from "react";
import "./SurplusListings.css";

const API_URL = "http://localhost:5000/api/listings";

const emptyForm = {
  foodName: "",
  quantity: "",
  unit: "kg",
  sourceType: "mess",
  sourceName: "",
  expiryAt: "",
};

export default function SurplusListings() {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadListings() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load listings.");
      }

      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function submitListing(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const expiry = new Date(form.expiryAt);

    if (expiry <= new Date()) {
      setError("Expiry must be in the future.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          expiryAt: expiry.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create listing.");
      }

      setForm(emptyForm);
      setSuccess("Food listing created successfully.");
      await loadListings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="listing-module">
      <div className="listing-panel">
        <h2>Add surplus food</h2>

        <form className="listing-form" onSubmit={submitListing}>
          <label>
            Food name
            <input
              name="foodName"
              value={form.foodName}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Quantity
            <input
              type="number"
              name="quantity"
              min="0.01"
              step="any"
              value={form.quantity}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Unit
            <select
              name="unit"
              value={form.unit}
              onChange={updateField}
            >
              <option value="kg">kg</option>
              <option value="meals">Meals</option>
              <option value="packets">Packets</option>
              <option value="litres">Litres</option>
            </select>
          </label>

          <label>
            Source type
            <select
              name="sourceType"
              value={form.sourceType}
              onChange={updateField}
            >
              <option value="mess">College mess</option>
              <option value="caterer">Caterer</option>
              <option value="retailer">Retailer</option>
            </select>
          </label>

          <label>
            Source name
            <input
              name="sourceName"
              value={form.sourceName}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Expiry date and time
            <input
              type="datetime-local"
              name="expiryAt"
              value={form.expiryAt}
              onChange={updateField}
              required
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create listing"}
          </button>
        </form>

        {success && <p role="status">{success}</p>}
        {error && <p role="alert">{error}</p>}
      </div>

      <h2>Available food</h2>

      <button onClick={loadListings} disabled={loading}>
        Refresh listings
      </button>

      {loading ? (
        <p>Loading listings...</p>
      ) : listings.length === 0 ? (
        <p>No available food listings.</p>
      ) : (
        <div className="cards">
          {listings.map((listing) => (
            <article className="card" key={listing._id}>
              <strong>{listing.foodName}</strong>
              <p>
                {listing.quantity} {listing.unit}
              </p>
              <p>
                Source: {listing.sourceName} ({listing.sourceType})
              </p>
              <p>
                Expires:{" "}
                {new Date(listing.expiryAt).toLocaleString()}
              </p>
              <span>{listing.status}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}