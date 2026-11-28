import { useEffect, useState } from "react";
import "./SurplusListings.css";

const API_URL = "http://localhost:5000/api/listings";

const emptyForm = {
  foodName: "",
  quantity: "",
  unit: "kg",
  sourceType: "mess",
sourceName: "",
retailOfferType: "",
originalPrice: "",
discountedPrice: "",
  expiryAt: "",
  cookedAt: "",
  foodType: "veg",
   pickupAddress: "",
  contactName: "",
  contactPhone: ""
};

export default function SurplusListings() {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(emptyForm);
const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);

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

const cooked = new Date(`${form.cookedAt}T00:00:00`);
const expiry = new Date(`${form.expiryAt}T23:59:59`);

const today = new Date();
today.setHours(0, 0, 0, 0);

if (cooked > today) {
  setError("Manufacture or cooking date cannot be in the future.");
  return;
}

if (expiry < new Date()) {
  setError("Expiry date must be today or later.");
  return;
}

if (form.cookedAt > form.expiryAt) {
  setError("Manufacture or cooking date cannot be after expiry date.");
  return;
}
if (form.sourceType === "retailer") {
  if (!form.retailOfferType) {
    setError("Please select a retail offer type.");
    return;
  }

  if (
    form.retailOfferType === "discounted" &&
    Number(form.discountedPrice) >= Number(form.originalPrice)
  ) {
    setError("Discounted price must be lower than the original price.");
    return;
  }
}
 if (photos.length === 0) {
  setError("Please select at least one food photo.");
  return;
}

  const formElement = event.currentTarget;
  const formData = new FormData();

 Object.entries(form).forEach(([key, value]) => {
  const retailFields = [
    "retailOfferType",
    "originalPrice",
    "discountedPrice"
  ];

  if (retailFields.includes(key)) {
    if (form.sourceType !== "retailer") return;

    if (
      key !== "retailOfferType" &&
      form.retailOfferType !== "discounted"
    ) return;
  }

  formData.append(key, value);
});

 formData.set("expiryAt", expiry.toISOString());
formData.set("cookedAt", cooked.toISOString());
  photos.forEach((photo) => {
  formData.append("photo", photo);
});

  setSaving(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not create listing.");
    }

    setForm(emptyForm);
    setPhotos([]);
    formElement.reset();

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
          <h3 className="form-section-title">Food information</h3>
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
  Food type
  <select
    name="foodType"
    value={form.foodType}
    onChange={updateField}
  >
    <option value="veg">Vegetarian</option>
    <option value="non-veg">Non-vegetarian</option>
    <option value="vegan">Vegan</option>
    <option value="other">Other</option>
  </select>
</label>
<h3 className="form-section-title">Source & pickup information</h3>
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

{form.sourceType === "retailer" && (
  <>
    <label>
      Retail offer
      <select
        name="retailOfferType"
        value={form.retailOfferType}
        onChange={updateField}
        required
      >
        <option value="">Select offer type</option>
        <option value="free">Give for free</option>
        <option value="discounted">Sell at discounted price</option>
      </select>
    </label>

    {form.retailOfferType === "discounted" && (
      <>
        <label>
          Original price (₹)
          <input
            type="number"
            name="originalPrice"
            min="0.01"
            step="0.01"
            value={form.originalPrice}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Discounted price (₹)
          <input
            type="number"
            name="discountedPrice"
            min="0.01"
            step="0.01"
            value={form.discountedPrice}
            onChange={updateField}
            required
          />
        </label>
      </>
    )}
  </>
)}
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
  Contact person's name
  <input
    type="text"
    name="contactName"
    value={form.contactName}
    onChange={updateField}
    placeholder="Person responsible for pickup"
    required
  />
</label>

<label>
  Contact phone number
  <input
    type="tel"
    name="contactPhone"
    value={form.contactPhone}
    onChange={updateField}
    placeholder="Enter contact phone number"
    required
  />
</label>
 <label>
  Pickup address
  <textarea
    name="pickupAddress"
    value={form.pickupAddress}
    onChange={updateField}
    placeholder="Enter the complete pickup address"
    required
  />
