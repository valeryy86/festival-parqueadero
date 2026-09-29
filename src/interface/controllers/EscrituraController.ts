import type { NextFunction, Request, Response } from "express";
import type { CrearReserva } from "../../application/CrearReserva.js";
import type { EditarReserva } from "../../application/EditarReserva.js";

export class EscrituraController {
  constructor(
    private readonly crearUC: CrearReserva,
    private readonly editarUC: EditarReserva,
  ) {}

  crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({ data: await this.crearUC.ejecutar(req.body) });
    } catch (e) { next(e); }
  };

  editar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await this.editarUC.ejecutar(String(req.params.id), req.body) });
    } catch (e) { next(e); }
  };
}
