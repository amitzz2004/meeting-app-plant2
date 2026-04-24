import { useState } from "react";
import API from "../api/axios";

export default function CreateMeetingModal({ slot, onClose }) {
  const [title, setTitle] = useState("");

  const createMeeting = async () => {
    try {
      await API.post("/meetings", {
        title,
        startTime: slot.start,
        endTime: slot.end,
        roomId: slot.roomId
      });

      alert("Meeting booked!");
      onClose();
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80">
        <h2 className="text-lg font-bold mb-3">Book Room</h2>

        <input
          className="border w-full p-2 mb-3"
          placeholder="Meeting Title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          onClick={createMeeting}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}