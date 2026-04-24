import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import deeLogo from "../assets/DEEclean.png";

function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric"
  });
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.department || "").toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/all-users");
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/delete-user/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleMakeAdmin = async (id, name) => {
    if (!window.confirm(`Make "${name}" an Admin?`)) return;
    try {
      await API.post(`/admin/make-admin/${id}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: "ADMIN" } : u))
      );
    } catch {
      alert("Failed to update role");
    }
  };

  const statusColor = (status) => {
    if (status === "APPROVED") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "REJECTED") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#ca8a04" };
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  };

  const thStyle = {
    textAlign: "left",
    padding: "10px 14px",
    background: "#f1f5f9",
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
  };

  const tdStyle = {
    padding: "12px 14px",
    fontSize: 14,
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "#0b2c4a", color: "#fff", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* LEFT - Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={deeLogo}
            alt="DEE Logo"
            style={{ width: 44, height: 44, objectFit: "contain" }}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#4333a5", letterSpacing: 1 }}>
              <span style={{ color: "red" }}>DEE</span>
              <span style={{ color: "#4333a5" }}> PIPING SYSTEM</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              Inhouse Meeting Room Booking Platform 
            </div>
          </div>
        </div>

        {/* RIGHT - Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/admin")}
            style={{
              background: "rgba(255,255,255,0.08)", color: "#fff",
              border: "0.5px solid rgba(255,255,255,0.15)",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13
            }}>
            ← Back to Admin
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Add User + Search Bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, email or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px 10px 36px",
                borderRadius: 10, border: "1px solid #e2e8f0",
                fontSize: 14, outline: "none", boxSizing: "border-box",
                background: "#fff", color: "#1e293b",
              }}
            />
          </div>

          {/* Add User Button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: "#0b2c4a", color: "#fff",
              border: "0.5px solid rgba(255,255,255,0.2)",
              padding: "10px 20px", borderRadius: 10, cursor: "pointer",
              fontSize: 14, fontWeight: 500, whiteSpace: "nowrap",
            }}>
            + Add New User
          </button>
        </div>

        {/* ── Users Table ── */}
        <div style={cardStyle}>
          <h2 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            👥 All Users
            <span style={{ marginLeft: 10, background: "#e0f2fe", color: "#0369a1", fontSize: 12, padding: "2px 10px", borderRadius: 20 }}>
              {filtered.length} users
            </span>
          </h2>

          {loading ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>No users found</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Joined</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "#e0f2fe", color: "#0369a1",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 600, flexShrink: 0,
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>{u.department || "—"}</td>
                      <td style={tdStyle}>
                        <span style={{
                          background: u.role === "ADMIN" ? "#ede9fe" : "#f1f5f9",
                          color: u.role === "ADMIN" ? "#7c3aed" : "#64748b",
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          background: statusColor(u.status).bg,
                          color: statusColor(u.status).color,
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={tdStyle}>{formatDate(u.createdAt)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {u.role !== "ADMIN" && (
                            <>
                              <button onClick={() => handleMakeAdmin(u.id, u.name)}
                                style={{ background: "#ede9fe", color: "#7c3aed", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                                 Make Admin
                              </button>
                              <button onClick={() => handleDelete(u.id, u.name)}
                                style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                                🗑 Delete
                              </button>
                            </>
                          )}
                          {u.role === "ADMIN" && (
                            <span style={{ color: "#94a3b8", fontSize: 12 }}>Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Add User Modal ────────────────────────────────────────────
function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/admin/create-user", form);
      onCreated(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(4px)", zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: 28, width: 420,
        maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, background: "none",
          border: "none", fontSize: 18, color: "#bbb", cursor: "pointer",
        }}>✕</button>

        <div style={{
          width: 40, height: 40, borderRadius: 10, background: "#e0f2fe",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, marginBottom: 14,
        }}>👤</div>

        <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Add New User</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Create a new employee account</div>

        {error && (
          <div style={{
            background: "#fee2e2", color: "#dc2626", padding: "10px 14px",
            borderRadius: 8, fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>FULL NAME *</label>
          <input
            type="text" placeholder="e.g. Rahul Sharma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>EMAIL ADDRESS *</label>
          <input
            type="email" placeholder="e.g. rahul@deepiping.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>PASSWORD *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Set a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: "100%", padding: "9px 36px 9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14 }}>
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>DEPARTMENT</label>
          <input
            type="text" placeholder="e.g. Engineering"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>ROLE</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" }}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, cursor: "pointer", color: "#64748b" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex: 2, padding: "10px 0", borderRadius: 8, border: "none", background: loading ? "#94a3b8" : "#0b2c4a", color: "#fff", fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}