import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../domain/HttpError.js";

// Convierte cualquier error en { error: "..." } sin mostrar el stack trace
export function manejarErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  // JSON mal formado en el cuerpo de la petición
  if (typeof err === "object" && err !== null && (err as { type?: string }).type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo no es un JSON válido" });
  }
  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
}
