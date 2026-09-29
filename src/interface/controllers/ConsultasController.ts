import type { NextFunction, Request, Response } from "express";
import type { BorrarReserva } from "../../application/BorrarReserva.js";
import type { ListarReservas } from "../../application/ListarReservas.js";
import type { ObtenerReserva } from "../../application/ObtenerReserva.js";
import type { ReservasPorPlaca } from "../../application/ReservasPorPlaca.js";

// Controlador delgado: recibe, delega al caso de uso y responde
export class ConsultasController {
  constructor(
    private readonly listarUC: ListarReservas,
    private readonly obtenerUC: ObtenerReserva,
    private readonly porPlacaUC: ReservasPorPlaca,
    private readonly borrarUC: BorrarReserva,
  ) {}

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.listarUC.ejecutar(req.query as Record<string, unknown>));
    } catch (e) { next(e); }
  };

  obtener = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await this.obtenerUC.ejecutar(String(req.params.id)) });
    } catch (e) { next(e); }
  };

  porPlaca = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await this.porPlacaUC.ejecutar(String(req.params.placa)) });
    } catch (e) { next(e); }
  };

  borrar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.borrarUC.ejecutar(String(req.params.id));
      res.json({ message: "Reserva eliminada" });
    } catch (e) { next(e); }
  };
}
