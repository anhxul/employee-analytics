const express        = require("express");
const router         = express.Router();
const protect        = require("../middleware/auth");
const aiController   = require("../controllers/aiController");

router.post("/recommend", protect, aiController.getRecommendation);
router.post("/rank",      protect, aiController.rankEmployees);

module.exports = router;