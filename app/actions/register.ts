// app/actions/register.ts
"use server";

import prisma from "../../lib/prisma";
import { calcularCompletitud } from "../../lib/completitud";

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

export async function registerUser(data: RegisterData) {
  try {
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { error: "Este correo ya está registrado." };
    }

    const completitud = calcularCompletitud(data, data.avatarUrl || null);

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