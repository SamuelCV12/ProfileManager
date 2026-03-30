// app/actions/profile.ts
"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(profileId: string, formData: any) {
  try {
    let score = 0;

    // ─── STRINGS (60 puntos) ───
    if (formData.firstName?.trim())   score += 10;
    if (formData.lastName?.trim())    score += 10;
    if (formData.desiredRole?.trim()) score += 10;
    if (formData.description?.trim()) score += 10;
    if (formData.birthDate?.trim())   score += 10;
    if (formData.phone?.trim())       score += 10;

    // ─── ARRAYS (30 puntos) ───
    if (Array.isArray(formData.skills)     && formData.skills.length > 0)     score += 10;
    if (Array.isArray(formData.education)  && formData.education.length > 0)  score += 10;
    if (Array.isArray(formData.experience) && formData.experience.length > 0) score += 10;

    // ─── FOTO (10 puntos) ───
    const existingProfile = await prisma.profile.findUnique({ where: { id: profileId } });
    const avatarUrl = formData.avatarUrl || existingProfile?.avatarUrl || null;
    if (avatarUrl) score += 10;

    const completitudFinal = Math.min(score, 100);

    await prisma.profile.update({
      where: { id: profileId },
      data: {
        firstName:   formData.firstName?.trim() || "",
        lastName:    formData.lastName?.trim()  || "",
        desiredRole: formData.desiredRole?.trim() || "",
        description: formData.description?.trim() || "",
        birthDate:   formData.birthDate ? new Date(formData.birthDate) : null,
        phone:       formData.phone?.trim() || null, // ✅ campo agregado
        skills:      formData.skills,
        experience:  formData.experience,
        education:   formData.education,
        avatarUrl:   avatarUrl,
        completitud: completitudFinal,
      }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error guardando perfil:", error);
    return { error: "Hubo un problema guardando tu perfil." };
  }
}