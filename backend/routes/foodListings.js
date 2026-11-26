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

module.exports = router;