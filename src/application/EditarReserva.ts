import { HttpError } from "../domain/HttpError.js";
import type { IReservaRepository } from "../domain/IReservaRepository.js";
import type { DatosReserva } from "../domain/ReservaParqueadero.js";
import { verificarReferenciasYReglas } from "./reglasReserva.js";
import { esEnteroPositivo, esObjeto, parsearIdParam, TIPOS_VEHICULO, validarDatosReserva } from "./validaciones.js";

const CAMPOS_EDITABLES = ["zona_id", "dia_id", "placa", "tipo_vehiculo"];

export class EditarReserva {
  constructor(private readonly repo: IReservaRepository) {}

  async ejecutar(idParam: string, cuerpo: unknown) {
    const id = parsearIdParam(idParam);
    const cambios = cuerpo === undefined ? {} : cuerpo;
    if (!esObjeto(cambios)) throw new HttpError(400, "El cuerpo debe ser un objeto JSON");

    // 1. 400: solo campos editables y con el tipo correcto
    const noPermitidos = Object.keys(cambios).filter((c) => !CAMPOS_EDITABLES.includes(c));
    if (noPermitidos.length > 0) {
      throw new HttpError(400, `Estos campos no se pueden editar: ${noPermitidos.join(", ")}`);
    }
    for (const campo of ["zona_id", "dia_id"]) {
      if (campo in cambios && !esEnteroPositivo(cambios[campo])) {
        throw new HttpError(400, `${campo} debe ser un entero positivo`);
      }
    }
    if ("tipo_vehiculo" in cambios && !TIPOS_VEHICULO.includes(cambios.tipo_vehiculo as string)) {
      throw new HttpError(400, "tipo_vehiculo debe ser CARRO o MOTO");
    }
    if ("placa" in cambios && typeof cambios.placa !== "string") {
      throw new HttpError(400, "placa debe ser texto");
    }

    // 2. 404: la reserva debe existir (y no estar REMOVED)
    const actual = await this.repo.buscarPorId(id);
    if (!actual) throw new HttpError(404, `La reserva ${id} no existe`);

    // Se combinan los datos actuales con los cambios y se vuelve a validar todo
    const combinado = validarDatosReserva({
      asistente_id: actual.asistente_id,
      zona_id: actual.zona_id,
      dia_id: actual.dia_id,
      placa: actual.placa,
      tipo_vehiculo: actual.tipo_vehiculo,
      ...cambios,
    });
    await verificarReferenciasYReglas(this.repo, combinado, id); // se excluye a sí misma

    return this.repo.actualizar(id, cambios as Partial<DatosReserva>);
  }
}
