"use server";

import prisma from "../../lib/prisma";

export async function registerCompany(formData: any, roles: {title: string, description: string}[]) {
  try {
    // 1. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email }
    });

    if (existingUser) {
      return { error: "Este correo ya está registrado." };
    }

    // 2. Crear todo en una sola transacción para evitar datos incompletos
    await prisma.user.create({
      data: {
        email: formData.email,
        password: formData.password, // En producción usa un hash aquí
        role: "COMPANY",
        company: {
          create: {
            name: formData.name,
            nit: formData.nit,
            location: formData.location,
            coreBusiness: formData.coreBusiness,
            employeeCount: parseInt(formData.employeeCount),
            vacancies: {
              create: roles.map(role => ({
                title: role.title,
                description: role.description,
                modality: "Presencial" // Valor por defecto
              }))
            }
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error en registro corporativo:", error);
    return { error: "No se pudo completar el registro. Revisa los datos." };
  }
}