import { useNavigate, useParams } from "react-router-dom";
import { roomCategories } from "../data/room";
import RoomCalendarGrid from "../components/RoomCalendarGrid";

// Import Logo
import deeLogo from "../assets/DEEclean.png";

export default function RoomPage() {
  const { categoryIndex } = useParams();
  const navigate = useNavigate();
  const category = roomCategories[Number(categoryIndex)];

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg mb-4">Category not found.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#0f172a] font-medium hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navy Header with Logo */}
      <div className="bg-[#0b2c4a] text-white py-5 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ✅ DEE Logo */}
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-4 pb-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-6 transition-colors"
        >
          ← Back to Dashboard
        </button>

        {/* Room category info */}
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-800">{category.name}</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {category.count} Rooms
          </span>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-3xl shadow-xl p-6 overflow-hidden">
          <RoomCalendarGrid rooms={category.rooms} />
        </div>
      </div>
    </div>
  );
}
