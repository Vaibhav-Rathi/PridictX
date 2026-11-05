import type { ErrorRequestHandler } from "express";


export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ message: "Invalid JSON body." });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
};
