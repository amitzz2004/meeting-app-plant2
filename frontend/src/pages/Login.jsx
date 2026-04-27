import API from "../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const login = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] flex flex-col">

      {/* Header */}
      <div className="mt-4 bg-[#0b2c4a] text-white text-center py-4 shadow-md">
        <h1 className="text-2x2 tracking-wide font-semibold text-[#4333a5]">
          <span className="text-red-600">DEE</span>{" "}
          <span className="text-[#4333a5]">PIPING SYSTEM</span>
        </h1>
        <p className="text-s text-gray-300 font-bold mt-1">Inhouse Meeting Room Booking Platform</p>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white shadow-md w-full max-w-sm p-8">

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Login</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Enter your credentials to continue</p>


          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Email */}
          <input
            type="email"
            value={email}
            placeholder="Company Email ID"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-xl text-sm
                       text-gray-800 placeholder-gray-400 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       transition"
          />

          {/* Password */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Password:Same as your Company Email ID"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                         text-gray-800 placeholder-gray-400 bg-white pr-10
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                         transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Sign In button */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold
                       rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Contact admin note */}
          <p className="text-sm text-center text-gray-400 mt-5">
            Contact your administrator to get access
          </p>
          {/* Signup link */}
          <p className="text-sm text-center text-gray-500 mt-5">
            Don't have an account?{" "}
             <span
             className="text-blue-500 hover:underline cursor-pointer font-medium"
              onClick={() => navigate("/signup")}
              >
              Sign Up
              </span>
          </p>

        </div>
      </div>
    </div>
  );
}