import { Router } from "express";
import { BorrarReserva } from "../../application/BorrarReserva.js";
import { ListarReservas } from "../../application/ListarReservas.js";
import { ObtenerReserva } from "../../application/ObtenerReserva.js";
import { ReservasPorPlaca } from "../../application/ReservasPorPlaca.js";
import { PrismaReservaRepository } from "../../infrastructure/PrismaReservaRepository.js";
import { ConsultasController } from "../controllers/ConsultasController.js";

const repo = new PrismaReservaRepository();
const controller = new ConsultasController(
  new ListarReservas(repo),
  new ObtenerReserva(repo),
  new ReservasPorPlaca(repo),
  new BorrarReserva(repo),
);

const router = Router();
router.get("/", controller.listar);
router.get("/placa/:placa", controller.porPlaca); // ANTES de "/:id"
router.get("/:id", controller.obtener);
router.delete("/:id", controller.borrar);

export default router;
