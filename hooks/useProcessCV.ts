// hooks/useProcessCV.ts
// Hook para manejar la subida y procesamiento de CV con IA

import { useState } from "react";

interface ExtractedCVData {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  desiredRole: string;
  summary: string;
  skills: string[];
  education: string[];
  experience: string[];
  languages: string[];
  certifications: string[];
}

interface ProcessCVResult {
  success: boolean;
  data?: ExtractedCVData;
  error?: string;
}

export function useProcessCV() {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedCVData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convierte un File a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Quitamos el prefijo "data:application/pdf;base64,"
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  };

  const processCV = async (file: File): Promise<ProcessCVResult> => {
    if (!file) {
      setError("No se seleccionó ningún archivo");
      return { success: false, error: "No se seleccionó ningún archivo" };
    }

    if (file.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF");
      return { success: false, error: "Solo se aceptan archivos PDF" };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB límite
      setError("El archivo no debe superar los 10MB");
      return { success: false, error: "El archivo no debe superar los 10MB" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const pdfBase64 = await fileToBase64(file);

      const response = await fetch("/api/ai/process-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64 }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al procesar el CV");
      }

      setExtractedData(result.data);
      return { success: true, data: result.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setExtractedData(null);
    setError(null);
  };

  return {
    processCV,
    isLoading,
    extractedData,
    error,
    reset,
  };
}