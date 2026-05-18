import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster, toast } from "react-hot-toast";

const BACKEND = "https://employee-analytics-ifej.onrender.com"; // Change after deploy

// ─── API helper ───────────────────────────────────────
const api = async (path, method = "GET", body = null, token = "") => {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  };
  const res = await fetch(`${BACKEND}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

// ─── Spinner ──────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
    <div className="spinner" />
  </div>
);

// ─── Score color helper ───────────────────────────────
const scoreColor = (s) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";
const scoreTier  = (s) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : "Needs Improvement";

// ════════════════════════════════════════════════════
//  AUTH PAGES
// ════════════════════════════════════════════════════
function AuthPage({ onAuth }) {
  const [mode, setMode]     = useState("login");
  const [form, setForm]     = useState({ name: "", email: "", password: "", role: "hr" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const submit = async () => {
    setLoading(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const data = await api(path, "POST", body);
      login(data.user, data.token);
      toast.success(data.message);
      onAuth();
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: 28, boxShadow: "var(--glow)" }}>
            📊
          </div>
          <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800 }}>EmpAnalytics</h1>
          <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>AI-Powered Employee Performance System</p>
        </div>

        <div className="card fade-in">
          {/* Toggle */}
          <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 8, padding: 4, marginBottom: "1.5rem" }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, background: mode === m ? "var(--primary)" : "none", color: mode === m ? "#fff" : "var(--text2)", fontWeight: 500, fontSize: 13, textTransform: "capitalize" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mode === "signup" && (
              <>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Aman Verma" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="aman@company.com" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <button onClick={submit} disabled={loading} style={{ marginTop: 8, padding: "12px 0", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontWeight: 600, fontSize: 15, borderRadius: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, marginTop: "1rem" }}>
          {mode === "login" ? "No account? " : "Already have one? "}
          <span onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 500 }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  NAVBAR
// ════════════════════════════════════════════════════
function Navbar({ tab, setTab }) {
  const { user, logout } = useAuth();
  const tabs = ["Dashboard", "Employees", "Add Employee", "AI Analysis"];

  return (
    <nav style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 60, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: 16 }}>EmpAnalytics</span>
        </div>

        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 14px", borderRadius: 6, background: tab === t ? "rgba(99,102,241,0.15)" : "none", color: tab === t ? "var(--primary)" : "var(--text2)", fontWeight: tab === t ? 600 : 400, fontSize: 13, border: tab === t ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 500 }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: "var(--text3)", textTransform: "capitalize" }}>{user?.role}</p>
          </div>
          <button onClick={logout} style={{ padding: "6px 12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, fontSize: 12 }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// ════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════
function Dashboard({ employees, setTab }) {
  const avg = employees.length ? Math.round(employees.reduce((s, e) => s + e.performanceScore, 0) / employees.length) : 0;
  const topDept = (() => {
    const map = {};
    employees.forEach(e => { map[e.department] = (map[e.department] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1])[0]?.[0] || "—";
  })();

  const stats = [
    { label: "Total Employees", value: employees.length, icon: "👥", color: "#6366f1" },
    { label: "Avg Performance", value: `${avg}%`, icon: "📈", color: "#10b981" },
    { label: "Top Department", value: topDept, icon: "🏢", color: "#06b6d4" },
    { label: "Promotion Ready", value: employees.filter(e => e.performanceScore >= 80).length, icon: "🏆", color: "#f59e0b" },
  ];

  const top5 = [...employees].sort((a,b) => b.performanceScore - a.performanceScore).slice(0,5);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: 16, border: `1px solid ${s.color}33` }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "var(--text2)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Top performers */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🏆 Top Performers</h3>
          {top5.length === 0 ? <p style={{ color: "var(--text3)", fontSize: 13 }}>No employees yet.</p> : top5.map((e, i) => (
            <div key={e._id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: i === 0 ? "#fff" : "var(--text2)", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</p>
                <p style={{ fontSize: 11, color: "var(--text3)" }}>{e.department}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: scoreColor(e.performanceScore) }}>{e.performanceScore}</p>
                <div className="score-bar-bg" style={{ width: 60 }}>
                  <div className="score-bar-fill" style={{ width: `${e.performanceScore}%`, background: scoreColor(e.performanceScore) }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Department breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🏢 Department Breakdown</h3>
          {employees.length === 0 ? <p style={{ color: "var(--text3)", fontSize: 13 }}>No employees yet.</p> : (() => {
            const map = {};
            employees.forEach(e => { map[e.department] = (map[e.department] || 0) + 1; });
            const total = employees.length;
            return Object.entries(map).map(([dept, count]) => (
              <div key={dept} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{dept}</span>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>{count} ({Math.round(count/total*100)}%)</span>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${count/total*100}%`, background: "var(--primary)" }} />
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, width: "100%", marginBottom: 4 }}>⚡ Quick Actions</h3>
        {[["Add Employee", "Add Employee", "#6366f1"], ["View All", "Employees", "#06b6d4"], ["AI Analysis", "AI Analysis", "#10b981"]].map(([label, tabName, color]) => (
          <button key={label} onClick={() => setTab(tabName)} style={{ padding: "10px 20px", background: `${color}20`, color, border: `1px solid ${color}40`, borderRadius: 8, fontWeight: 500, fontSize: 13 }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  ADD EMPLOYEE
// ════════════════════════════════════════════════════
function AddEmployee({ onAdded, editData = null, onCancel }) {
  const { token } = useAuth();
  const [form, setForm] = useState(editData || { name: "", email: "", department: "", skills: [], performanceScore: "", experience: "" });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  const departments = ["Development", "Design", "Marketing", "HR", "Finance", "Operations", "Sales", "QA"];

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm(p => ({ ...p, skills: [...p.skills, s] }));
    }
    setSkillInput("");
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.department || form.performanceScore === "" || form.experience === "") {
      toast.error("Please fill all required fields"); return;
    }
    setLoading(true);
    try {
      const body = { ...form, performanceScore: Number(form.performanceScore), experience: Number(form.experience) };
      if (editData) {
        await api(`/api/employees/${editData._id}`, "PUT", body, token);
        toast.success("Employee updated!");
      } else {
        await api("/api/employees", "POST", body, token);
        toast.success("Employee added!");
        setForm({ name: "", email: "", department: "", skills: [], performanceScore: "", experience: "" });
      }
      onAdded?.();
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        {editData && <button onClick={onCancel} style={{ padding: "6px 12px", background: "var(--card2)", color: "var(--text2)", borderRadius: 6, fontSize: 13 }}>← Back</button>}
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{editData ? "✏️ Edit Employee" : "➕ Add New Employee"}</h2>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Full Name *", key: "name", placeholder: "Aman Verma" },
            { label: "Email *", key: "email", placeholder: "aman@company.com", type: "email" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input type={f.type || "text"} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Department *</label>
            <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Experience (years) *</label>
            <input type="number" min={0} max={50} value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} placeholder="3" />
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Performance Score * (0–100)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="range" min={0} max={100} value={form.performanceScore || 0} onChange={e => setForm(p => ({ ...p, performanceScore: e.target.value }))} style={{ flex: 1, background: "none", border: "none", padding: 0 }} />
              <span style={{ fontWeight: 700, fontSize: 18, color: scoreColor(Number(form.performanceScore)), minWidth: 40 }}>{form.performanceScore || 0}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <span className={`badge ${Number(form.performanceScore) >= 80 ? "badge-success" : Number(form.performanceScore) >= 60 ? "badge-warning" : "badge-danger"}`}>
                {scoreTier(Number(form.performanceScore))}
              </span>
            </div>
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Skills</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="React, Node.js... (press Enter)" />
              <button onClick={addSkill} style={{ padding: "0 16px", background: "var(--primary)", color: "#fff", borderRadius: 8, whiteSpace: "nowrap" }}>+ Add</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {form.skills.map(s => (
                <span key={s} className="skill-tag" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onClick={() => setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))}>
                  {s} ×
                </span>
              ))}
            </div>
          </div>
        </div>

        <button onClick={submit} disabled={loading} style={{ marginTop: 20, width: "100%", padding: "12px 0", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontWeight: 600, fontSize: 15, borderRadius: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Saving..." : editData ? "Update Employee" : "Add Employee →"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  EMPLOYEES LIST
// ════════════════════════════════════════════════════
function EmployeeList({ employees, loading, onDelete, onEdit, onRefresh }) {
  const { token } = useAuth();
  const [search, setSearch]   = useState("");
  const [dept, setDept]       = useState("");
  const [minScore, setMinScore] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    let res = employees;
    if (search) res = res.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()));
    if (dept) res = res.filter(e => e.department === dept);
    if (minScore) res = res.filter(e => e.performanceScore >= Number(minScore));
    setFiltered(res);
  }, [employees, search, dept, minScore]);

  const departments = [...new Set(employees.map(e => e.department))];

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await api(`/api/employees/${id}`, "DELETE", null, token);
      toast.success("Employee deleted");
      onDelete(id);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>👥 All Employees</h2>
        <button onClick={onRefresh} style={{ padding: "7px 14px", background: "var(--card2)", color: "var(--text2)", borderRadius: 6, fontSize: 13 }}>↻ Refresh</button>
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", marginBottom: 12 }}>🔍 Search & Filter</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." />
          <select value={dept} onChange={e => setDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="number" value={minScore} onChange={e => setMinScore(e.target.value)} placeholder="Min performance score" min={0} max={100} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 10 }}>{filtered.length} of {employees.length} employees shown</p>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                {["Employee", "Department", "Skills", "Score", "Exp", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "var(--text2)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text3)" }}>No employees found.</td></tr>
              ) : filtered.map((e, i) => (
                <tr key={e._id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0 }}>
                        {e.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{e.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text3)" }}>{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className="badge badge-primary">{e.department}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {e.skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
                      {e.skills.length > 3 && <span className="skill-tag">+{e.skills.length - 3}</span>}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div>
                      <p style={{ fontWeight: 700, color: scoreColor(e.performanceScore), fontSize: 16 }}>{e.performanceScore}</p>
                      <div className="score-bar-bg" style={{ width: 60, marginTop: 4 }}>
                        <div className="score-bar-fill" style={{ width: `${e.performanceScore}%`, background: scoreColor(e.performanceScore) }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text2)", fontSize: 14 }}>{e.experience}yr</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => onEdit(e)} style={{ padding: "5px 10px", background: "rgba(99,102,241,0.15)", color: "var(--primary)", borderRadius: 6, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDelete(e._id)} style={{ padding: "5px 10px", background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 6, fontSize: 12 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  AI ANALYSIS
// ════════════════════════════════════════════════════
function AIAnalysis({ employees }) {
  const { token } = useAuth();
  const [results, setResults]   = useState(null);
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [rankLoading, setRankLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState("");

  const getRecommendation = async () => {
    setLoading(true);
    try {
      const body = selectedEmp ? { employeeId: selectedEmp } : {};
      const data = await api("/api/ai/recommend", "POST", body, token);
      setResults(data);
      toast.success("AI analysis complete!");
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  const getRankings = async () => {
    setRankLoading(true);
    try {
      const data = await api("/api/ai/rank", "POST", {}, token);
      setRankings(data);
      toast.success("Rankings generated!");
    } catch (e) {
      toast.error(e.message);
    }
    setRankLoading(false);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>🤖 AI Performance Analysis</h2>

      {/* Controls */}
      <div className="card">
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Generate AI Recommendations</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Specific Employee (optional)</label>
            <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <button onClick={getRecommendation} disabled={loading} style={{ padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontWeight: 600, borderRadius: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Analyzing..." : "🤖 Get AI Recommendation"}
          </button>
          <button onClick={getRankings} disabled={rankLoading} style={{ padding: "10px 20px", background: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "#fff", fontWeight: 600, borderRadius: 8, opacity: rankLoading ? 0.7 : 1 }}>
            {rankLoading ? "Ranking..." : "🏆 Rank All Employees"}
          </button>
        </div>
      </div>

      {/* Rankings */}
      {rankings && (
        <div className="card fade-in">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🏆 Employee Rankings</h3>
          {rankings.rankings?.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < rankings.rankings.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? "linear-gradient(135deg,#f59e0b,#ef4444)" : i === 1 ? "linear-gradient(135deg,#94a3b8,#64748b)" : i === 2 ? "linear-gradient(135deg,#b45309,#92400e)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: i < 3 ? "#fff" : "var(--text2)", fontSize: 14, flexShrink: 0 }}>
                #{r.rank}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500 }}>{r.name}</p>
                <p style={{ fontSize: 12, color: "var(--text3)" }}>{r.reason}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: scoreColor(r.score) }}>{r.score}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {results && (
        <div className="fade-in">
          {results.summary && (
            <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", marginBottom: 4 }}>📊 AI Summary</p>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{results.summary}</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
            {results.recommendations?.map((r, i) => (
              <div key={i} className="card fade-in" style={{ border: `1px solid ${r.promotionEligible ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 16 }}>{r.name}</p>
                    <span className={`badge ${r.promotionEligible ? "badge-success" : "badge-danger"}`} style={{ marginTop: 4 }}>
                      {r.promotionEligible ? "🚀 Promotion Ready" : "📚 Needs Development"}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: scoreColor(r.rankingScore) }}>{r.rankingScore}</p>
                    <p style={{ fontSize: 11, color: "var(--text3)" }}>AI Score</p>
                  </div>
                </div>

                <div className="score-bar-bg" style={{ marginBottom: 12 }}>
                  <div className="score-bar-fill" style={{ width: `${r.rankingScore}%`, background: `linear-gradient(90deg,${scoreColor(r.rankingScore)},${scoreColor(r.rankingScore)}aa)` }} />
                </div>

                <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, lineHeight: 1.6 }}>{r.promotionReason}</p>

                {r.trainingSuggestions?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>📚 Training Suggestions</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {r.trainingSuggestions.map(t => (
                        <span key={t} style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {r.feedback && (
                  <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", marginBottom: 4 }}>💬 AI Feedback</p>
                    <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{r.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════
function AppInner() {
  const { isAuth, token } = useAuth();
  const [tab, setTab]           = useState("Dashboard");
  const [employees, setEmployees] = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    setLoadingEmps(true);
    try {
      const data = await api("/api/employees", "GET", null, token);
      setEmployees(data);
    } catch (e) {
      toast.error("Failed to fetch employees");
    }
    setLoadingEmps(false);
  }, [token]);

  useEffect(() => {
    if (isAuth) fetchEmployees();
  }, [isAuth, fetchEmployees]);

  if (!isAuth) return <AuthPage onAuth={fetchEmployees} />;

  if (editEmployee) return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
      <AddEmployee editData={editEmployee} onAdded={() => { setEditEmployee(null); fetchEmployees(); }} onCancel={() => setEditEmployee(null)} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar tab={tab} setTab={setTab} />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
        {tab === "Dashboard"    && <Dashboard employees={employees} setTab={setTab} />}
        {tab === "Employees"    && <EmployeeList employees={employees} loading={loadingEmps} onDelete={id => setEmployees(p => p.filter(e => e._id !== id))} onEdit={e => setEditEmployee(e)} onRefresh={fetchEmployees} />}
        {tab === "Add Employee" && <AddEmployee onAdded={() => { fetchEmployees(); setTab("Employees"); }} />}
        {tab === "AI Analysis"  && <AIAnalysis employees={employees} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e1e3a", color: "#e2e8f0", border: "1px solid rgba(99,102,241,0.2)" } }} />
      <AppInner />
    </AuthProvider>
  );
}