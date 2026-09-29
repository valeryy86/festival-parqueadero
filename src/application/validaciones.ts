import { HttpError } from "../domain/HttpError.js";
import type { DatosReserva } from "../domain/ReservaParqueadero.js";

const MAX_INT = 2147483647; // máximo de un int en PostgreSQL

export const TIPOS_VEHICULO = ["CARRO", "MOTO"];

export const REGEX_PLACA: Record<string, RegExp> = {
  CARRO: /^[A-Z]{3}[0-9]{3}$/, // XYZ123
  MOTO: /^[A-Z]{3}[0-9]{2}[A-Z]$/, // ABC12D
};

// Entero JSON positivo (no acepta "1" como texto)
export function esEnteroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isInteger(valor) && valor > 0 && valor <= MAX_INT;
}

export function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function textoAEnteroPositivo(valor: unknown): number | null {
  if (typeof valor !== "string" || !/^[0-9]+$/.test(valor)) return null;
  const n = Number(valor);
  return n > 0 && n <= MAX_INT ? n : null;
}

// :id de la URL → 400 si no es entero positivo
export function parsearIdParam(valor: string): number {
  const n = textoAEnteroPositivo(valor);
  if (n === null) throw new HttpError(400, "El id debe ser un entero positivo");
  return n;
}

// Parámetro opcional del query string (?dia_id=, ?page=...)
export function parsearEnteroQuery(valor: unknown, nombre: string): number | undefined {
  if (valor === undefined) return undefined;
  const n = textoAEnteroPositivo(valor);
  if (n === null) throw new HttpError(400, `${nombre} debe ser un entero positivo`);
  return n;
}

export function parsearPaginacion(query: Record<string, unknown>): { page: number; limit: number } {
  const page = parsearEnteroQuery(query.page, "page") ?? 1;
  const limit = parsearEnteroQuery(query.limit, "limit") ?? 10;
  if (limit > 50) throw new HttpError(400, "limit no puede ser mayor que 50");
  return { page, limit };
}

// Validaciones de formato (400) de una reserva completa
export function validarDatosReserva(cuerpo: unknown): DatosReserva {
  if (!esObjeto(cuerpo)) throw new HttpError(400, "El cuerpo debe ser un objeto JSON");

  for (const campo of ["asistente_id", "zona_id", "dia_id"]) {
    if (!esEnteroPositivo(cuerpo[campo])) {
      throw new HttpError(400, `${campo} es obligatorio y debe ser un entero positivo`);
    }
  }

  const tipo = cuerpo.tipo_vehiculo;
  if (typeof tipo !== "string" || !TIPOS_VEHICULO.includes(tipo)) {
    throw new HttpError(400, "tipo_vehiculo debe ser CARRO o MOTO");
  }

  const placa = cuerpo.placa;
  if (typeof placa !== "string" || !REGEX_PLACA[tipo].test(placa)) {
    const formato = tipo === "CARRO" ? "3 letras mayúsculas y 3 dígitos (XYZ123)" : "3 letras, 2 dígitos y 1 letra (ABC12D)";
    throw new HttpError(400, `La placa de ${tipo} debe tener ${formato}`);
  }

  return {
    asistente_id: cuerpo.asistente_id as number,
    zona_id: cuerpo.zona_id as number,
    dia_id: cuerpo.dia_id as number,
    placa,
    tipo_vehiculo: tipo,
  };
}
