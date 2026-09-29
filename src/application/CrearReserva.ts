import type { IReservaRepository } from "../domain/IReservaRepository.js";
import { verificarReferenciasYReglas } from "./reglasReserva.js";
import { validarDatosReserva } from "./validaciones.js";

export class CrearReserva {
  constructor(private readonly repo: IReservaRepository) {}

  async ejecutar(cuerpo: unknown) {
    const datos = validarDatosReserva(cuerpo); // 1. 400 (ignora campos extra como state)
    await verificarReferenciasYReglas(this.repo, datos); // 2. 404 · 3. 400 · 4. 409
    return this.repo.crear(datos);
  }
}
