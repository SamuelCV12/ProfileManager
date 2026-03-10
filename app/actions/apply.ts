// app/actions/apply.ts
"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function applyToVacancy(vacancyId: string, profileId: string) {
  try {
    // 1. Verificamos que no se haya postulado antes
    const existingApplication = await prisma.application.findFirst({
      where: { vacancyId, profileId }
    });

    if (existingApplication) {
      return { error: "Ya estás postulado a esta vacante." };
    }

    // 2. Creamos la postulación
    await prisma.application.create({
      data: {
        vacancyId,
        profileId,
        status: "POSTULADO"
      }
    });

    // 3. Refrescamos el dashboard para que se actualice la pestaña
    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error(error);
    return { error: "Hubo un error al procesar tu postulación." };
  }
}