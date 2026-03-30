"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import mammoth from "mammoth";

export async function uploadResume(formData: FormData) {
  try {
    const file = formData.get("resume") as File;
    if (!file || file.size === 0) return { error: "Archivo no válido." };

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      return { error: "Solo se permiten archivos de Word (.docx)." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ CVs van a public/uploads/cvs/
    const uploadDir = join(process.cwd(), "public", "uploads", "cvs");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const result = await mammoth.extractRawText({ buffer });
    const fullText = result.value;

    const lines = fullText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const fullName = lines[0] || "Candidato";
    const nameParts = fullName.split(" ");

    const extractedData = {
      firstName: nameParts[0] || "Candidato",
      lastName: nameParts.slice(1).join(" ") || "Por actualizar",
      education: extractSection(fullText, ["EDUCACIÓN", "FORMACIÓN", "ESTUDIOS"]),
      experience: extractSection(fullText, ["EXPERIENCIA", "HISTORIAL LABORAL", "TRAYECTORIA"])
    };

    return { success: true, url: `/uploads/cvs/${fileName}`, extractedData };

  } catch (error) {
    console.error("Error en extracción:", error);
    return { error: "No se pudo leer el contenido del archivo Word." };
  }
}

function extractSection(text: string, keywords: string[]): string[] {
  const lines = text.split("\n");
  let sectionData: string[] = [];
  let recording = false;

  for (let line of lines) {
    const upperLine = line.toUpperCase().trim();
    if (keywords.some(k => upperLine.includes(k))) {
      recording = true;
      continue;
    }
    if (recording && upperLine.length > 3 && upperLine === line.trim() && line.trim().length < 35) {
      if (!keywords.some(k => upperLine.includes(k))) break;
    }
    if (recording && line.trim().length > 5) {
      sectionData.push(line.trim());
    }
    if (sectionData.length >= 3) break;
  }
  return sectionData.length > 0 ? sectionData : ["Información no detectada automáticamente."];
}