// app/actions/profile.ts
"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(profileId: string, formData: any) {
  try {
    const existingProfile = await prisma.profile.findUnique({
      where: { id: profileId }
    });

    const avatarUrl = formData.avatarUrl || existingProfile?.avatarUrl || null;

    await prisma.profile.update({
      where: { id: profileId },
      data: {
        firstName:   formData.firstName?.trim()   || "",
        lastName:    formData.lastName?.trim()    || "",
        desiredRole: formData.desiredRole?.trim() || "",
        description: formData.description?.trim() || "",
        birthDate:   formData.birthDate ? new Date(formData.birthDate) : null,
        phone:       formData.phone?.trim()       || null,
        skills:      Array.isArray(formData.skills)     ? formData.skills     : [],
        education:   Array.isArray(formData.education)  ? formData.education  : [],
        experience:  Array.isArray(formData.experience) ? formData.experience : [],
        avatarUrl,
      }
    });

    // Leer el perfil actualizado para devolverlo al cliente
    const updatedProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    });

    revalidatePath("/", "layout");
    return { success: true, profile: updatedProfile };
  } catch (error) {
    console.error("Error guardando perfil:", error);
    return { error: "Hubo un problema guardando tu perfil." };
  }
}