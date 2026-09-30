import "dotenv/config";
import cors from "cors";
import express from "express";
import { manejarErrores } from "./interface/middlewares/manejarErrores.js";
import consultasRoutes from "./interface/routes/consultas.routes.js";
import escrituraRoutes from "./interface/routes/escritura.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/reservas-parqueadero", consultasRoutes);
app.use("/api/reservas-parqueadero", escrituraRoutes);

// Ruta que no existe
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(manejarErrores);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`API de parqueadero en http://localhost:${PORT}`));
