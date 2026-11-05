import type { RequestHandler } from "express";
import type { z } from "zod";

// validates req.body against a Zod schema. parsed fields (trimmed and
// lowercased email etc) overwrite the raw ones; other fields are kept.
export const validate =
  (schema: z.ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      res.status(400).json({ message: result.error.issues[0]?.message ?? "Invalid request body." });
      return;
    }

    req.body = { ...req.body, ...(result.data as object) };
    next();
  };
