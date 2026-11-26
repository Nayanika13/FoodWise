const mongoose = require("mongoose");

const FoodListingSchema = new mongoose.Schema(
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
reservedBy: { type: String, trim: true },
reservedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoodListing", FoodListingSchema);