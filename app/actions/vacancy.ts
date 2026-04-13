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
        isActive: true, // Forzamos que siempre nazca activa por defecto
      }
    });
    revalidatePath("/dashboard-company");
    return { success: true };
  } catch (error) {
    console.error("Error creando vacante:", error);
    return { error: "No se pudo crear la vacante." };
  }
}

export async function updateVacancy(vacancyId: string, data: {
  title?: string;
  description?: string;
  modality?: string;
  salaryRange?: string;
  mustHave?: string[];
  isActive?: boolean;
}) {
  try {
    await prisma.vacancy.update({
      where: { id: vacancyId },
      data: {
        title: data.title,
        description: data.description,
        modality: data.modality,
        salaryRange: data.salaryRange,
        mustHave: data.mustHave,
        isActive: data.isActive, // El toggle booleano
      }
    });
    revalidatePath("/dashboard-company");
    return { success: true };
  } catch (error) {
    console.error("Error actualizando vacante:", error);
    return { error: "No se pudo actualizar la vacante." };
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