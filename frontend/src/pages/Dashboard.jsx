import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { roomCategories } from "../data/room";

// Import Logo - Updated filename
import deeLogo from "../assets/DEEclean.png";

function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const user = getCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navy Header with Logo */}
      <div className="bg-[#0b2c4a] text-white py-5 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ✅ DEE Logo - Updated */}
            <img
              src={deeLogo}
              alt="DEE Piping Systems"
              className="w-12 h-12 object-contain"
            />

            <div>
              <h1 className="text-base tracking-wide font-semibold text-[#4333a5]">
                 <span className="text-red-600">DEE</span>{" "}
                 <span className="text-[#4333a5]">PIPING SYSTEM</span>
              </h1>
              <p className="text-xs text-slate-400">
                Inhouse Meeting Room Booking Platform • v1.0
              </p>
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-3">
            {user?.role === "ADMIN" && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                           text-purple-400 border border-purple-500/30 bg-purple-500/10
                           hover:bg-purple-500/20 transition-all duration-200"
              >
                👤 Admin Panel
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                         text-slate-400 border border-white/10 bg-white/5
                         hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400
                         transition-all duration-200"
            >
              <span>Logout</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Book a Meeting Room</h2>
          </div>
          <div className="px-5 py-2 bg-white rounded-2xl shadow-sm text-sm font-medium text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            3 Categories
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {roomCategories.map((cat, index) => (
            <div
              key={index}
              onClick={() => navigate(`/dashboard/rooms/${index}`)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group bg-white rounded-3xl shadow-sm border border-slate-100 p-6 
                         hover:shadow-xl hover:-translate-y-3 hover:border-[#0EA5E9]/30
                         transition-all duration-300 cursor-pointer flex flex-col h-full
                         hover:bg-gradient-to-br hover:from-blue-50 hover:to-white"
            >
              <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[#0f172a] transition-colors">
                {cat.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-[#0f172a] tabular-nums transition-colors">
                  {cat.count}
                </span>
                <span className="text-slate-500">Room</span>
              </div>

              <p className="text-sm text-slate-600 leading-snug flex-1">
                {index === 0 && "Ideal for team discussions"}
                {index === 1 && "Perfect for client meetings & presentations"}
                {index === 2 && "Spacious for leadership sessions"}
                {index === 3 && "For Training purposes"}
              </p>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 group-hover:text-[#0EA5E9] transition-colors">
                  Check Availability →
                </span>

                <div
                  className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center text-xl 
                               transition-all duration-300
                               ${hoveredCard === index
                                 ? 'border-[#0EA5E9] bg-[#0EA5E9] text-white scale-110 shadow-md'
                                 : 'border-slate-300 group-hover:border-slate-400'
                               }`}
                >
                  ↗
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}