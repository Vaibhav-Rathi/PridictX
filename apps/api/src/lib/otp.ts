import { randomInt, timingSafeEqual } from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { prisma, type OtpType } from "@repo/db";
import { otpEmail } from "./otp-email.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;
export const VERIFIED_TTL_MS = 10 * 60 * 1000;

let transporter: Transporter | undefined;

// created on first use so env vars from .env are already loaded
function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      // gmail shows app passwords as "abcd efgh ijkl mnop"; the spaces aren't part of it
      pass: process.env.EMAIL_PASSWORD?.replace(/\s+/g, ""),
    },
  });
  return transporter;
}

// every code belongs to one flow (REGISTER or RESET), so a code sent for a
// password reset can never be used to register, and the other way round
export async function sendOtp(email: string, type: OtpType) {
  const latest = await prisma.verificationCode.findFirst({
    where: { email, type },
    orderBy: { createdAt: "desc" },
  });

  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { sent: false, status: 429, message: "Please wait a minute before requesting another OTP." };
  }

  const otp = randomInt(100000, 1000000).toString();

  await prisma.verificationCode.deleteMany({
    where: { email, type },
  });

  await prisma.verificationCode.create({
    data: {
      email,
      type,
      code: otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  try {
    await getTransporter().sendMail({
      from: `"PridictX" <${process.env.EMAIL_USER}>`,
      to: email,
      ...otpEmail(otp, OTP_TTL_MS / 60000),
    });
  } catch (error) {
    console.error("sendOtp: failed to send email", error);
    await prisma.verificationCode.deleteMany({
      where: { email, type },
    });
    return { sent: false, status: 502, message: "Could not send the OTP email. Please try again." };
  }

  return { sent: true, status: 200, message: "OTP sent" };
}

function codesMatch(expected: string, received: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function verifyOtp(email: string, otp: string, type: OtpType) {
  const verification = await prisma.verificationCode.findFirst({
    where: { email, type, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    return { verified: false, status: 400, message: "Invalid OTP." };
  }

  if (verification.expiresAt < new Date()) {
    return { verified: false, status: 400, message: "OTP has expired." };
  }

  // count the attempt atomically so parallel guesses can't go past the limit
  const claimed = await prisma.verificationCode.updateMany({
    where: { id: verification.id, attempts: { lt: MAX_OTP_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });

  if (claimed.count === 0) {
    return { verified: false, status: 429, message: "Too many incorrect attempts. Please request a new OTP." };
  }

  if (!codesMatch(verification.code, otp)) {
    const remaining = MAX_OTP_ATTEMPTS - (verification.attempts + 1);
    if (remaining <= 0) {
      return { verified: false, status: 429, message: "Too many incorrect attempts. Please request a new OTP." };
    }
    return { verified: false, status: 400, message: `Invalid OTP. ${remaining} attempt(s) left.` };
  }

  await prisma.verificationCode.update({
    where: { id: verification.id },
    data: {
      verified: true,
      expiresAt: new Date(Date.now() + VERIFIED_TTL_MS),
    },
  });

  return { verified: true, status: 200, message: "OTP verified successfully" };
}

// a code for this flow that was verified and hasn't expired yet
export async function findVerifiedCode(email: string, type: OtpType) {
  return prisma.verificationCode.findFirst({
    where: {
      email,
      type,
      verified: true,
      expiresAt: { gt: new Date() },
    },
  });
}
