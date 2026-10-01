// Pruebas extra (casos borde del contrato y CONVENCIONES.md)
// Uso: node scripts/pruebas-extra.mjs http://localhost:3000
const BASE = (process.argv[2] || "http://localhost:3000") + "/api/reservas-parqueadero";

let ok = 0, fallas = 0;

async function pedir(metodo, ruta, cuerpo) {
  const opciones = { method: metodo, headers: { "Content-Type": "application/json" } };
  if (cuerpo !== undefined) opciones.body = JSON.stringify(cuerpo);
  const r = await fetch(BASE + ruta, opciones);
  let json = null;
  try { json = await r.json(); } catch {}
  return { status: r.status, json };
}

async function caso(nombre, metodo, ruta, cuerpo, esperado, extra) {
  const r = await pedir(metodo, ruta, cuerpo);
  let bien = r.status === esperado;
  if (bien && extra) bien = extra(r.json);
  if (bien) { ok++; console.log(`  ✓ ${nombre}`); }
  else { fallas++; console.log(`  ✗ ${nombre}\n      Se esperaba ${esperado}, respondió ${r.status} ${JSON.stringify(r.json)}`); }
  return r;
}

const tieneError = (j) => j && typeof j.error === "string";
const placaCarro = "QAZ" + String(Math.floor(Math.random() * 900) + 100);
const valido = { asistente_id: 7, zona_id: 3, dia_id: 3, placa: placaCarro, tipo_vehiculo: "CARRO" };

console.log("\n— Paginación y filtros");
await caso("limit=0 → 400", "GET", "?limit=0", undefined, 400, tieneError);
await caso("limit=51 → 400", "GET", "?limit=51", undefined, 400, tieneError);
await caso("page=-1 → 400", "GET", "?page=-1", undefined, 400, tieneError);
await caso("limit=abc → 400", "GET", "?limit=abc", undefined, 400, tieneError);
await caso("limit=50 → 200", "GET", "?limit=50", undefined, 200);
await caso("page=2&limit=1 → currentPage 2", "GET", "?page=2&limit=1", undefined, 200,
  (j) => j.pagination.currentPage === 2 && j.pagination.limit === 1 && j.data.length <= 1);
await caso("dia_id=abc → 400", "GET", "?dia_id=abc", undefined, 400, tieneError);
await caso("zona_id=abc → 400", "GET", "?zona_id=abc", undefined, 400, tieneError);

console.log("\n— Ids");
await caso("GET /0 → 400", "GET", "/0", undefined, 400, tieneError);
await caso("PATCH /999999 con {} → 404", "PATCH", "/999999", {}, 404, tieneError);
await caso("DELETE /999999 → 404", "DELETE", "/999999", undefined, 404, tieneError);
await caso("DELETE /abc → 400", "DELETE", "/abc", undefined, 400, tieneError);

console.log("\n— Validaciones del POST");
await caso('dia_id como texto "1" → 400', "POST", "", { ...valido, dia_id: "1" }, 400, tieneError);
await caso("sin placa → 400", "POST", "", { ...valido, placa: undefined }, 400, tieneError);
await caso("tipo BICI → 400", "POST", "", { ...valido, tipo_vehiculo: "BICI" }, 400, tieneError);
await caso("tipo en minúsculas → 400", "POST", "", { ...valido, tipo_vehiculo: "carro" }, 400, tieneError);
await caso("CARRO con placa de moto → 400", "POST", "", { ...valido, placa: "ABC12D" }, 400, tieneError);
await caso("MOTO con placa de carro → 400", "POST", "", { ...valido, tipo_vehiculo: "MOTO", zona_id: 4 }, 400, tieneError);
await caso("placa en minúsculas → 400", "POST", "", { ...valido, placa: "abc123" }, 400, tieneError);
await caso("asistente 999 → 404", "POST", "", { ...valido, asistente_id: 999 }, 404, tieneError);
await caso("zona 999 → 404", "POST", "", { ...valido, zona_id: 999 }, 404, tieneError);
await caso("dia 999 → 404", "POST", "", { ...valido, dia_id: 999 }, 404, tieneError);
await caso("zona 1 (camping) → 400", "POST", "", { ...valido, zona_id: 1 }, 400, tieneError);
await caso("orden: placa mala + asistente 999 → 400", "POST", "", { ...valido, placa: "MAL", asistente_id: 999 }, 400, tieneError);
await caso("orden: zona 1 + asistente 999 → 404", "POST", "", { ...valido, zona_id: 1, asistente_id: 999 }, 404, tieneError);
await caso("orden: zona 1 + placa repetida → 400 (no 409)", "POST", "", { ...valido, zona_id: 1, dia_id: 1, placa: "KJH345" }, 400, tieneError);

