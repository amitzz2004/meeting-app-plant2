import express from "express";
import {
  getAllUsers,
  createUser,
  deleteUser,
  makeAdmin,
  getPendingMeetings,
  approveMeeting
} from "../controllers/admin.controller";

import { authMiddleware } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";
import { getPendingUsers, approveUser, rejectUser } from "../controllers/admin.controller";

const router = express.Router();

// ================= USER =================
router.get("/all-users", authMiddleware, isAdmin, getAllUsers);
router.get("/pending-users", authMiddleware, isAdmin, getPendingUsers);
router.post("/approve-user/:id", authMiddleware, isAdmin, approveUser);
router.post("/reject-user/:id", authMiddleware, isAdmin, rejectUser);
router.post("/create-user", authMiddleware, isAdmin, createUser);
router.delete("/delete-user/:id", authMiddleware, isAdmin, deleteUser);
router.post("/make-admin/:id", authMiddleware, isAdmin, makeAdmin);

// ================= MEETING =================
router.get("/pending", authMiddleware, isAdmin, getPendingMeetings);
router.post("/approve/:id", authMiddleware, isAdmin, approveMeeting);

export default router;