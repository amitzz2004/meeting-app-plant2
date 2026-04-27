import { useEffect, useRef, useState } from "react";
import API from "../api/axios";

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9);
const ROW_HEIGHT = 80;

const ROOM_COLORS = [
  { bg: "#b5d4f4", accent: "#378ADD" },
  { bg: "#9FE1CB", accent: "#1D9E75" },
  { bg: "#CECBF6", accent: "#7F77DD" },
  { bg: "#F5C4B3", accent: "#D85A30" },
];

const MEETING_COLORS = [
  { bg: "#378ADD", text: "#E6F1FB" },
  { bg: "#1D9E75", text: "#E1F5EE" },
  { bg: "#7F77DD", text: "#EEEDFE" },
  { bg: "#D85A30", text: "#FAECE7" },
];

function formatHour(h) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDuration(startIso, endIso) {
  if (!startIso || !endIso) return null;
  const mins = Math.round((new Date(endIso) - new Date(startIso)) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatDateLabel(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function getMeetingTop(startIso) {
  const h = new Date(startIso).getHours();
  const m = new Date(startIso).getMinutes();
  const offset = HOURS.indexOf(h);
  if (offset === -1) return null;
  return offset * ROW_HEIGHT + (m / 60) * ROW_HEIGHT;
}

function getMeetingHeight(startIso, endIso) {
  if (!endIso) return ROW_HEIGHT - 4;
  const durationMins = (new Date(endIso) - new Date(startIso)) / 60000;
  return Math.max((durationMins / 60) * ROW_HEIGHT - 4, 22);
}

function isSameDay(a, b) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function computeColumns(meetings) {
  const sorted = [...meetings].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const columns = [];
  sorted.forEach((meeting) => {
    let placed = false;
    for (const col of columns) {
      const last = col[col.length - 1];
      if (new Date(last.endTime) <= new Date(meeting.startTime)) {
        col.push(meeting);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([meeting]);
  });
  const result = [];
  columns.forEach((col, colIdx) => {
    col.forEach((meeting) => {
      result.push({ meeting, colIdx, totalCols: columns.length });
    });
  });
  return result;
}

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

// ✅ Calendar helper
function getCalendarDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
  return days;
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  const colors = {
    pending: { bg: "#fffbeb", border: "#fde68a", text: "#92400e", icon: "⏳" },
    success: { bg: "#f0fdf4", border: "#86efac", text: "#14532d", icon: "✅" },
    error: { bg: "#fef2f2", border: "#fca5a5", text: "#7f1d1d", icon: "❌" },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: "14px 18px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      display: "flex", alignItems: "flex-start", gap: 10,
      maxWidth: 360, animation: "toast-in 0.3s ease",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{message}</div>
      </div>
      <button onClick={onClose} style={{
        background: "none", border: "none", cursor: "pointer",
        color: c.text, opacity: 0.5, fontSize: 16, padding: 0, lineHeight: 1,
      }}>✕</button>
    </div>
  );
}

function RoomIllustration({ color, seats = 6 }) {
  const { bg, accent } = color;
  const cols = Math.min(Math.max(seats, 2), 10);
  const spacing = 160 / (cols + 1);
  return (
    <svg viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="180" height="80" fill={bg} />
      <rect x={seats > 8 ? 8 : 16} y="16" width={seats > 8 ? 164 : 148}
        height="38" rx="5" fill={accent} opacity="0.3" />
      <rect x="60" y="28" width="60" height="4" rx="2" fill={accent} opacity="0.4" />
      {Array.from({ length: cols }).map((_, i) => (
        <circle key={i} cx={10 + spacing * (i + 1)} cy="60" r="5" fill={accent} opacity="0.45" />
      ))}
    </svg>
  );
}

function MeetingCard({ meeting, colorIdx, onHover, onLeave, onClick, onDelete, onEdit, currentUserId, colIdx, totalCols }) {
  const color = MEETING_COLORS[colorIdx % MEETING_COLORS.length];
  const top = getMeetingTop(meeting.startTime);
  if (top === null) return null;
  const height = getMeetingHeight(meeting.startTime, meeting.endTime);
  const isOwner = meeting.userId === currentUserId;
  const isPending = meeting.status === "PENDING";
  const colWidth = 100 / totalCols;
  const leftPct = colIdx * colWidth;

  return (
    <div
      style={{
        position: "absolute", top: top + 2,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${colWidth}% - 4px)`, height,
        backgroundColor: isPending ? color.bg + "80" : color.bg,
        border: isPending ? `2px dashed ${color.bg}` : "none",
        borderColor: isPending ? color.bg.replace("80", "") : "transparent",
        borderRadius: 7, padding: "5px 8px", cursor: "pointer",
        overflow: "hidden", zIndex: 2,
        transition: "filter 0.12s, transform 0.1s",
        userSelect: "none", boxSizing: "border-box",
        opacity: isPending ? 0.75 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(0.88)";
        e.currentTarget.style.transform = "scale(1.015)";
        onHover && onHover(e, meeting);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "";
        e.currentTarget.style.transform = "";
        onLeave && onLeave();
      }}
      onClick={() => onClick && onClick(meeting)}
    >
      <div style={{
        fontSize: 11, fontWeight: 600, color: color.text,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        lineHeight: 1.3, paddingRight: isOwner ? 36 : 0,
      }}>
        {meeting.title}
        {isPending && (
          <span style={{
            marginLeft: 4, fontSize: 9, fontWeight: 700,
            background: "rgba(255,255,255,0.3)", borderRadius: 4,
            padding: "1px 4px", verticalAlign: "middle",
          }}>PENDING</span>
        )}
      </div>
      {height > 28 && (
        <div style={{ fontSize: 10, color: color.text, opacity: 0.82, marginTop: 2 }}>
          {formatTime(meeting.startTime)}
          {meeting.endTime ? `–${formatTime(meeting.endTime)}` : ""}
        </div>
      )}
      {isOwner && (
        <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 2 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(meeting); }}
            style={{ background: "rgba(255,255,255,0.25)", border: "none", borderRadius: 4, color: color.text, fontSize: 10, cursor: "pointer", padding: "2px 5px", lineHeight: 1 }}>✏️</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(meeting); }}
            style={{ background: "rgba(255,255,255,0.25)", border: "none", borderRadius: 4, color: color.text, fontSize: 10, cursor: "pointer", padding: "2px 5px", lineHeight: 1 }}>🗑️</button>
        </div>
      )}
    </div>
  );
}

function Tooltip({ data, position }) {
  if (!data) return null;
  const isPending = data.meeting.status === "PENDING";
  return (
    <div style={{
      position: "fixed", top: position.y - 10, left: position.x + 14,
      background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 10,
      padding: "10px 14px", fontSize: 12, zIndex: 1000, pointerEvents: "none",
      minWidth: 170, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#111" }}>
        {data.meeting.title}
        {isPending && (
          <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: "#92400e", background: "#fef3c7", borderRadius: 4, padding: "1px 5px" }}>PENDING</span>
        )}
      </div>
      <div style={{ color: "#666", marginBottom: 2 }}>
        🕐 {formatTime(data.meeting.startTime)}
        {data.meeting.endTime ? ` – ${formatTime(data.meeting.endTime)}` : ""}
      </div>
      {data.meeting.endTime && (
        <div style={{ color: "#888", marginBottom: 2 }}>⏱ {formatDuration(data.meeting.startTime, data.meeting.endTime)}</div>
      )}
      {isPending && (
        <div style={{ color: "#92400e", fontSize: 11, marginTop: 4, background: "#fef3c7", borderRadius: 6, padding: "3px 6px" }}>
          ⏳ Waiting for admin approval
        </div>
      )}
      <div style={{ color: "#aaa", marginTop: 5, fontSize: 11 }}>{data.roomName}</div>
    </div>
  );
}

function DetailModal({ meeting, roomName, onClose }) {
  if (!meeting) return null;
  const isPending = meeting.status === "PENDING";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 24, width: 320, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", animation: "rcg-modal-in 0.18s ease", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 18, color: "#bbb", cursor: "pointer", lineHeight: 1, padding: 0 }}>✕</button>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>📅</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#111", marginBottom: 3 }}>{meeting.title}</div>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>{roomName}</div>
        {isPending && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
            ⏳ <strong>Pending admin approval</strong> — this meeting is not yet confirmed
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: "#555" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>🕐</span>
            <span>
              <strong>{formatTime(meeting.startTime)}{meeting.endTime ? ` – ${formatTime(meeting.endTime)}` : ""}</strong>
              {meeting.endTime && <span style={{ color: "#aaa", marginLeft: 6, fontSize: 11 }}>({formatDuration(meeting.startTime, meeting.endTime)})</span>}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "9px 0", borderRadius: 10, background: "#378ADD", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#185FA5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#378ADD")}>Close</button>
      </div>
    </div>
  );
}

function EditModal({ meeting, onClose, onSave }) {
  const [title, setTitle] = useState(meeting.title);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await API.put(`/meetings/${meeting.id}`, { title });
      onSave(res.data);
      onClose();
    } catch {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 24, width: 320, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", animation: "rcg-modal-in 0.18s ease", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 18, color: "#bbb", cursor: "pointer", lineHeight: 1, padding: 0 }}>✕</button>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>✏️</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 4 }}>Edit Meeting</div>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>Update the meeting title</div>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSave()}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 13, boxSizing: "border-box", outline: "none" }}
          onFocus={(e) => (e.currentTarget.style.border = "1px solid #378ADD")}
          onBlur={(e) => (e.currentTarget.style.border = "1px solid #ddd")}
          placeholder="Meeting title" />
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "0.5px solid #ddd", background: "#fff", fontSize: 13, cursor: "pointer", color: "#555" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: saving ? "#a0c4e8" : "#378ADD", color: "#fff", fontSize: 13, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#185FA5"; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "#378ADD"; }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DraftModal({ draft, onClose, onBook }) {
  const [title, setTitle] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [requirements, setRequirements] = useState("");
  const [booking, setBooking] = useState(false);
  const defaultStart = draft.start;
  const defaultEnd = new Date(draft.start);
  defaultEnd.setHours(defaultEnd.getHours() + 1);
  const toTimeString = (date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const [fromTime, setFromTime] = useState(toTimeString(defaultStart));
  const [tillTime, setTillTime] = useState(toTimeString(defaultEnd));
  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(draft.start);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const startDate = parseTime(fromTime);
  const endDate = parseTime(tillTime);
  const isValid = endDate > startDate && title.trim() && employeeName.trim() && employeeId.trim() && department.trim();
  
  const handleBook = async () => {
    if (!isValid) return;
    setBooking(true);
    try {
      await onBook({ 
        title: `${title} | ${employeeName} (${employeeId}) | ${department || "No Dept"}${requirements ? ` | ${requirements}` : ""}`,
        start: startDate, 
        end: endDate, 
        roomId: draft.roomId 
      });
      onClose();
    } catch {
      alert("Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const durationMins = Math.round((endDate - startDate) / 60000);
  const durationLabel = durationMins <= 0 ? "" : durationMins < 60 ? `${durationMins} min` : durationMins % 60 === 0 ? `${durationMins / 60} hr` : `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`;

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1px solid #ddd", fontSize: 13, boxSizing: "border-box", outline: "none"
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 6,
    letterSpacing: 0.5, display: "block"
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: 24, width: 400,
        maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        animation: "rcg-modal-in 0.18s ease", position: "relative",
        maxHeight: "90vh", overflowY: "auto"
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 18, color: "#bbb", cursor: "pointer", lineHeight: 1, padding: 0 }}>✕</button>
        
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>📅</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 2 }}>New Booking</div>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>{draft.roomName}</div>
        
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 11, color: "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
          ⏳ Your booking will require admin approval before it's confirmed
        </div>

        {/* MEETING TITLE */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>PURPOSE OF THE MEETING *</label>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.border = "1px solid #378ADD")}
            onBlur={(e) => (e.currentTarget.style.border = "1px solid #ddd")}
            placeholder="e.g. Finance Meeting" />
        </div>

        {/* EMPLOYEE NAME + ID */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>EMPLOYEE NAME *</label>
            <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid #378ADD")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid #ddd")}
              placeholder="e.g. Rahul" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>EMPLOYEE ID *</label>
            <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid #378ADD")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid #ddd")}
              placeholder="e.g. 0001" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DEPARTMENT *</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid #378ADD")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid #ddd")}
              placeholder="e.g. CMD" />
          </div>
          
        </div>

        {/* TIME */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 8, letterSpacing: 0.5 }}>TIME</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>FROM</div>
              <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid #378ADD")}
                onBlur={(e) => (e.currentTarget.style.border = "1px solid #ddd")} />
            </div>
            <div style={{ color: "#ccc", fontSize: 18, marginTop: 16 }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>TILL</div>
              <input type="time" value={tillTime} onChange={(e) => setTillTime(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer", border: endDate <= startDate ? "1px solid #ef4444" : "1px solid #ddd" }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid #378ADD")}
                onBlur={(e) => (e.currentTarget.style.border = endDate <= startDate ? "1px solid #ef4444" : "1px solid #ddd")} />
            </div>
          </div>
          {endDate <= startDate && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 6 }}>⚠ End time must be after start time</div>}
        </div>

        {/* DURATION */}
        {endDate > startDate && (
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#666", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>⏱ Duration</span>
            <span style={{ fontWeight: 600, color: "#111" }}>{durationLabel}</span>
          </div>
        )}

        {/* REQUIREMENTS */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>REQUIREMENTS (OPTIONAL)</label>
          <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
            onFocus={(e) => (e.currentTarget.style.border = "1px solid #378ADD")}
            onBlur={(e) => (e.currentTarget.style.border = "1px solid #ddd")}
            placeholder="" />
        </div>

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "0.5px solid #ddd", background: "#fff", fontSize: 13, cursor: "pointer", color: "#555" }}>Cancel</button>
          <button onClick={handleBook} disabled={booking || !isValid} style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: booking || !isValid ? "#a0c4e8" : "#378ADD", color: "#fff", fontSize: 13, fontWeight: 500, cursor: booking || !isValid ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!booking && isValid) e.currentTarget.style.background = "#185FA5"; }}
            onMouseLeave={(e) => { if (!booking && isValid) e.currentTarget.style.background = "#378ADD"; }}>
            {booking ? "Submitting..." : "Request Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RoomCalendarGrid({ rooms }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState(null);
  const [selected, setSelected] = useState(null);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());
  const gridRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const [toast, setToast] = useState(null);

  // ✅ Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentMinute(now.getMinutes());
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && (setSelected(null), setShowDatePicker(false));
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // ✅ Close date picker on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowDatePicker(false);
    if (showDatePicker) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDatePicker]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const all = [];
        const dateStr = currentDate.toISOString().split("T")[0];
        for (const room of rooms) {
          if (!room.id) continue;
          const approvedRes = await API.get(`/meetings?roomId=${room.id}&date=${dateStr}`);
          all.push(...approvedRes.data.map((m) => ({ ...m, roomId: room.id })));
          if (currentUserId) {
            const pendingRes = await API.get(`/meetings/my-pending?roomId=${room.id}&date=${dateStr}`);
            all.push(...pendingRes.data.map((m) => ({ ...m, roomId: room.id })));
          }
        }
        const unique = Array.from(new Map(all.map((m) => [m.id, m])).values());
        setMeetings(unique);
      } catch (err) {
        console.error("Error fetching meetings", err);
      } finally {
        setLoading(false);
      }
    };
    if (rooms?.length) {
      fetchAll();
      const interval = setInterval(fetchAll, 10000);
      return () => clearInterval(interval);
    }
  }, [rooms, currentDate, currentUserId]);

  useEffect(() => {
    if (!gridRef.current || !isSameDay(currentDate, new Date())) return;
    const idx = HOURS.indexOf(currentHour);
    if (idx !== -1) gridRef.current.scrollTop = Math.max(0, (idx - 1) * ROW_HEIGHT);
  }, [loading]);

  const getRoomMeetings = (roomId) => meetings.filter((m) => m.roomId === roomId);
  const todayActive = isSameDay(currentDate, new Date());

  const shiftDay = (n) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + n);
      return d;
    });
  };

  // ✅ Shift picker month
  const shiftPickerMonth = (n) => {
    setPickerDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + n);
      return d;
    });
  };

  const handleDelete = async (meeting) => {
    if (!window.confirm(`Delete "${meeting.title}"?`)) return;
    try {
      await API.delete(`/meetings/${meeting.id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
    } catch {
      alert("Delete failed");
    }
  };

  const handleEdit = (meeting) => setSelected({ type: "edit", meeting });

  const handleBook = async ({ title, start, end, roomId }) => {
    const res = await API.post("/meetings", {
      title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      roomId,
    });
    setMeetings((prev) => [...prev, { ...res.data, roomId }]);
    setToast({ message: "Booking submitted! Waiting for admin approval.", type: "pending" });
  };

  const nowLineTop = (() => {
    const idx = HOURS.indexOf(currentHour);
    if (!todayActive || idx === -1) return null;
    return idx * ROW_HEIGHT + (currentMinute / 60) * ROW_HEIGHT;
  })();

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", userSelect: "none", position: "relative" }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: "0.5px solid #e5e5e5",
        flexWrap: "wrap", gap: 8, background: "#fff",
      }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: "#111" }}>Meeting Rooms</span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setCurrentDate(new Date())} style={{
            fontSize: 12, border: "0.5px solid #ddd", borderRadius: 8, padding: "5px 12px",
            background: todayActive ? "#EBF4FF" : "#fff",
            color: todayActive ? "#378ADD" : "#555",
            fontWeight: todayActive ? 600 : 400, cursor: "pointer",
          }}>Today</button>

          <button onClick={() => shiftDay(-1)} style={navBtnStyle}>‹</button>

          {/* ✅ Clickable date label that opens calendar */}
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setPickerDate(currentDate);
                setShowDatePicker(!showDatePicker);
              }}
              style={{
                fontSize: 13, fontWeight: 500, color: "#222",
                minWidth: 220, textAlign: "center",
                background: showDatePicker ? "#EBF4FF" : "#fff",
                border: "0.5px solid #ddd", borderRadius: 8,
                padding: "5px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              📅 {formatDateLabel(currentDate)}
            </button>

            {/* ✅ Calendar Dropdown */}
            {showDatePicker && (
              <div style={{
                position: "absolute", top: "110%", left: "50%",
                transform: "translateX(-50%)", zIndex: 200,
                background: "#fff", borderRadius: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                border: "0.5px solid #e2e8f0", padding: 16,
                minWidth: 280,
              }}>

                {/* Month navigation */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <button onClick={() => shiftPickerMonth(-1)} style={{ background: "none", border: "0.5px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>‹</button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                    {pickerDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button onClick={() => shiftPickerMonth(1)} style={{ background: "none", border: "0.5px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>›</button>
                </div>

                {/* Day headers */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", fontWeight: 600, padding: "4px 0" }}>{d}</div>
                  ))}
                </div>

                {/* Calendar days */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                  {getCalendarDays(pickerDate).map((day, i) => {
                    const isSelected = day && isSameDay(day, currentDate);
                    const isToday = day && isSameDay(day, new Date());
                    return (
                      <button key={i} disabled={!day}
                        onClick={() => { if (day) { setCurrentDate(day); setShowDatePicker(false); } }}
                        style={{
                          padding: "7px 0", borderRadius: 6, border: "none",
                          fontSize: 12, cursor: day ? "pointer" : "default",
                          background: isSelected ? "#0f172a" : isToday ? "#EBF4FF" : "transparent",
                          color: isSelected ? "#fff" : isToday ? "#378ADD" : day ? "#1e293b" : "transparent",
                          fontWeight: isSelected || isToday ? 600 : 400,
                        }}>
                        {day ? day.getDate() : ""}
                      </button>
                    );
                  })}
                </div>

                {/* Quick shortcuts */}
                <div style={{ display: "flex", gap: 6, marginTop: 12, borderTop: "0.5px solid #f1f5f9", paddingTop: 12 }}>
                  <button onClick={() => { setCurrentDate(new Date()); setShowDatePicker(false); }}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "0.5px solid #e2e8f0", background: "#f8fafc", fontSize: 12, cursor: "pointer", color: "#0f172a", fontWeight: 500 }}>
                    Today
                  </button>
                  <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); setCurrentDate(d); setShowDatePicker(false); }}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "0.5px solid #e2e8f0", background: "#f8fafc", fontSize: 12, cursor: "pointer", color: "#0f172a", fontWeight: 500 }}>
                    Tomorrow
                  </button>
                  <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 7); setCurrentDate(d); setShowDatePicker(false); }}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "0.5px solid #e2e8f0", background: "#f8fafc", fontSize: 12, cursor: "pointer", color: "#0f172a", fontWeight: 500 }}>
                    +1 Week
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => shiftDay(1)} style={navBtnStyle}>›</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#999" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#378ADD", display: "inline-block" }} />Approved
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fcd34d", border: "2px dashed #f59e0b", display: "inline-block" }} />Pending
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f0f0f0", border: "0.5px solid #ddd", display: "inline-block" }} />Available
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: `64px repeat(${rooms.length}, minmax(0, 1fr))`, overflowX: "auto", background: "#fff", width: "100%" }}>
        <div style={{ borderBottom: "0.5px solid #e5e5e5", borderRight: "0.5px solid #e5e5e5", background: "#fafafa" }} />
        {rooms.map((room, ri) => {
          const color = ROOM_COLORS[ri % ROOM_COLORS.length];
          const roomMeetings = getRoomMeetings(room.id);
          const approvedCount = roomMeetings.filter(m => m.status === "APPROVED").length;
          const load = approvedCount === 0 ? "#22c55e" : approvedCount <= 3 ? "#f59e0b" : "#ef4444";
          return (
            <div key={room.id} style={{ borderBottom: "0.5px solid #e5e5e5", borderRight: ri < rooms.length - 1 ? "0.5px solid #e5e5e5" : "none", padding: "10px 12px", background: "#fff", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
              <div style={{ height: 120, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
                {room.image ? (
                  <img src={room.image} alt={room.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                ) : (
                  <RoomIllustration color={color} seats={room.capacity || 6} />
                )}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{room.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                {room.capacity && (
                  <span style={{ fontSize: 11, color: "#999", display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                    {room.capacity}
                  </span>
                )}
                {room.hasTV && <span title="TV" style={{ fontSize: 10, color: "#bbb" }}>🖥</span>}
                {room.hasProjector && <span title="Projector" style={{ fontSize: 10, color: "#bbb" }}>📽</span>}
                {room.hasWifi !== false && <span title="WiFi" style={{ fontSize: 10, color: "#bbb" }}>📶</span>}
                <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: load, flexShrink: 0 }} title={`${approvedCount} meeting${approvedCount !== 1 ? "s" : ""} today`} />
              </div>
            </div>
          );
        })}

        {/* ── Scrollable rows ── */}
        <div ref={gridRef} style={{ gridColumn: `1 / ${rooms.length + 2}`, display: "grid", gridTemplateColumns: `64px repeat(${rooms.length}, minmax(0, 1fr))`, maxHeight: 520, overflowY: "auto", background: "#fff", width: "100%" }}>
          <div style={{ borderRight: "0.5px solid #e5e5e5" }}>
            {HOURS.map((h) => (
              <div key={h} style={{ height: ROW_HEIGHT, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 6, fontSize: 11, color: todayActive && h === currentHour ? "#378ADD" : "#c0c0c0", fontWeight: todayActive && h === currentHour ? 600 : 400, borderBottom: "0.5px solid #f2f2f2", boxSizing: "border-box" }}>
                {formatHour(h)}
              </div>
            ))}
          </div>

          {rooms.map((room, ri) => {
            const roomMeetings = getRoomMeetings(room.id);
            const layoutItems = computeColumns(roomMeetings);
            return (
              <div key={room.id} style={{ borderRight: ri < rooms.length - 1 ? "0.5px solid #e5e5e5" : "none", position: "relative", height: HOURS.length * ROW_HEIGHT }}>
                {HOURS.map((h) => (
                  <div key={h} style={{ position: "absolute", top: HOURS.indexOf(h) * ROW_HEIGHT, left: 0, right: 0, height: ROW_HEIGHT, borderBottom: "0.5px solid #f2f2f2", boxSizing: "border-box", background: todayActive && h === currentHour ? "rgba(55,138,221,0.035)" : "transparent", zIndex: 1, transition: "background 0.1s", cursor: "pointer" }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickY = e.clientY - rect.top;
                      const fraction = clickY / ROW_HEIGHT;
                      const minutes = fraction < 0.5 ? 0 : 30;
                      const start = new Date(currentDate);
                      start.setHours(h, minutes, 0, 0);
                      setDraft({ roomId: room.id, roomName: room.name, start });
                    }}
                    onMouseEnter={(e) => {
                      const hasMeeting = roomMeetings.some((m) => new Date(m.startTime).getHours() === h);
                      if (!hasMeeting) e.currentTarget.style.background = "rgba(55,138,221,0.055)";
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = todayActive && h === currentHour ? "rgba(55,138,221,0.035)" : "transparent"; }} />
                ))}

                {nowLineTop !== null && (
                  <div style={{ position: "absolute", top: nowLineTop, left: 0, right: 0, height: 2, background: "#378ADD", zIndex: 10, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#378ADD", marginLeft: -4, flexShrink: 0 }} />
                  </div>
                )}

                {layoutItems.map(({ meeting, colIdx, totalCols }, mi) => (
                  <MeetingCard
                    key={meeting.id ?? `${room.id}-${mi}`}
                    meeting={meeting} colorIdx={ri}
                    currentUserId={currentUserId}
                    colIdx={colIdx} totalCols={totalCols}
                    onHover={(e, m) => setTooltip({ meeting: m, roomName: room.name, position: { x: e.clientX, y: e.clientY } })}
                    onLeave={() => setTooltip(null)}
                    onClick={(m) => setSelected({ type: "view", meeting: m, roomName: room.name })}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {tooltip && <Tooltip data={tooltip} position={tooltip.position} />}
      {selected && selected.type === "view" && <DetailModal meeting={selected.meeting} roomName={selected.roomName} onClose={() => setSelected(null)} />}
      {selected && selected.type === "edit" && (
        <EditModal meeting={selected.meeting} onClose={() => setSelected(null)}
          onSave={(updated) => setMeetings((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m))} />
      )}
      {draft && <DraftModal draft={draft} onClose={() => setDraft(null)} onBook={handleBook} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes rcg-modal-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rcg-spin { to { transform: rotate(360deg); } }
        @keyframes toast-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const navBtnStyle = {
  width: 28, height: 28, borderRadius: "50%", border: "0.5px solid #ddd",
  background: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
  justifyContent: "center", fontSize: 18, color: "#666", lineHeight: 1,
};