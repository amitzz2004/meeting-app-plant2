import express from "express";
import cors from "cors";


import authRoutes from "./routes/auth.routes";
import meetingRoutes from "./routes/meeting.routes";
import adminRoutes from "./routes/admin.routes";

console.log("🔥 FILE STARTED");
console.log("🚀 SERVER FILE STARTED");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/meetings", meetingRoutes);
app.use("/admin", adminRoutes);

// Health check (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ✅ FIXED PORT (IMPORTANT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});