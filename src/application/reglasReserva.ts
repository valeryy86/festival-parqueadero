import { HttpError } from "../domain/HttpError.js";
import type { IReservaRepository } from "../domain/IReservaRepository.js";
import type { DatosReserva } from "../domain/ReservaParqueadero.js";

// Pasos 2, 3 y 4 del orden de validaciones (el paso 1 es validarDatosReserva).
// La usan CrearReserva y EditarReserva. En la edición se pasa excluirId para no contarse a sí misma.
export async function verificarReferenciasYReglas(repo: IReservaRepository, d: DatosReserva, excluirId?: number) {
  // 2. 404: los ids referenciados deben existir
  const [existeAsistente, existeDia, zona] = await Promise.all([
    repo.existeAsistente(d.asistente_id),
    repo.existeDia(d.dia_id),
    repo.buscarZona(d.zona_id),
  ]);
  if (!existeAsistente) throw new HttpError(404, `El asistente ${d.asistente_id} no existe`);
  if (!zona) throw new HttpError(404, `La zona ${d.zona_id} no existe`);
  if (!existeDia) throw new HttpError(404, `El día ${d.dia_id} no existe`);

  // 3. 400: la zona existe pero no es de parqueadero
  if (zona.tipo !== "PARQUEADERO") {
    throw new HttpError(400, `La zona ${d.zona_id} no es de tipo PARQUEADERO`);
  }

  // 4. 409: reglas de negocio
  // Regla 2: una placa tiene máximo una reserva activa por día
  if (await repo.existePlacaActivaEnDia(d.placa, d.dia_id, excluirId)) {
    throw new HttpError(409, `La placa ${d.placa} ya tiene una reserva activa ese día`);
  }

  // Regla 1: la zona no recibe más reservas que su capacidad en un mismo día
  const ocupados = await repo.contarActivasZonaDia(d.zona_id, d.dia_id, excluirId);
  if (zona.capacidad !== null && ocupados >= zona.capacidad) {
    throw new HttpError(409, `La zona ${d.zona_id} no tiene cupo disponible ese día`);
  }
}
