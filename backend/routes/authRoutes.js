const express        = require("express");
const router         = express.Router();
const protect        = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login",  authController.login);
router.get("/me",      protect, authController.getMe);

module.exports = router;