
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; // adjust path if needed

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const signup = async () => {
    try {
      setLoading(true);
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Signup successful!");
      navigate("/"); // Better than window.location
    } catch (err) {
      console.error(err);
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] flex flex-col">

      {/* Header - Same as Login */}
      <div className="mt-4 bg-[#0b2c4a] text-white text-center py-4 shadow-md">
        <h1 className="text-2x2 tracking-wide font-semibold text-[#4333a5]">
          <span className="text-red-600">DEE</span>{" "}
          <span className="text-[#4333a5]">PIPING SYSTEM</span>
          
        </h1>
        <p className="text-s text-gray-300 font-bold mt-1">
          Inhouse Meeting Room Booking Platform
        </p>
      </div>

      {/* Card - Same style as Login */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white shadow-md w-full max-w-sm p-8">

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
            Create Account
          </h2>
          <p className="text-xs text-gray-500 text-center mb-6">
            Sign up to get started
          </p>

          {/* Name */}
          <input
            type="text"
            value={name}
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-xl text-xs
                       text-gray-800 placeholder-gray-400 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       transition"
          />

          {/* Email */}
          <input
            type="email"
            value={email}
            placeholder="Company Email ID"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-xl text-xs
                       text-gray-800 placeholder-gray-400 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       transition"
          />

          {/* Password */}
          <input
            type="password"
            value={password}
            placeholder="Password : Same as your Company Email ID"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 mb-6 border border-gray-200 rounded-xl text-xs
                       text-gray-800 placeholder-gray-400 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       transition"
          />

          {/* Sign Up Button */}
          <button
            onClick={signup}
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold
                       rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          {/* Login Link */}
          <p className="text-xs text-center text-gray-500 mt-5">
            Already have an account?{" "}
            <span
              className="text-blue-500 hover:underline cursor-pointer font-medium"
              onClick={() => navigate("/")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}