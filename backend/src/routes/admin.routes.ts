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

const router = express.Router();

// ================= USER =================
router.get("/all-users", authMiddleware, isAdmin, getAllUsers);
router.post("/create-user", authMiddleware, isAdmin, createUser);
router.delete("/delete-user/:id", authMiddleware, isAdmin, deleteUser);
router.post("/make-admin/:id", authMiddleware, isAdmin, makeAdmin);

// ================= MEETING =================
router.get("/pending", authMiddleware, isAdmin, getPendingMeetings);
router.post("/approve/:id", authMiddleware, isAdmin, approveMeeting);

export default router;