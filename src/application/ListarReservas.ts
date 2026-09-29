import type { IReservaRepository } from "../domain/IReservaRepository.js";
import { parsearEnteroQuery, parsearPaginacion } from "./validaciones.js";

export class ListarReservas {
  constructor(private readonly repo: IReservaRepository) {}

  async ejecutar(query: Record<string, unknown>) {
    const { page, limit } = parsearPaginacion(query);
    const filtros = {
      dia_id: parsearEnteroQuery(query.dia_id, "dia_id"),
      zona_id: parsearEnteroQuery(query.zona_id, "zona_id"),
      asistente_id: parsearEnteroQuery(query.asistente_id, "asistente_id"),
    };

    const [total, data] = await Promise.all([
      this.repo.contar(filtros),
      this.repo.listar(filtros, page, limit),
    ]);

    return {
      pagination: { total, currentPage: page, limit, totalPages: Math.ceil(total / limit) },
      data,
    };
  }
}
