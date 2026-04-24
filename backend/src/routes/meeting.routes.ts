import express from "express";
import {
  createMeeting,
  getMyMeetings,
  getMeetingsByRoom,
  deleteMeeting,
  updateMeeting,
  getPendingMeetings,
  getMyPendingMeetings,
  approveMeeting,
  rejectMeeting,
  getAllMeetings,
  getAllRoomsMeetings, // ✅ NEW
} from "../controllers/meeting.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// ── User routes ──────────────────────────────────────────────
router.get("/", getMeetingsByRoom);
router.post("/", authMiddleware, createMeeting);
router.get("/my", authMiddleware, getMyMeetings);
router.get("/my-pending", authMiddleware, getMyPendingMeetings);
router.put("/:id", authMiddleware, updateMeeting);
router.delete("/:id", authMiddleware, deleteMeeting);

// ── Admin routes ─────────────────────────────────────────────
router.get("/admin/all", authMiddleware, getAllMeetings);
router.get("/admin/pending", authMiddleware, getPendingMeetings);
router.get("/admin/all-rooms", authMiddleware, getAllRoomsMeetings); // ✅ NEW
router.put("/admin/:id/approve", authMiddleware, approveMeeting);
router.put("/admin/:id/reject", authMiddleware, rejectMeeting);

export default router;