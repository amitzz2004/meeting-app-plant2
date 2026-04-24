import { prisma } from "../config/prisma";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

// ====================== GET ALL USERS ======================
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// ====================== CREATE USER (ADMIN) ======================
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department: department || null,
        role: role || "USER",
        status: "APPROVED",
      },
    });

    res.status(201).json({
      message: `✅ User "${user.name}" created successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// ====================== DELETE USER ======================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.role === "ADMIN") {
      return res.status(400).json({ message: "Cannot delete an Admin user" });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: `✅ User "${existingUser.name}" deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// ====================== MAKE ADMIN ======================
export const makeAdmin = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.role === "ADMIN") {
      return res.status(400).json({ message: "User is already an Admin" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: "ADMIN" }
    });

    res.json({
      message: `✅ "${user.name}" is now an Admin`,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating role" });
  }
};

// ====================== GET PENDING MEETINGS ======================
export const getPendingMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true, email: true } },
        room: { select: { name: true } }
      },
      orderBy: { startTime: "asc" }
    });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching pending meetings" });
  }
};

// ====================== APPROVE MEETING ======================
export const approveMeeting = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid meeting ID" });
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: { status: "APPROVED" }
    });

    res.json({
      message: "Meeting approved successfully",
      meeting
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving meeting" });
  }
};