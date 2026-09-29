import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Único lugar del proyecto donde se crea el cliente de Prisma
export const prisma = new PrismaClient();
