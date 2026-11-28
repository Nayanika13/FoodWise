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
cookedAt: { type: Date },
foodType: {
  type: String,
  enum: ["veg", "non-veg", "vegan", "other"]
},
photoUrl: { type: String },

photoUrls: {
  type: [String],
  default: [],
  validate: {
    validator: (photos) => photos.length <= 5,
    message: "A listing can have a maximum of 5 photos",
  },
},
pickupAddress: {
  type: String,
  trim: true,
},
pickupLatitude: {
  type: Number,
  min: -90,
  max: 90,
},
pickupLongitude: {
  type: Number,
  min: -180,
  max: 180,
},
contactPhone: {
  type: String,
  trim: true,
},
contactName: {
  type: String,
  trim: true,
},
retailOfferType: {
  type: String,
  enum: ["free", "discounted"],
},

originalPrice: {
  type: Number,
  min: 0,
},

discountedPrice: {
  type: Number,
  min: 0,
},
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