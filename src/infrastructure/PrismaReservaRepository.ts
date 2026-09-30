import type { IReservaRepository } from "../domain/IReservaRepository.js";
import type { DatosReserva, FiltrosReserva, ReservaParqueadero, Zona } from "../domain/ReservaParqueadero.js";
import { prisma } from "./prisma.js";

const ACTIVO = "ACTIVE";

function condicionListado(f: FiltrosReserva) {
  return {
    state: ACTIVO,
    ...(f.dia_id !== undefined && { dia_id: f.dia_id }),
    ...(f.zona_id !== undefined && { zona_id: f.zona_id }),
    ...(f.asistente_id !== undefined && { asistente_id: f.asistente_id }),
  };
}

export class PrismaReservaRepository implements IReservaRepository {
  async listar(filtros: FiltrosReserva, page: number, limit: number): Promise<ReservaParqueadero[]> {
    return prisma.reservas_parqueadero.findMany({
      where: condicionListado(filtros),
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async contar(filtros: FiltrosReserva): Promise<number> {
    return prisma.reservas_parqueadero.count({ where: condicionListado(filtros) });
  }

  async buscarPorId(id: number): Promise<ReservaParqueadero | null> {
    return prisma.reservas_parqueadero.findFirst({ where: { id, state: ACTIVO } });
  }

  async buscarPorPlaca(placa: string): Promise<ReservaParqueadero[]> {
    return prisma.reservas_parqueadero.findMany({ where: { placa, state: ACTIVO }, orderBy: { id: "asc" } });
  }

  async crear(datos: DatosReserva): Promise<ReservaParqueadero> {
    return prisma.reservas_parqueadero.create({ data: { ...datos, state: ACTIVO } });
  }

  async actualizar(id: number, datos: Partial<DatosReserva>): Promise<ReservaParqueadero> {
    return prisma.reservas_parqueadero.update({ where: { id }, data: datos });
  }

  async borrar(id: number): Promise<void> {
    await prisma.reservas_parqueadero.update({ where: { id }, data: { state: "REMOVED" } });
  }

  // ---- Solo lectura de otras tablas ----
  async existeAsistente(id: number): Promise<boolean> {
    return (await prisma.asistentes.count({ where: { id } })) > 0;
  }

  async existeDia(id: number): Promise<boolean> {
    return (await prisma.dias.count({ where: { id } })) > 0;
  }

  async buscarZona(id: number): Promise<Zona | null> {
    // ⚠️ Verifiquen en schema.prisma que las columnas de "zonas" se llamen tipo y capacidad
    return prisma.zonas.findUnique({ where: { id }, select: { id: true, tipo: true, capacidad: true } });
  }

  // ---- Consultas para las reglas ----
  async contarActivasZonaDia(zona_id: number, dia_id: number, excluirId?: number): Promise<number> {
    return prisma.reservas_parqueadero.count({
      where: { zona_id, dia_id, state: ACTIVO, ...(excluirId !== undefined && { id: { not: excluirId } }) },
    });
  }

  async existePlacaActivaEnDia(placa: string, dia_id: number, excluirId?: number): Promise<boolean> {
    const n = await prisma.reservas_parqueadero.count({
      where: { placa, dia_id, state: ACTIVO, ...(excluirId !== undefined && { id: { not: excluirId } }) },
    });
    return n > 0;
  }
}
