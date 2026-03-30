// app/actions/company.ts
"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCompany(companyId: string, formData: any) {
  try {
    await prisma.company.update({
      where: { id: companyId },
      data: {
        name:          formData.name?.trim() || "",
        location:      formData.location?.trim() || "",
        coreBusiness:  formData.coreBusiness?.trim() || "",
        employeeCount: formData.employeeCount || 0,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error actualizando empresa:", error);
    return { error: "Hubo un problema guardando los datos." };
  }
}