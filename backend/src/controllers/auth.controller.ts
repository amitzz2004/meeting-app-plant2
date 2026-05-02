import { prisma } from "../config/prisma";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ======================= REGISTER =======================
export const register = async (req: Request, res: Response) => {
  try {
    console.log("🔥 REGISTER BODY:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // ✅ Allow only company email domains
    const allowedDomains = ['deepiping.com', 'deepiping.co.th'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
      return res.status(400).json({
        message: "Only company email addresses are allowed (@deepiping.com)"
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "You are already registered. Please login instead." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        status: "PENDING",
      },
    });

    res.status(201).json({
      message: "Signup successful! Please wait for admin approval before logging in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// ======================= LOGIN =======================
export const login = async (req: Request, res: Response) => {
  try {
    console.log("🔥 LOGIN BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // ✅ STATUS CHECK
    if (user.status === "PENDING") {
      return res.status(403).json({
        message: "Your account is pending admin approval. Please wait.",
      });
    }

    if (user.status === "REJECTED") {
      return res.status(403).json({
        message: "Your account has been rejected. Please contact admin.",
      });
    }

    // 🔑 Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({
      message: "Error logging in",
    });
  }
};