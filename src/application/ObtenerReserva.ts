import { HttpError } from "../domain/HttpError.js";
import type { IReservaRepository } from "../domain/IReservaRepository.js";
import { parsearIdParam } from "./validaciones.js";

export class ObtenerReserva {
  constructor(private readonly repo: IReservaRepository) {}

  async ejecutar(idParam: string) {
    const id = parsearIdParam(idParam); // 400
    const reserva = await this.repo.buscarPorId(id);
    if (!reserva) throw new HttpError(404, `La reserva ${id} no existe`); // 404 (incluye REMOVED)
    return reserva;
  }
}
