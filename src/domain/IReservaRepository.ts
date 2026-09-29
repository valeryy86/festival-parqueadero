import type { DatosReserva, FiltrosReserva, ReservaParqueadero, Zona } from "./ReservaParqueadero.js";

export interface IReservaRepository {
  listar(filtros: FiltrosReserva, page: number, limit: number): Promise<ReservaParqueadero[]>;
  contar(filtros: FiltrosReserva): Promise<number>;
  buscarPorId(id: number): Promise<ReservaParqueadero | null>; // solo ACTIVE
  buscarPorPlaca(placa: string): Promise<ReservaParqueadero[]>; // solo ACTIVE
  crear(datos: DatosReserva): Promise<ReservaParqueadero>;
  actualizar(id: number, datos: Partial<DatosReserva>): Promise<ReservaParqueadero>;
  borrar(id: number): Promise<void>; // borrado lógico: state = 'REMOVED'

  // Lecturas de otras tablas (solo lectura)
  existeAsistente(id: number): Promise<boolean>;
  existeDia(id: number): Promise<boolean>;
  buscarZona(id: number): Promise<Zona | null>;

  // Consultas para las reglas de negocio
  contarActivasZonaDia(zona_id: number, dia_id: number, excluirId?: number): Promise<number>;
  existePlacaActivaEnDia(placa: string, dia_id: number, excluirId?: number): Promise<boolean>;
}
