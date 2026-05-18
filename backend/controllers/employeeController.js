const Employee = require("../models/Employee");

// POST /api/employees — Add Employee
const addEmployee = async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;
    if (!name || !email || !department || performanceScore === undefined || experience === undefined) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const employee = await Employee.create({ name, email, department, skills, performanceScore, experience });
    res.status(201).json({ message: "Employee added successfully.", employee });
  } catch (err) {
    next(err);
  }
};

// GET /api/employees — Get All Employees
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/search?department=Dev&skill=React — Search & Filter
const searchEmployees = async (req, res, next) => {
  try {
    const { department, skill, minScore, maxScore } = req.query;
    const query = {};
    if (department) query.department = { $regex: department, $options: "i" };
    if (skill) query.skills = { $in: [new RegExp(skill, "i")] };
    if (minScore || maxScore) {
      query.performanceScore = {};
      if (minScore) query.performanceScore.$gte = Number(minScore);
      if (maxScore) query.performanceScore.$lte = Number(maxScore);
    }
    const employees = await Employee.find(query).sort({ performanceScore: -1 });
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/:id — Get Single Employee
const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found." });
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

// PUT /api/employees/:id — Update Employee
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ error: "Employee not found." });
    res.json({ message: "Employee updated successfully.", employee });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/employees/:id — Delete Employee
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found." });
    res.json({ message: "Employee deleted successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = { addEmployee, getAllEmployees, searchEmployees, getEmployee, updateEmployee, deleteEmployee };