import { useState } from "react";
import API from "../api/axios";

export default function BookingModal({ slot, roomId, onClose }) {
  const [title, setTitle] = useState("");

  const handleBooking = async () => {
    try {
      await API.post("/meetings", {
        title,
        startTime: slot.start,
        endTime: slot.end,
        roomId
      });

      alert("Meeting booked!");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80">
        <h2 className="text-lg font-bold mb-4">Book Meeting</h2>

        <input
          className="w-full p-2 border mb-3 rounded"
          placeholder="Meeting title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <button
          onClick={handleBooking}
          className="bg-blue-500 text-white w-full py-2 rounded"
        >
          Confirm Booking
        </button>

        <button
          onClick={onClose}
          className="mt-2 text-red-500 w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}