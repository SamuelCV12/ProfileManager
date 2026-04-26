// app/api/ai/auto-apply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/app/actions/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { vacancyId, finalScore, action } = body;

    if (!vacancyId || finalScore === undefined) {
      return NextResponse.json(
        { error: "Se requieren vacancyId y finalScore" },
        { status: 400 }
      );
    }

    // Obtener el profileId real del usuario (Application usa profileId, no userId)
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la vacante existe y está activa
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy || !vacancy.isActive) {
      return NextResponse.json(
        { error: "Vacante no encontrada o inactiva" },
        { status: 404 }
      );
    }

    // Verificar si ya existe una postulación
    const existingApplication = await prisma.application.findFirst({
      where: {
        profileId: profile.id,
        vacancyId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Ya te has postulado a esta vacante", alreadyApplied: true },
        { status: 409 }
      );
    }

    // Postulación automática si match = 100
    if (action === "auto_apply" && finalScore === 100) {
      const application = await prisma.application.create({
        data: {
          profileId: profile.id,
          vacancyId,
          status: "POSTULADO",
          // appliedAt ya tiene @default(now()) en el schema
        },
      });

      return NextResponse.json({
        success: true,
        autoApplied: true,
        application,
        message: "¡Match perfecto! Te postulamos automáticamente.",
      });
    }

    // Postulación manual (acción del candidato, match >= 70)
    if (action === "manual_apply") {
      const application = await prisma.application.create({
        data: {
          profileId: profile.id,
          vacancyId,
          status: "POSTULADO",
        },
      });

      return NextResponse.json({
        success: true,
        autoApplied: false,
        application,
        message: "Postulación realizada con éxito.",
      });
    }

    // Si solo es sugerencia, no postular — solo informar
    return NextResponse.json({
      success: true,
      autoApplied: false,
      message: `Tu match es del ${finalScore}%. ¿Deseas postularte?`,
      finalScore,
    });
  } catch (error) {
    console.error("Error en auto-apply:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}