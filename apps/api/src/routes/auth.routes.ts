import { Router } from "express";
import { z } from "zod";
import { OtpType } from "@repo/db";
import { userSchema } from "shared";
import {
  logout,
  register,
  resetPassword,
  sendOtpHandler,
  session,
  signin,
  signup,
  verifyOtpHandler,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const emailOnly = userSchema.pick({ email: true });
// the client says which flow the code is for: REGISTER (signup) or RESET (send-otp)
const verifyOtpSchema = emailOnly.extend({
  type: z.enum(OtpType, "type must be REGISTER or RESET"),
});

router.post("/signup", validate(emailOnly), signup);
router.post("/send-otp", validate(emailOnly), sendOtpHandler);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpHandler);
router.post("/register", validate(userSchema), register);
router.post("/reset-password", validate(userSchema), resetPassword);

router.post("/signin", validate(userSchema), signin);
router.post("/logout", logout);
router.get("/session", requireAuth, session);

export default router;
