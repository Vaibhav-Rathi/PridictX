import type { RequestHandler } from "express";
import { getSession } from "../lib/session.js";

// protects a route: rejects with 401 unless the session cookie is valid,
// otherwise makes the session available as res.locals.session
export const requireAuth: RequestHandler = (req, res, next) => {
  const session = getSession(req);

  if (!session) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }

  res.locals.session = session;
  next();
};
