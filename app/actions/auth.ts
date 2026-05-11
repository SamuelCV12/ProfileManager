// app/actions/auth.ts
"use server";

import prisma from "../../lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs"; 

export async function loginUser(data: { email: string; password: string; tipoUsuario: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      return { error: "Usuario no encontrado. Revisa tu correo o regístrate." };
    }

    const passwordValida = await bcrypt.compare(data.password, user.password);
    if (!passwordValida) {
      return { error: "Contraseña incorrecta." };
    }
    

    const expectedRole = data.tipoUsuario === "empresa" ? "COMPANY" : "CANDIDATE";
    if (user.role !== expectedRole) {
      const roleName = user.role === "COMPANY" ? "Empresa" : "Candidato";
      return { error: `Esta cuenta pertenece a un(a) ${roleName}. Cambia el tipo de cuenta arriba.` };
    }

    // ✅ Guardamos el userId en una cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set("session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: "/",
    });

    console.log('✅ Login exitoso - Cookie "session_user_id" seteada para user:', user.id);

    return { success: true };
  } catch (error) {
    console.error("Error en login:", error);
    return { error: "Error de conexión con la base de datos." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session_user_id");
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session_user_id")?.value || null;
}