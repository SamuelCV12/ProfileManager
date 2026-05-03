// components/ui/ApplicationCard.tsx
"use client";

import { MapPin, Monitor, DollarSign, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslatedContent } from "../../hooks/useTranslatedContent";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  POSTULADO:   { label: "Postulado",   color: "bg-blue-50 text-blue-700 border border-blue-200",          icon: Clock },
  EN_REVISION: { label: "En revisión", color: "bg-blue-50 text-blue-600 border border-blue-200",          icon: Clock },
  ENTREVISTA:  { label: "Aceptada",    color: "bg-[#7FFFD4]/30 text-[#1a7a65] border border-[#5FD3BC]/40", icon: CheckCircle },
  RECHAZADO:   { label: "Rechazada",   color: "bg-red-50 text-red-500 border border-red-200",             icon: XCircle },
  PENDIENTE:   { label: "Pendiente",   color: "bg-yellow-50 text-yellow-700 border border-yellow-200",    icon: Clock },
};

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric"
  });
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true
  });
}

export function ApplicationCard({ title, company, location, modalidad, salaryRange, status, appliedAt, interviewDate }: any) {
  const { t } = useLanguage();
  const { content } = useTranslatedContent({ title, company });
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["POSTULADO"];
  const Icon = cfg.icon;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-8">

        {/* COLUMNA IZQUIERDA — info apilada verticalmente */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-black leading-tight">{content.title || title}</h3>
            <p className="text-gray-500 text-sm mt-0.5">{content.company || company}</p>
          </div>

          {/* Cada dato en su propia línea */}
          <div className="flex flex-col gap-1.5 text-sm text-gray-500">
            {location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#5FD3BC] shrink-0" /> {location}
              </span>
            )}
            {modalidad && (
              <span className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#5FD3BC] shrink-0" /> {modalidad}
              </span>
            )}
            {salaryRange && (
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#5FD3BC] shrink-0" /> {salaryRange}
              </span>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA — estado + fecha + cita */}
        <div className="flex flex-col items-end gap-3 min-w-[220px]">
          {/* Badge de estado */}
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>

          {/* Fecha de postulación */}
          {appliedAt && (
            <div className="text-right">
              <p className="text-xs text-gray-400">{t.appliedAt}:</p>
              <p className="text-sm text-gray-600 font-medium">{formatDate(appliedAt)}</p>
            </div>
          )}

          {/* Cita programada */}
          {interviewDate && (
            <div className="flex items-start gap-2 bg-[#7FFFD4]/15 border border-[#5FD3BC]/30 rounded-xl px-3 py-2 w-full">
              <Calendar className="w-4 h-4 text-[#5FD3BC] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#1a7a65]">{t.scheduledInterview}</p>
                <p className="text-xs text-gray-600">{formatDateTime(interviewDate)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}