const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.message);

  if (err.code === 11000) {
    return res.status(400).json({ error: "Email already exists." });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
};

module.exports = errorHandler;