</label>
<h3 className="form-section-title">Food timing</h3>
          


        <label>
  {form.sourceType === "retailer"
    ? "Manufacture date"
    : "Cooking date"}
  <input
    type="date"
    name="cookedAt"
    value={form.cookedAt}
    onChange={updateField}
    required
  />
</label>

<label>
  Expiry date
  <input
    type="date"
    name="expiryAt"
    value={form.expiryAt}
    onChange={updateField}
    required
  />
</label>



<div className="listing-photo-section">
  <h3>Food photos</h3>
  <p>Add photos one at a time (maximum 5).</p>

  <label className="photo-upload-button">
    Upload Photo
    <input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  className="photo-input"
  onChange={(e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Each photo must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    if (photos.length >= 5) {
      alert("You can upload a maximum of 5 photos.");
      e.target.value = "";
      return;
    }

    setPhotos((previousPhotos) => [
      ...previousPhotos,
      selectedFile
    ]);

    e.target.value = "";
  }}
/>
  </label>

  <p>{photos.length} of 5 photos added</p>

  {photos.map((photo, index) => (
    <div
      className="selected-photo-name"
      key={`${photo.name}-${index}`}
    >
      <span>{photo.name}</span>
      <button
        type="button"
        onClick={() =>
          setPhotos((previous) =>
            previous.filter((_, i) => i !== index)
          )
        }
      >
        Remove
      </button>
    </div>
  ))}
</div>
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

  <p>{listing.quantity} {listing.unit}</p>

  <p>
    Source: {listing.sourceName} ({listing.sourceType})
  </p>
  {listing.sourceType === "retailer" && (
  <p className="retail-offer">
    {listing.retailOfferType === "free"
      ? "Free donation"
      : listing.retailOfferType === "discounted"
      ? `Discounted offer: ₹${listing.discountedPrice} (original ₹${listing.originalPrice})`
      : "Retail offer not specified"}
  </p>
)}

  <p>
    Expires: {new Date(listing.expiryAt).toLocaleString()}
  </p>

  <span>{listing.status}</span>

  <button
    type="button"
    onClick={() => setSelectedListing(listing)}
  >
    View food details
  </button>
</article>
          ))}
        </div>
      )}
      {selectedListing && (
  <div className="listing-modal-overlay">
    <section
      className="listing-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-details-title"
    >
      <h2 id="listing-details-title">
        {selectedListing.foodName}
      </h2>

      {selectedListing.photoUrl && (
        <img
          src={`http://localhost:5000${selectedListing.photoUrl}`}
          alt={`Food listing: ${selectedListing.foodName}`}
          className="listing-detail-photo"
        />
      )}

      <p>Quantity: {selectedListing.quantity} {selectedListing.unit}</p>
      <p>Food type: {selectedListing.foodType || "Not provided"}</p>
      <p>Source: {selectedListing.sourceName}</p>
      <p>Source type: {selectedListing.sourceType}</p>
      {selectedListing.sourceType === "retailer" && (
  <p>
    {selectedListing.retailOfferType === "free"
      ? "Offer: Free donation"
      : selectedListing.retailOfferType === "discounted"
      ? `Offer: ₹${selectedListing.discountedPrice} (original ₹${selectedListing.originalPrice})`
      : "Offer: Not specified"}
  </p>
)}
      <p>Pickup address: {selectedListing.pickupAddress || "Not provided"}</p>
      <p>Contact: {selectedListing.contactName || "Not provided"}</p>
      <p>Phone: {selectedListing.contactPhone || "Not provided"}</p>
      <p>
        Expires: {new Date(selectedListing.expiryAt).toLocaleString()}
      </p>
      <p>Status: {selectedListing.status}</p>

      <div className="listing-modal-footer">
        <button
          type="button"
          className="listing-close-bottom"
          onClick={() => setSelectedListing(null)}
        >
          Close
        </button>
      </div>
    </section>
  </div>
)}
    </section>
  );
}