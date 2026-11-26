const express = require("express");
const FoodListing = require("../models/FoodListing");

const router = express.Router();

// Create a food listing
router.post("/", async (req, res) => {
  try {
    const { foodName, quantity, unit, sourceType, sourceName, expiryAt } = req.body;

    const listing = await FoodListing.create({
      foodName,
      quantity,
      unit,
      sourceType,
      sourceName,
      expiryAt
    });

    res.status(201).json(listing);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Unable to create listing" });
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
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(409).json({
        message: "Listing not found or not reserved"
      });
    }

    return res.json(listing);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to mark listing as collected"
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
