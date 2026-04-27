import { prisma } from "../config/prisma";
import { Request, Response } from "express";
import { AuthRequest } from "../types/express";

// ✅ GET MEETINGS BY ROOM (filtered by date, only APPROVED)
export const getMeetingsByRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, date } = req.query;

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const meetings = await prisma.meeting.findMany({
      where: {
        roomId: Number(roomId),
        status: "APPROVED",
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { user: { select: { id: true, name: true } } },
    });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching meetings" });
  }
};

// ✅ DELETE MEETING
export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.meeting.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting meeting" });
  }
};

// ✅ UPDATE MEETING
export const updateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;

    const meeting = await prisma.meeting.update({
      where: { id: Number(req.params.id) },
      data: { title },
    });

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error updating meeting" });
  }
};

// ✅ CREATE MEETING — starts as PENDING
export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { title, startTime, endTime, roomId } = req.body;
    console.log("🔥 BOOKING BODY:", req.body); // ← debug log

    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    if (!title || !startTime || !endTime || !roomId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const numericRoomId = Number(roomId);
    console.log("🔥 NUMERIC ROOM ID:", numericRoomId); // ← debug log

    // Check overlap only among APPROVED meetings
    const conflict = await prisma.meeting.findFirst({
      where: {
        roomId: numericRoomId,
        status: "APPROVED",
        OR: [
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) },
          },
        ],
      },
    });

    if (conflict) {
      return res
        .status(400)
        .json({ message: "Room already booked in this time slot" });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        roomId: numericRoomId,
        userId: req.user.id,
        status: "PENDING",
      },
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating meeting" });
  }
};

// ✅ GET MY MEETINGS (all statuses)
export const getMyMeetings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const meetings = await prisma.meeting.findMany({
      where: { userId: req.user.id },
      orderBy: { startTime: "asc" },
      include: { room: true },
    });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching meetings" });
  }
};

// ✅ GET MY PENDING MEETINGS (for calendar)
export const getMyPendingMeetings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { roomId, date } = req.query;

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const meetings = await prisma.meeting.findMany({
      where: {
        userId: req.user.id,
        roomId: Number(roomId),
        status: "PENDING",
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { room: true },
    });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching pending meetings" });
  }
};

// ✅ ADMIN — GET ALL PENDING MEETINGS
export const getPendingMeetings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const meetings = await prisma.meeting.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        room: true,
      },
    });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching pending meetings" });
  }
};

// ✅ ADMIN — APPROVE
export const approveMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const meeting = await prisma.meeting.update({
      where: { id: Number(req.params.id) },
      data: { status: "APPROVED" },
      include: { room: true, user: true },
    });

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error approving meeting" });
  }
};

// ✅ ADMIN — REJECT
export const rejectMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const meeting = await prisma.meeting.update({
      where: { id: Number(req.params.id) },
      data: { status: "REJECTED" },
      include: { room: true, user: true },
    });

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error rejecting meeting" });
  }
};

// ✅ ADMIN — GET ALL
export const getAllMeetings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const meetings = await prisma.meeting.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        room: true,
      },
    });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching all meetings" });
  }
};

// ✅ GET ALL ROOMS MEETINGS — single API call for calendar
export const getAllRoomsMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const start = new Date(date as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date as string);
    end.setHours(23, 59, 59, 999);

    const userId = req.user?.id;

    const meetings = await prisma.meeting.findMany({
      where: {
        startTime: { gte: start, lte: end },
        OR: [
          { status: "APPROVED" },
          { status: "PENDING", userId: userId },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
    });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching meetings" });
  }
};