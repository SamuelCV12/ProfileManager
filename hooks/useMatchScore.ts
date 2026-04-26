// hooks/useMatchScore.ts
// Hook para calcular el match entre perfil y vacante con IA

import { useState } from "react";

interface MatchScores {
  algorithmic: number;
  semantic: number | null;
  final: number;
}

interface MatchAnalysis {
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

interface MatchResult {
  success: boolean;
  scores?: MatchScores;
  action?: "auto_apply" | "suggest_apply" | "no_action";
  analysis?: MatchAnalysis | null;
  error?: string;
}

export function useMatchScore() {
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const calculateMatch = async (profile: any, vacancy: any): Promise<MatchResult> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, vacancy }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al calcular match");
      }

      setMatchResult(result);

      // Si el match es 100, disparar postulación automática
      if (result.action === "auto_apply") {
        await triggerAutoApply(vacancy.id, result.scores.final, result.action);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Error desconocido";
      const failResult = { success: false, error };
      setMatchResult(failResult);
      return failResult;
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAutoApply = async (
    vacancyId: string,
    finalScore: number,
    action: string
  ) => {
    try {
      await fetch("/api/ai/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyId, finalScore, action }),
      });
    } catch (err) {
      console.error("Error en auto-apply:", err);
    }
  };

  const manualApply = async (vacancyId: string, finalScore: number) => {
    return triggerAutoApply(vacancyId, finalScore, "suggest_apply");
  };

  return {
    calculateMatch,
    manualApply,
    isLoading,
    matchResult,
  };
}