# Festival Picnic 2026 - Parqueadero (Módulo 06)

Este es nuestro módulo para la entrega 2 de Desarrollo Web. Es una API para reservar parqueadero en el festival, ya sea para carro o para moto, en alguno de los días del evento.

Todos los equipos usan la misma base de datos, así que nosotros solo escribimos en la tabla `reservas_parqueadero`. Las tablas de asistentes, zonas y días solo las leemos.

## Integrantes

**Valery Monsalve** ([@valeryy86](https://github.com/valeryy86))
Hizo la configuración del proyecto y la conexión a la base. También hizo la parte de dominio, las validaciones, el repositorio con Prisma, el manejo de errores y los endpoints para listar, buscar por id, buscar por placa y borrar. Además hizo un script con pruebas extra y limpió el repositorio.

**Samuel Uribe** ([@suribe27](https://github.com/suribe27))
Hizo las reglas de negocio, crear reservas, editar reservas con PATCH, las rutas de esa parte y este README.

## Con qué lo hicimos

Node.js, Express, TypeScript, Prisma y PostgreSQL (la base está en Supabase).

## Cómo está organizado

Usamos las cuatro capas que vimos en clase:

- **domain:** cómo es una reserva y qué funciones tiene que tener el repositorio (la interfaz).
- **application:** los casos de uso. Aquí están todas las validaciones y las reglas de negocio.
- **infrastructure:** la conexión con Prisma. Es la única carpeta donde se usa Prisma.
- **interface:** las rutas, los controladores y el manejo de errores. Los controladores solo reciben la petición, llaman al caso de uso y responden.

```
src/
├── domain/
├── application/
├── infrastructure/
├── interface/
│   ├── controllers/
│   ├── routes/
│   └── middlewares/
└── app.ts
```

## Cómo correrlo

1. Clonar el repo e instalar todo:
   ```bash
   git clone https://github.com/valeryy86/festival-parqueadero.git
   cd festival-parqueadero
   npm install
   ```

2. Copiar el archivo `.env.example`, llamarlo `.env` y poner la contraseña de la base donde dice `[YOUR-PASSWORD]`:
   ```
      DATABASE_URL="postgresql://postgres.bvrtfkhqlmdsysfjcjtw:[YOUR-PASSWORD]@aws-0-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=3&connect_timeout=30&pool_timeout=30"
      PORT=3000
   ```

3. Traer las tablas de la base:
   ```bash
   npm run sync
   ```
   Ojo: nunca usar `prisma migrate` ni `prisma db push`, porque se pueden borrar las tablas de los demás equipos.

4. Prender la API:
   ```bash
   npm run dev
   ```
   Queda en `http://localhost:3000/api/reservas-parqueadero`.

**Un problema que tuvimos:** con el WiFi de la universidad no nos podíamos conectar a la base, nos salía "Can't reach database server". Lo arreglamos conectándonos con los datos del celular.

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/reservas-parqueadero` | Lista las reservas con paginación |
| GET | `/api/reservas-parqueadero/:id` | Trae una reserva |
| POST | `/api/reservas-parqueadero` | Crea una reserva |
| PATCH | `/api/reservas-parqueadero/:id` | Edita una reserva |
| DELETE | `/api/reservas-parqueadero/:id` | Borra una reserva (no la borra de verdad, le cambia el `state` a `REMOVED`) |
| GET | `/api/reservas-parqueadero/placa/:placa` | Trae las reservas activas de una placa |

En el listado se puede usar `page` y `limit` (máximo 50), y filtrar por `dia_id`, `zona_id` y `asistente_id`.

Con PATCH solo se puede cambiar `zona_id`, `dia_id`, `placa` y `tipo_vehiculo`. Si se manda otro campo, responde 400.

Ejemplo para crear una reserva:
```json
{
  "asistente_id": 5,
  "zona_id": 3,
  "dia_id": 1,
  "placa": "XYZ123",
  "tipo_vehiculo": "CARRO"
}
```

## Qué valida la API

Si una petición tiene varios errores, la API responde el primero de esta lista:

1. **400** si falta algún dato o está mal. Por ejemplo, si `dia_id` viene como texto, si el vehículo no es `CARRO` ni `MOTO`, o si la placa no tiene el formato correcto. La placa de carro es 3 letras y 3 números (`XYZ123`) y la de moto es 3 letras, 2 números y 1 letra (`ABC12D`).
2. **404** si el asistente, la zona o el día no existen.
3. **400** si la zona existe pero no es de parqueadero (por ejemplo, una zona de camping).
4. **409** si se rompe alguna de las dos reglas:
   - Una zona no puede tener más reservas que su capacidad en un mismo día.
   - Una placa solo puede tener una reserva activa por día.

## La regla que explicamos: una placa, una reserva por día

**Qué valida:** cuando alguien crea o edita una reserva, la API mira si esa placa ya tiene otra reserva activa ese mismo día. Si ya la tiene, responde 409 y no deja guardar. Pero si es otro día, sí deja. Las reservas que ya se borraron no cuentan.

Algo que tuvimos que tener en cuenta es que cuando se edita una reserva, no se puede comparar con ella misma. Si no, al editar cualquier cosa siempre diría que la placa ya está reservada, porque se encontraría a sí misma.

**Dónde está:** en `src/application/reglasReserva.ts`. Esa función la usan `CrearReserva.ts` y `EditarReserva.ts`. La consulta a la base está en `existePlacaActivaEnDia`, dentro de `src/infrastructure/PrismaReservaRepository.ts`.

**Cómo la probamos:**
1. Con Thunder Client creamos una reserva con la placa `SAM123` para el día 3 y nos respondió 201.
2. Mandamos la misma petición otra vez y nos respondió 409, diciendo que esa placa ya tenía reserva ese día.
3. Le cambiamos el día a 2 y ahí sí respondió 201.
4. Al final borramos las reservas que creamos.

Además, la prueba del kit "una placa solo se reserva una vez por día" sale en verde.

## Pruebas

Las pruebas del kit se corren desde la carpeta del kit, con la API prendida:
```bash
node pruebas/correr.mjs parqueadero http://localhost:3000
```
Nos salieron las 14 en verde.

También hicimos un script con más casos (paginación mal puesta, ids que no existen, el orden de los errores, editar campos que no se pueden y borrar dos veces). Se corre desde la carpeta del proyecto:
```bash
node scripts/pruebas-extra.mjs http://localhost:3000
```
Nos salieron las 44 en verde.

Las dos pruebas crean reservas y las borran al final, así que no dañan los datos.
