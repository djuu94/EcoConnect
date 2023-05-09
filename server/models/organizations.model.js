const mongoose = require("mongoose");
const { Schema } = mongoose;

const organizationSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  mission: { type: String, required: true },
  category: { type: String, required: true },
  links: { type: [String], required: true },
});

const Organizations = mongoose.model("Organizations", organizationSchema);

module.exports = Organizations;
