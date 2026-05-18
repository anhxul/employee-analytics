const Employee = require("../models/Employee");
const dns = require("dns").promises;
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Helper: call OpenRouter
async function callOpenRouter(prompt, maxTokens = 2000) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set in .env");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://employee-analytics.onrender.com",
      "X-Title": "EmployeeAnalytics",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "OpenRouter error");
  return data.choices[0].message.content.replace(/```json|```/g, "").trim();
}

// POST /api/ai/recommend — AI Recommendation for all or single employee
const getRecommendation = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    let employees;
    if (employeeId) {
      const emp = await Employee.findById(employeeId);
      if (!emp) return res.status(404).json({ error: "Employee not found." });
      employees = [emp];
    } else {
      employees = await Employee.find();
    }

    if (employees.length === 0) {
      return res.status(400).json({ error: "No employees found." });
    }

    const prompt = `You are an expert HR analyst. Analyze the following employee data and provide detailed recommendations.

EMPLOYEES:
${employees
  .map(
    (e, i) =>
      `${i + 1}. Name: ${e.name} | Dept: ${e.department} | Skills: ${e.skills.join(", ")} | Performance Score: ${e.performanceScore}/100 | Experience: ${e.experience} years`
  )
  .join("\n")}

For EACH employee provide:
1. Promotion recommendation (Yes/No with reason)
2. Training suggestions (specific courses/skills to learn)
3. Overall AI feedback
4. Ranking score (0-100)

Respond ONLY with valid JSON (no markdown):
{
  "recommendations": [
    {
      "name": "Employee Name",
      "promotionEligible": true,
      "promotionReason": "reason here",
      "trainingSuggestions": ["course1", "course2"],
      "feedback": "detailed feedback",
      "rankingScore": 85,
      "performanceTier": "Excellent"
    }
  ],
  "summary": "Overall team analysis in 2-3 sentences"
}`;

    const text = await callOpenRouter(prompt, 3000);
    res.json(JSON.parse(text));
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/rank — Rank all employees
const rankEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find();
    if (employees.length === 0) {
      return res.status(400).json({ error: "No employees found." });
    }

    const prompt = `Rank these employees from best to worst performer based on their data.

EMPLOYEES:
${employees
  .map(
    (e, i) =>
      `${i + 1}. ${e.name} | ${e.department} | Score: ${e.performanceScore} | Exp: ${e.experience}yr | Skills: ${e.skills.join(", ")}`
  )
  .join("\n")}

Respond ONLY with valid JSON:
{
  "rankings": [
    { "rank": 1, "name": "Name", "score": 95, "reason": "why ranked here" }
  ]
}`;

    const text = await callOpenRouter(prompt, 1500);
    res.json(JSON.parse(text));
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendation, rankEmployees };