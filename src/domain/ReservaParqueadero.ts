export interface ReservaParqueadero {
  id: number;
  asistente_id: number;
  zona_id: number;
  dia_id: number;
  placa: string;
  tipo_vehiculo: string;
  state: string;
}

// Datos que llegan para crear una reserva (sin id ni state, que los pone el servidor)
export type DatosReserva = Omit<ReservaParqueadero, "id" | "state">;

export interface FiltrosReserva {
  dia_id?: number;
  zona_id?: number;
  asistente_id?: number;
}

export interface Zona {
  id: number;
  tipo: string;
  capacidad: number | null;
}
