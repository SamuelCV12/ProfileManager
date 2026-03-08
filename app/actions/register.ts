// app/actions/register.ts
"use server";

import prisma from "../../lib/prisma";

// 1. La interfaz DEBE tener estos campos como arreglos de strings
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  description?: string;
  desiredRole?: string;
  birthDate?: string;
  role: "CANDIDATE";
  education: string[]; // <-- Arreglo de strings para US-01
  experience: string[]; // <-- Arreglo de strings para US-01
}

export async function registerUser(data: RegisterData) {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: data.role,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            description: data.description,
            desiredRole: data.desiredRole,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            // AQUÍ ES DONDE TE SALÍA EL ERROR
            education: data.education, 
            experience: data.experience,
            completitud: 50 // Valor inicial por procesar el CV
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