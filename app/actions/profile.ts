// app/actions/profile.ts
"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(profileId: string, formData: any) {
  try {
    let score = 0;

    // 1. STRINGS: Usamos .trim() para asegurar que un espacio en blanco NO sume puntos
    if (formData.firstName && formData.firstName.trim() !== "") score += 15;
    if (formData.lastName && formData.lastName.trim() !== "") score += 15;
    if (formData.desiredRole && formData.desiredRole.trim() !== "") score += 10;
    if (formData.description && formData.description.trim() !== "") score += 10;

    // 2. ARRAYS: Aseguramos que existan y tengan al menos 1 elemento real
    if (Array.isArray(formData.skills) && formData.skills.length > 0) score += 15;
    if (Array.isArray(formData.education) && formData.education.length > 0) score += 15;
    if (Array.isArray(formData.experience) && formData.experience.length > 0) score += 20;

    const completitudFinal = Math.min(score, 100);

    // 3. Guardamos en PostgreSQL (limpiando también los espacios extra)
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        firstName: formData.firstName?.trim() || "",
        lastName: formData.lastName?.trim() || "",
        desiredRole: formData.desiredRole?.trim() || "",
        description: formData.description?.trim() || "",
        skills: formData.skills,
        experience: formData.experience,
        education: formData.education,
        completitud: completitudFinal,
      }
    });

    // 4. Limpiamos caché para que el Dashboard de candidato se actualice
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error guardando perfil:", error);
    return { error: "Hubo un problema guardando tu perfil." };
  }
}