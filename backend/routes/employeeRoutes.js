const express            = require("express");
const router             = express.Router();
const protect            = require("../middleware/auth");
const employeeController = require("../controllers/employeeController");

router.post("/",        protect, employeeController.addEmployee);
router.get("/",         protect, employeeController.getAllEmployees);
router.get("/search",   protect, employeeController.searchEmployees);
router.get("/:id",      protect, employeeController.getEmployee);
router.put("/:id",      protect, employeeController.updateEmployee);
router.delete("/:id",   protect, employeeController.deleteEmployee);

module.exports = router;