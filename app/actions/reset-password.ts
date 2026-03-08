"use server";

import prisma from "../../lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) return { error: "Usuario no encontrado" };

  const token = uuidv4();
  const expires = new Date(Date.now() + 3600 * 1000); // Expira en 1 hora

  await prisma.passwordResetToken.create({
    data: { email, token, expires }
  });

  // ENLACE DE PRUEBA: En una app real, esto se envía por email
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  console.log("-----------------------------------------");
  console.log("🔗 ENLACE DE RECUPERACIÓN PARA:", email);
  console.log(resetLink);
  console.log("-----------------------------------------");

  return { success: true };
}
export async function resetPassword(token: string, newPassword: string) {
    // 1. Buscamos el token en la base de datos
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token }
    });
  
    if (!resetRecord) {
      return { error: "El enlace es inválido o ya fue utilizado." };
    }
  
    // 2. Verificamos que no haya expirado (le dimos 1 hora)
    if (new Date() > resetRecord.expires) {
      // Si expiró, lo borramos para limpiar la base de datos
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
      return { error: "El enlace ha expirado. Por favor, solicita uno nuevo." };
    }
  
    // 3. Actualizamos la contraseña del usuario
    // NOTA DE INGENIERÍA: En un entorno de producción real, aquí deberías encriptar la contraseña (ej. con bcrypt). 
    // Para este demo, la guardamos tal cual la enviamos.
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: newPassword }
    });
  
    // 4. Borramos el token para que no se pueda volver a usar
    await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
  
    return { success: true };
  }