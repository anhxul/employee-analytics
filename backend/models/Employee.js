const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name:             { type: String, required: [true, "Name is required"], trim: true },
  email:            { type: String, required: [true, "Email is required"], unique: true, lowercase: true },
  department:       { type: String, required: [true, "Department is required"] },
  skills:           { type: [String], default: [] },
  performanceScore: { type: Number, required: [true, "Performance score is required"], min: 0, max: 100 },
  experience:       { type: Number, required: [true, "Experience is required"], min: 0 },
  createdAt:        { type: Date, default: Date.now },
});

module.exports = mongoose.model("Employee", EmployeeSchema);