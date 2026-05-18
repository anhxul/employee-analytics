const express    = require("express");
const cors       = require("cors");
const mongoose   = require("mongoose");
const dns        = require("dns").promises;
require("dotenv").config();

// DNS fix
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes     = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const aiRoutes       = require("./routes/aiRoutes");
const errorHandler   = require("./middleware/errorHandler");

app.use("/api/auth",      authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/ai",        aiRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "Employee Analytics API running ✅" }));

// Global error handler
app.use(errorHandler);

// MongoDB connect + start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB error:", err));