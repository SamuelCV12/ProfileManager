/**
 * apply.ts
 * Este archivo contiene las funciones server-side para manejar las postulaciones a vacantes y la actualización de estados de las aplicaciones. 
 * Las funciones interactúan con la base de datos a través de Prisma y revalidan las páginas correspondientes para reflejar los cambios en tiempo real.
 * 
 * Funciones:
 * - applyToVacancy: Permite a un candidato postularse a una vacante específica, verificando que no haya una postulación previa.
 * - updateApplicationStatus: Permite a la empresa actualizar el estado de una aplicación (e.g., ACEPTADO, RECHAZADO), revalidando tanto el dashboard de la empresa como el del candidato para mostrar los cambios.
 * 
 * Nota: Asegúrate de que el modelo Application en tu esquema de Prisma tenga los campos necesarios para que estas funciones funcionen correctamente.
 */

"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function applyToVacancy(vacancyId: string, profileId: string) {
  try {
    const existingApplication = await prisma.application.findFirst({
      where: { vacancyId, profileId }
    });

    if (existingApplication) {
      return { error: "Ya estás postulado a esta vacante." };
    }

    await prisma.application.create({
      data: { vacancyId, profileId, status: "POSTULADO" }
    });

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error(error);
    return { error: "Hubo un error al procesar tu postulación." };
  }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });
    revalidatePath("/dashboard-company");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "No se pudo actualizar el estado." };
  }
}