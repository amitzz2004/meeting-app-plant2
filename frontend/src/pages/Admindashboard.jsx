import { useEffect, useState, useCallback } from "react";
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

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });
}

export default function AdminDashboard() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const meetingUrl =
        tab === "PENDING" ? "/meetings/admin/pending" : "/meetings/admin/all";
      const res = await API.get(meetingUrl);
      setMeetings(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleApprove = async (id) => {
    try {
      await API.put(`/meetings/admin/${id}/approve`);
      await fetchData();
    } catch {
      alert("Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/meetings/admin/${id}/reject`);
      await fetchData();
    } catch {
      alert("Failed to reject");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meeting?")) return;
    try {
      await API.delete(`/meetings/${id}`);
      await fetchData();
    } catch {
      alert("Failed to delete");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const statusColor = (status) => {
    if (status === "APPROVED") return { bg: "#dcfce7", text: "#16a34a" };
    if (status === "REJECTED") return { bg: "#fee2e2", text: "#dc2626" };
    return { bg: "#fef9c3", text: "#ca8a04" };
  };

  const pendingCount = meetings.filter((m) => m.status === "PENDING").length;

  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  };

  const tableStyle = { width: "100%", borderCollapse: "collapse" };

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
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button onClick={fetchData}
            style={{
              background: "rgba(255,255,255,0.08)", color: "#fff",
              border: "0.5px solid rgba(255,255,255,0.15)",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13
            }}>
            ↻ Refresh
          </button>
          <button onClick={() => navigate("/admin/users")}
            style={{
              background: "#4c1d95", color: "#fff",
              border: "0.5px solid #7c3aed",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6
            }}>
            👥 Manage Users
          </button>
          <button onClick={() => navigate("/dashboard")}
            style={{
              background: "rgba(255,255,255,0.08)", color: "#fff",
              border: "0.5px solid rgba(255,255,255,0.15)",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13
            }}>
            ← Back
          </button>
          <button onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.08)", color: "#fff",
              border: "0.5px solid rgba(255,255,255,0.15)",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13
            }}>
            Logout →
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ================= MEETING APPROVAL ================= */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
              📅 Meeting Approvals
              {pendingCount > 0 && (
                <span style={{ marginLeft: 10, background: "#fef9c3", color: "#ca8a04", fontSize: 12, padding: "2px 10px", borderRadius: 20 }}>
                  {pendingCount} pending
                </span>
              )}
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              {["PENDING", "ALL"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: "6px 16px", borderRadius: 8, border: "none",
                    cursor: "pointer", fontSize: 13, fontWeight: 500,
                    background: tab === t ? "#0f172a" : "#f1f5f9",
                    color: tab === t ? "#fff" : "#64748b",
                  }}>
                  {t === "PENDING" ? "Pending" : "All"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading...</p>
          ) : meetings.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>✅ No meetings found</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Booked By</th>
                  <th style={thStyle}>Room</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m) => (
                  <tr key={m.id}>
                    <td style={tdStyle}>{m.title}</td>
                    <td style={tdStyle}>{m.user?.name || "—"}</td>
                    <td style={tdStyle}>{m.room?.name || "—"}</td>
                    <td style={tdStyle}>{formatDate(m.startTime)}</td>
                    <td style={tdStyle}>{formatTime(m.startTime)} – {formatTime(m.endTime)}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: statusColor(m.status).bg,
                        color: statusColor(m.status).text,
                        padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500
                      }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {m.status === "PENDING" && (
                        <>
                          <button onClick={() => handleApprove(m.id)}
                            style={{ background: "#dcfce7", color: "#16a34a", border: "none", padding: "6px 14px", borderRadius: 8, cursor: "pointer", marginRight: 8, fontWeight: 500 }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => handleReject(m.id)}
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(m.id)}
                        style={{ background: "#f1f5f9", color: "#64748b", border: "none", padding: "6px 14px", borderRadius: 8, cursor: "pointer", marginLeft: m.status === "PENDING" ? 8 : 0, fontWeight: 500 }}>
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}