import { HttpError } from "../domain/HttpError.js";
import type { IReservaRepository } from "../domain/IReservaRepository.js";
import { parsearIdParam } from "./validaciones.js";

export class BorrarReserva {
  constructor(private readonly repo: IReservaRepository) {}

  async ejecutar(idParam: string) {
    const id = parsearIdParam(idParam);
    const reserva = await this.repo.buscarPorId(id); // si ya está REMOVED, no la encuentra → 404
    if (!reserva) throw new HttpError(404, `La reserva ${id} no existe`);
    await this.repo.borrar(id);
  }
}
