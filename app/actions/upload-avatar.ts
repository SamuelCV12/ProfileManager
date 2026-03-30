"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function uploadAvatar(formData: FormData) {
  try {
    const file = formData.get("avatar") as File;
    if (!file || file.size === 0) return { error: "Archivo no válido." };

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Solo se permiten imágenes (JPG, PNG, WEBP)." };
    }

    // Máximo 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { error: "La imagen no puede superar 5MB." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Avatares van a public/uploads/avatars/
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-avatar.${ext}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return { success: true, url: `/uploads/avatars/${fileName}` };

  } catch (error) {
    console.error("Error subiendo avatar:", error);
    return { error: "No se pudo subir la imagen." };
  }
}