import { Router } from "express";
import { CrearReserva } from "../../application/CrearReserva.js";
import { EditarReserva } from "../../application/EditarReserva.js";
import { PrismaReservaRepository } from "../../infrastructure/PrismaReservaRepository.js";
import { EscrituraController } from "../controllers/EscrituraController.js";

const repo = new PrismaReservaRepository();
const controller = new EscrituraController(new CrearReserva(repo), new EditarReserva(repo));

const router = Router();
router.post("/", controller.crear);
router.patch("/:id", controller.editar);

export default router;
