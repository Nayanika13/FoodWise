import { useEffect, useState } from "react";
import "./SurplusListings.css";

const API = "http://localhost:5000/api/listings";
const BACKEND = "http://localhost:5000";

function getFoodPhotos(food) {
  if (Array.isArray(food.photoUrls) && food.photoUrls.length > 0) {
    return food.photoUrls;
  }

  return food.photoUrl ? [food.photoUrl] : [];
}

function FoodPhoto({ food, gallery = false }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const photos = getFoodPhotos(food);

  useEffect(() => {
    if (!activePhoto) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActivePhoto(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activePhoto]);

  if (photos.length === 0) return null;

  const BACKEND = "http://localhost:5000";

  const photoUrl = (url) =>
    url.startsWith("http") ? url : `${BACKEND}${url}`;

  const visiblePhotos = gallery ? photos : [photos[0]];

  return (
    <>
      <div
        className={
          gallery ? "food-photo-gallery" : "food-card-photo-wrapper"
        }
      >
        {visiblePhotos.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            className="food-photo-trigger"
           onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  setActivePhoto(url);
}}
            aria-label={`Enlarge ${food.foodName} photo ${index + 1}`}
          >
            <img
              className={gallery ? undefined : "food-card-photo"}
              src={photoUrl(url)}
              alt={`${food.foodName} photo ${index + 1}`}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {activePhoto && (
        <div
          className="food-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Full-size food photo"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="food-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="food-lightbox-close"
              onClick={() => setActivePhoto(null)}
              aria-label="Close enlarged photo"
              autoFocus
            >
              ×
            </button>

            <img
              src={photoUrl(activePhoto)}
              alt={food.foodName}
              className="food-lightbox-image"
            />
          </div>
        </div>
      )}
    </>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Not provided";
}

function RetailOffer({ food }) {
  if (food.sourceType !== "retailer") return null;

  return (
    <p className="retail-offer">
      <strong>Retail offer:</strong>{" "}
      {food.retailOfferType === "free"
        ? "Free donation"
        : food.retailOfferType === "discounted"
        ? `Discounted: ₹${food.discountedPrice} (original ₹${food.originalPrice})`
        : "Retail offer not specified"}
    </p>
  );
}
function FoodDetails({ food, showContact = false }) {
  return (
    <>
      <FoodPhoto food={food} gallery />

      <p><strong>Food:</strong> {food.foodName}</p>
      <p><strong>Quantity:</strong> {food.quantity} {food.unit}</p>
      <p><strong>Food type:</strong> {food.foodType || "Not provided"}</p>
      <p><strong>Source:</strong> {food.sourceName} ({food.sourceType})</p>
      <RetailOffer food={food} />
    <p>
  <strong>
    {food.sourceType === "retailer" ? "Manufacture date:" : "Cooking date:"}
  </strong>{" "}
  {food.cookedAt
    ? new Date(food.cookedAt).toLocaleDateString()
    : "Not provided"}
</p>

<p>
  <strong>Expiry date:</strong>{" "}
  {food.expiryAt
    ? new Date(food.expiryAt).toLocaleDateString()
    : "Not provided"}
</p>
      <p><strong>Pickup address:</strong> {food.pickupAddress || "Not provided"}</p>

      {showContact && (
        <>
          <p><strong>Contact person:</strong> {food.contactName || "Not provided"}</p>
          <p><strong>Phone:</strong> {food.contactPhone || "Not provided"}</p>
        </>
      )}
    </>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  zIndex: 1000
};

const modalStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "24px",
  width: "100%",
  maxWidth: "520px",
  maxHeight: "85vh",
  overflowY: "auto",
  boxSizing: "border-box"
};

export default function Redistribution() {
  const [ngoName, setNgoName] = useState("Foodwise NGO Test");
  const [available, setAvailable] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [confirmFood, setConfirmFood] = useState(null);

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
useEffect(() => {
  function handleEscape(event) {
    if (event.key !== "Escape" || busy) return;

    if (confirmFood) {
      setConfirmFood(null);
      setMessage("");
    } else if (selectedFood) {
      setSelectedFood(null);
    }
  }

  window.addEventListener("keydown", handleEscape);

  return () => {
    window.removeEventListener("keydown", handleEscape);
  };
}, [confirmFood, selectedFood, busy]);
useEffect(() => {
  if (!selectedFood && !confirmFood) return;

  const previousFocus = document.activeElement;

  const dialog = document.querySelector(
    '[role="dialog"][aria-modal="true"]'
  );

  if (!dialog) return;

  const focusable = dialog.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), a[href]'
  );

  if (focusable.length === 0) return;

  focusable[0].focus();

  function handleTab(event) {
    if (event.key !== "Tab") return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  dialog.addEventListener("keydown", handleTab);

  return () => {
    dialog.removeEventListener("keydown", handleTab);

    if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
      previousFocus.focus();
    }
  };
}, [selectedFood, confirmFood]);
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

      if (!res.ok) {
        throw new Error(data.message || data.error || "Reservation failed");
      }

      setConfirmFood(null);
      setSelectedFood(null);
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

      if (!res.ok) {
        throw new Error(data.message || "Collection failed");
      }

      setMessage("Food collected successfully.");
      await loadListings();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="listing-panel redistribution-panel">
      <h2>Food Redistribution</h2>

      <div className="ngo-access-panel">
        <div className="ngo-access-heading">
          <h3>NGO Name</h3>
          <p>Enter your organisation's name to load its listings.</p>
        </div>

        <div className="ngo-access-input">
          <input
            aria-label="NGO Name"
            value={ngoName}
            onChange={(e) => setNgoName(e.target.value)}
          />

          <button
            disabled={busy || !ngoName.trim()}
            onClick={loadListings}
          >
            Load NGO Listings
          </button>
        </div>
      </div>

      {message && <p role="status">{message}</p>}

      <h3>Available Food</h3>

      {available.length === 0 && <p>No available listings.</p>}

      <div className="redistribution-cards">
        {available.map((food) => (
          <div
            className="card"
            key={food._id}
            onClick={() => setSelectedFood(food)}
            style={{ cursor: "pointer" }}
          >
            <FoodPhoto food={food} />

            <div className="food-card-heading">
              <div>
                <h4>{food.foodName}</h4>
                <span className="food-card-source">
                  {food.sourceName}
                </span>
              </div>
            </div>

            <div className="food-card-quantity">
              <span>Quantity</span>
              <strong>{food.quantity} {food.unit}</strong>
            </div>
<RetailOffer food={food} />
            <button onClick={() => setSelectedFood(food)}>
              View Details
            </button>
          </div>
        ))}
      </div>

      <h3>My Reserved Food</h3>

      {reserved.length === 0 && <p>No reserved listings.</p>}

      <div className="redistribution-cards">
        {reserved.map((food) => (
          <div className="card" key={food._id}>
            <FoodPhoto food={food} />

            <div className="food-card-heading">
              <div>
                <h4>{food.foodName}</h4>
                <span className="food-card-source">
                  Reserved by: {food.reservedBy}
                </span>
              </div>
            </div>

            <div className="food-card-quantity">
              <span>Quantity</span>
              <strong>{food.quantity} {food.unit}</strong>
            </div>
<RetailOffer food={food} />
           <p>
  <strong>Pickup address:</strong>{" "}
  {food.pickupAddress || "Not provided"}
</p>

{food.pickupAddress && (
  <a
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.pickupAddress)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="pickup-action-link"
  >
    Open pickup location in Maps
  </a>
)}
            <p><strong>Contact person:</strong> {food.contactName || "Not provided"}</p>
            <p>
  <strong>Phone:</strong>{" "}
  {food.contactPhone ? (
    <a
      href={`tel:${food.contactPhone.replace(/[^\d+]/g, "")}`}
      className="pickup-action-link"
    >
      {food.contactPhone}
    </a>
  ) : (
    "Not provided"
  )}
</p>

            <button
              disabled={busy}
              onClick={() => collectFood(food._id)}
            >
              Mark as Collected
            </button>
          </div>
        ))}
      </div>

      {selectedFood && !confirmFood && (
  <div style={overlayStyle}>
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Food details"
      style={modalStyle}
    >
      <h2>{selectedFood.foodName}</h2>

      <FoodDetails food={selectedFood} />

      <div className="redistribution-modal-footer">
        <button
          type="button"
          disabled={busy}
          onClick={() => setSelectedFood(null)}
        >
          Close
        </button>

        <button
          type="button"
          disabled={busy || !ngoName.trim()}
          onClick={() => {
            setMessage("");
            setConfirmFood(selectedFood);
          }}
        >
          Reserve Food
        </button>
      </div>
    </div>
  </div>
)}

{confirmFood && (
  <div style={overlayStyle}>
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm reservation"
      style={modalStyle}
    >
      <h2>Confirm Reservation</h2>

      <p>Review the details before reserving this food.</p>

      <FoodDetails food={confirmFood} showContact />

      <p>
        <strong>Reserving NGO:</strong> {ngoName}
      </p>

      {message && (
        <p role="status">{message}</p>
      )}

      <div className="redistribution-modal-footer">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setConfirmFood(null);
            setMessage("");
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => reserveFood(confirmFood._id)}
        >
          {busy ? "Reserving..." : "Confirm Reservation"}
        </button>
      </div>
    </div>
  </div>
)}
    </section>
  );
}