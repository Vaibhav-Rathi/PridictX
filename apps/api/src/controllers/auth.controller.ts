import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma, type OtpType } from "@repo/db";
import type { UserInput } from "shared";
import { findVerifiedCode, sendOtp, verifyOtp } from "../lib/otp.js";
import { createSession, destroySession, type Session } from "../lib/session.js";

type EmailBody = Pick<UserInput, "email">;
type VerifyOtpBody = EmailBody & { type: OtpType };

export async function signup(req: Request, res: Response) {
  const { email } = req.body as EmailBody;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    res.status(409).json({ message: "User already exist with this email." });
    return;
  }

  const result = await sendOtp(email, "REGISTER");
  res.status(result.status).json({ message: result.message });
}

// starts the password reset flow
export async function sendOtpHandler(req: Request, res: Response) {
  const { email } = req.body as EmailBody;

  const result = await sendOtp(email, "RESET");
  res.status(result.status).json({ message: result.message });
}

export async function verifyOtpHandler(req: Request, res: Response) {
  const { email, type } = req.body as VerifyOtpBody;
  const otp = req.body.otp == null ? "" : String(req.body.otp).trim();

  if (!otp) {
    res.status(400).json({ message: "Email and OTP are required." });
    return;
  }

  const result = await verifyOtp(email, otp, type);

  if (!result.verified) {
    res.status(result.status).json({ message: result.message });
    return;
  }

  res.status(200).json({ message: result.message, email });
}

export async function register(req: Request, res: Response) {
  const { email, password } = req.body as UserInput;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    res.status(409).json({ message: "User already exist with this email." });
    return;
  }

  const otp = await findVerifiedCode(email, "REGISTER");

  if (!otp) {
    res.status(400).json({ message: "Email not verified or verification expired." });
    return;
  }


  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
    },
  });

  await prisma.verificationCode.deleteMany({
    where: { email },
  });

  res.status(201).json({ message: "User Created.", data: createdUser });
}

// flow: /api/auth/send-otp -> /api/auth/verify-otp -> here
export async function resetPassword(req: Request, res: Response) {
  const { email, password } = req.body as UserInput;

  const isVerified = await findVerifiedCode(email, "RESET");

  if (!isVerified) {
    res.status(400).json({ message: "Email not verified or verification expired." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(404).json({ message: "user does not exist" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  await prisma.verificationCode.deleteMany({
    where: { email },
  });

  res.status(200).json({ message: "Password reset done." });
}

// replaces next-auth's credentials sign-in: checks the password and starts a session
export async function signin(req: Request, res: Response) {
  const { email, password } = req.body as UserInput;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }

  const session = createSession(res, user);
  res.status(200).json({ message: "Signed in.", session });
}

export function logout(_req: Request, res: Response) {
  destroySession(res);
  res.status(200).json({ message: "Logged out." });
}

// replaces next-auth's GET /api/auth/session; requireAuth has already validated it
export function session(_req: Request, res: Response) {
  res.status(200).json({ session: res.locals.session as Session });
}
