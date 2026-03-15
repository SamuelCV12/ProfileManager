/**
 *  Vacancy Actions
 * Este archivo contiene las funciones para crear y eliminar vacantes, utilizando Prisma para interactuar con la base de datos. Estas funciones se ejecutan en el servidor y revalidan la página del dashboard de la empresa después de cada operación.
 * 
 * Funciones: 
 * - createVacancy: Crea una nueva vacante con los datos proporcionados.
 * - deleteVacancy: Elimina una vacante existente por su ID.
 * Ambas funciones manejan errores y devuelven un objeto indicando el éxito o el error de la operación.
 * 
 * Nota: Asegúrate de que el modelo Vacancy en tu esquema de Prisma tenga los campos necesarios para que estas funciones funcionen correctamente.
 */


"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVacancy(data: {
  companyId: string;
  title: string;
  description: string;
  modality: string;
  salaryRange: string;
  mustHave: string[];
}) {
  try {
    await prisma.vacancy.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        description: data.description,
        modality: data.modality,
        salaryRange: data.salaryRange,
        mustHave: data.mustHave,
      }
    });
    revalidatePath("/dashboard-company");
    return { success: true };
  } catch (error) {
    console.error("Error creando vacante:", error);
    return { error: "No se pudo crear la vacante." };
  }
}

export async function deleteVacancy(vacancyId: string) {
  try {
    await prisma.vacancy.delete({ where: { id: vacancyId } });
    revalidatePath("/dashboard-company");
    return { success: true };
  } catch (error) {
    console.error("Error eliminando vacante:", error);
    return { error: "No se pudo eliminar la vacante." };
  }
}