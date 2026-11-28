const express = require("express");
const FoodListing = require("../models/FoodListing");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG and WebP photos are allowed"));
    }

    cb(null, true);
  }
});

const router = express.Router();
// Create a food listing with up to 5 photos
router.post("/", (req, res) => {
  upload.array("photo", 5)(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        error: uploadError.message
      });
    }

    const files = req.files || [];

    try {
      const {
  foodName,
  quantity,
  unit,
  sourceType,
  sourceName,
  expiryAt,
  cookedAt,
  foodType,
  pickupAddress,
  contactName,
  contactPhone,
  retailOfferType,
  originalPrice,
  discountedPrice
} = req.body;

if (sourceType === "retailer") {
  if (!["free", "discounted"].includes(retailOfferType)) {
    throw new Error("Select a retail offer type.");
  }

  if (retailOfferType === "discounted") {
    const original = Number(originalPrice);
    const discounted = Number(discountedPrice);

    if (
      !Number.isFinite(original) ||
      !Number.isFinite(discounted) ||
      original <= 0 ||
      discounted <= 0 ||
      discounted >= original
    ) {
      throw new Error(
        "Discounted price must be greater than zero and lower than the original price."
      );
    }
  }
}

      const photoUrls = files.map(
        (file) => `/uploads/${file.filename}`
      );

      const listing = await FoodListing.create({
        foodName,
        quantity,
        unit,
        sourceType,
        sourceName,
        expiryAt,
        cookedAt,
        foodType,
        pickupAddress,
        contactName,
        contactPhone,
                retailOfferType:
          sourceType === "retailer"
            ? retailOfferType
            : undefined,

        originalPrice:
          sourceType === "retailer" &&
          retailOfferType === "discounted"
            ? originalPrice
            : undefined,

        discountedPrice:
          sourceType === "retailer" &&
          retailOfferType === "discounted"
            ? discountedPrice
            : undefined,
        photoUrl: photoUrls[0],
        photoUrls
      });

      return res.status(201).json(listing);
    } catch (error) {
      files.forEach((file) => {
        fs.unlink(file.path, () => {});
      });

      return res.status(400).json({
        error: error.message || "Unable to create listing"
      });
    }
  });
});
  
// Dashboard summary
router.get("/summary", async (req, res) => {
  try {
    const [available, reserved, collected] = await Promise.all([
      FoodListing.countDocuments({
        status: "available",
        expiryAt: { $gt: new Date() }
      }),
      FoodListing.countDocuments({ status: "reserved" }),
      FoodListing.countDocuments({ status: "collected" })
    ]);

    res.json({
      available,
      reserved,
      collected
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      message: "Unable to load dashboard summary"
    });
  }
});

// Retrieve available food listings
router.get("/", async (req, res) => {
  try {
    const listings = await FoodListing.find({
      status: "available",
      expiryAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Unable to retrieve listings" });
  }
});
// Reserve an available listing for an NGO
router.patch("/:id/reserve", async (req, res) => {
  try {
    const { ngoName } = req.body;

    if (
      typeof ngoName !== "string" ||
      !ngoName.trim()
    ) {
      return res.status(400).json({
        error: "NGO name is required",
      });
    }

    if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        error: "Invalid listing ID",
      });
    }

    const listing = await FoodListing.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "available",
        expiryAt: { $gt: new Date() },
      },
      {
        $set: {
          status: "reserved",
          reservedBy: ngoName.trim(),
          reservedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!listing) {
      return res.status(409).json({
        error: "Listing is unavailable, expired, or already reserved",
      });
    }

    return res.json(listing);
  } catch (error) {
    return res.status(500).json({
      error: "Unable to reserve listing",
    });
  }
});
// Mark a reserved food listing as collected
router.patch("/:id/collect", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid listing ID"
      });
    }

    const listing = await FoodListing.findOneAndUpdate(
      {
        _id: id,
        status: "reserved"
      },
      {
        $set: { status: "collected" }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!listing) {
      return res.status(409).json({
        message: "Listing is not reserved or was already collected"
      });
    }

    return res.status(200).json({
      message: "Food collected successfully",
      listing
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to collect listing",
      error: error.message
    });
  }
});
router.get("/reserved", async (req, res) => {
  try {
    const { ngoName } = req.query;

    if (typeof ngoName !== "string" || !ngoName.trim()) {
      return res.status(400).json({
        message: "NGO name is required"
      });
    }

    const listings = await FoodListing.find({
      status: "reserved",
      reservedBy: ngoName.trim()
    }).sort({ reservedAt: -1 });

    return res.json(listings);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch reserved listings"
    });
  }
});
module.exports = router;
