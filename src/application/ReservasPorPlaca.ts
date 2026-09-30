import type { IReservaRepository } from "../domain/IReservaRepository.js";

export class ReservasPorPlaca {
  constructor(private readonly repo: IReservaRepository) {}

  // Reservas activas de la placa; si no hay, arreglo vacío
  async ejecutar(placa: string) {
    return this.repo.buscarPorPlaca(placa.toUpperCase());
  }
}
