const mongoose = require("mongoose");

const foodListingSchema = new mongoose.Schema(
  {
    foodName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: {
      type: String,
      enum: ["kg", "meals", "packets", "litres"],
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["mess", "caterer", "retailer"],
      required: true,
    },
    sourceName: { type: String, required: true, trim: true },
    expiryAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["available", "reserved", "collected", "expired"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoodListing", foodListingSchema);