// app/actions/auth.ts
"use server";

import prisma from "../../lib/prisma";

export async function loginUser(data: { email: string; password: string; tipoUsuario: string }) {
  try {
    // 1. Buscamos el usuario por su email
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    // 2. Si no existe, devolvemos error (Esto "limpia" el null para TypeScript)
    if (!user || user === null) {
      return { error: "Usuario no encontrado. Revisa tu correo o regístrate." };
    }

    // 3. Validamos la contraseña
    // Usamos una validación directa ahora que sabemos que 'user' existe
    if (user.password !== data.password) {
      return { error: "Contraseña incorrecta." };
    }

    // 4. Validamos el rol
    const expectedRole = data.tipoUsuario === "empresa" ? "COMPANY" : "CANDIDATE";
    if (user.role !== expectedRole) {
      const roleName = user.role === 'COMPANY' ? 'Empresa' : 'Candidato';
      return { error: `Esta cuenta pertenece a un(a) ${roleName}. Cambia el tipo de cuenta arriba.` };
    }

    return { success: true };
    
  } catch (error) {
    console.error("Error en login:", error);
    return { error: "Error de conexión con la base de datos." };
  }
}