"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVacancy(data: {
  companyId: string;
  title: string;
  description: string;
  modality: string;
  salaryRange: number | null;
  mustHave: string[];
  niceToHave: string[];
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
        niceToHave: data.niceToHave,
        isActive: true,
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
  salaryRange?: number | null;
  mustHave?: string[];
  niceToHave?: string[];
  isActive?: boolean;
}) {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.modality !== undefined) updateData.modality = data.modality;
    if (data.salaryRange !== undefined) updateData.salaryRange = data.salaryRange;
    if (data.mustHave !== undefined) updateData.mustHave = data.mustHave;
    if (data.niceToHave !== undefined) updateData.niceToHave = data.niceToHave;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await prisma.vacancy.update({
      where: { id: vacancyId },
      data: updateData,
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