console.log("\n— Crear, editar y borrar");
const creada = await caso("POST válido (ignora state enviado) → 201", "POST", "", { ...valido, state: "REMOVED" }, 201,
  (j) => j.data && Number.isInteger(j.data.id) && j.data.state === "ACTIVE" && j.data.placa === placaCarro);
const id = creada.json?.data?.id;

if (id) {
  await caso("PATCH asistente_id → 400", "PATCH", `/${id}`, { asistente_id: 3 }, 400, tieneError);
  await caso("PATCH state → 400", "PATCH", `/${id}`, { state: "REMOVED" }, 400, tieneError);
  await caso('PATCH dia_id "2" texto → 400', "PATCH", `/${id}`, { dia_id: "2" }, 400, tieneError);
  await caso("PATCH a zona 1 → 400", "PATCH", `/${id}`, { zona_id: 1 }, 400, tieneError);
  await caso("PATCH a zona 999 → 404", "PATCH", `/${id}`, { zona_id: 999 }, 404, tieneError);
  await caso("PATCH tipo MOTO sin cambiar placa → 400", "PATCH", `/${id}`, { tipo_vehiculo: "MOTO" }, 400, tieneError);
  await caso("PATCH a zona 4 día 1 (llena) → 409", "PATCH", `/${id}`, { zona_id: 4, dia_id: 1, tipo_vehiculo: "MOTO", placa: "QAZ12Z" }, 409, tieneError);
  await caso("PATCH placa KJH345 al día 1 (ya existe) → 409", "PATCH", `/${id}`, { placa: "KJH345", dia_id: 1 }, 409, tieneError);
  await caso("PATCH con los mismos datos → 200 (no choca consigo misma)", "PATCH", `/${id}`, { placa: placaCarro, dia_id: 3 }, 200,
    (j) => j.data && j.data.id === id);
  await caso("POST misma placa otro día → 201", "POST", "", { ...valido, dia_id: 2 }, 201);
  const otra = await pedir("GET", `/placa/${placaCarro}`);
  const otraId = otra.json?.data?.find((r) => r.dia_id === 2)?.id;
  await caso("GET /placa/:placa trae las 2 reservas", "GET", `/placa/${placaCarro}`, undefined, 200, (j) => Array.isArray(j.data) && j.data.length === 2);

  await caso("DELETE → 200", "DELETE", `/${id}`, undefined, 200);
  await caso("DELETE otra vez → 404", "DELETE", `/${id}`, undefined, 404, tieneError);
  await caso("GET borrada → 404", "GET", `/${id}`, undefined, 404, tieneError);
  await caso("PATCH borrada → 404", "PATCH", `/${id}`, { dia_id: 2 }, 404, tieneError);
  await caso("GET /placa/:placa ya no trae la borrada", "GET", `/placa/${placaCarro}`, undefined, 200, (j) => j.data.length === 1);
  if (otraId) await pedir("DELETE", `/${otraId}`); // limpieza
}

await caso("GET /placa/ZZZ999 → data []", "GET", "/placa/ZZZ999", undefined, 200, (j) => Array.isArray(j.data) && j.data.length === 0);

console.log(`\nResultado: ${ok}/${ok + fallas}\n`);
