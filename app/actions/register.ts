// app/actions/register.ts
"use server";

import prisma from "../../lib/prisma";

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  description?: string;
  desiredRole?: string;
  birthDate?: string;
  phone?: string;
  role: "CANDIDATE";
  skills: string[];
  education: string[];
  experience: string[];
  avatarUrl?: string;
}

function calcularCompletitud(data: RegisterData): number {
  let score = 0;

  // Strings (60 puntos)
  if (data.firstName?.trim())   score += 10;
  if (data.lastName?.trim())    score += 10;
  if (data.desiredRole?.trim()) score += 10;
  if (data.description?.trim()) score += 10;
  if (data.birthDate?.trim())   score += 10;
  if (data.phone?.trim())       score += 10;

  // Arrays (30 puntos)
  if (data.skills?.length > 0)     score += 10;
  if (data.education?.length > 0)  score += 10;
  if (data.experience?.length > 0) score += 10;

  // Avatar (10 puntos)
  if (data.avatarUrl?.trim()) score += 10;

  return Math.min(score, 100);
}

export async function registerUser(data: RegisterData) {
  try {
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { error: "Este correo ya está registrado." };
    }

    const completitud = calcularCompletitud(data);

    const newUser = await prisma.user.create({
      data: {
        email:    data.email,
        password: data.password,
        role:     data.role,
        profile: {
          create: {
            firstName:   data.firstName,
            lastName:    data.lastName,
            description: data.description  || "",
            desiredRole: data.desiredRole  || "",
            phone:       data.phone        || null,
            avatarUrl:   data.avatarUrl    || null,
            birthDate:   data.birthDate ? new Date(data.birthDate) : null,
            skills:      data.skills       || [],
            education:   data.education    || [],
            experience:  data.experience   || [],
            completitud,
          },
        },
      },
    });

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error("Error al registrar:", error);
    return { error: "Hubo un fallo al crear tu perfil." };
  }
}