// components/ui/JobCard.tsx
"use client";

import { useState } from "react";
import { MapPin, EyeOff, Eye, Loader2, Monitor, DollarSign } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslatedContent } from "../../hooks/useTranslatedContent";
import { applyToVacancy } from "../../app/actions/apply";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  POSTULADO:   { label: "Postulado",           color: "bg-blue-50 text-blue-700" },
  EN_REVISION: { label: "En Revisión",         color: "bg-yellow-50 text-yellow-700" },
  ENTREVISTA:  { label: "Entrevista Agendada", color: "bg-purple-50 text-purple-700" },
  RECHAZADO:   { label: "Rechazado",           color: "bg-red-50 text-red-700" },
};

function getMatchColor(match: number) {
  if (match === 100) return "bg-[#7FFFD4] text-[#1a7a65] border border-[#5FD3BC]";
  if (match >= 80)   return "bg-[#7FFFD4]/40 text-[#1a7a65] border border-[#5FD3BC]/40";
  if (match >= 50)   return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  return "bg-red-50 text-red-500 border border-red-100";
}

export function JobCard({
  id, title, company, location, match, tags, profileId,
  isApplied, status, salaryRange, description, modalidad, isUrgent,
  onHide, isHidden, onVerDetalle
}: any) {
  const { t } = useLanguage();
  const { content, isTranslating } = useTranslatedContent({ title, company, description: description || "" });
  const [isLoading, setIsLoading] = useState(false);
  const [applied,   setApplied]   = useState(isApplied);

  const handleApply = async () => {
    if (!profileId) return alert("Error: Perfil no encontrado.");
    setIsLoading(true);
    const result = await applyToVacancy(id, profileId);
    setIsLoading(false);
    if (result.success) {
      setApplied(true);
    } else {
      alert(result.error);
    }
  };

  const statusConfig = status ? STATUS_CONFIG[status] || STATUS_CONFIG["POSTULADO"] : null;
  const esVacante = match !== null && match !== undefined;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">

      {/* FILA SUPERIOR */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          {esVacante ? (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isUrgent ? "bg-red-100 text-red-600" : "bg-[#7FFFD4]/30 text-[#2D8A75]"
            }`}>
              {isUrgent ? t.urgent : t.open}
            </span>
          ) : (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig?.color || "bg-gray-100 text-gray-600"}`}>
              {statusConfig?.label || "Postulado"}
            </span>
          )}
          {esVacante && match > 0 && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMatchColor(match)}`}>
              {match}% Match
            </span>
          )}
        </div>
        {onHide && (
          <button onClick={onHide} title={isHidden ? "Mostrar" : "Ocultar"}
            className="text-gray-300 hover:text-gray-500 transition-colors">
            {isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* TÍTULO Y EMPRESA */}
      <div>
        <h3 className="text-lg font-bold text-black leading-tight">{content.title || title}</h3>
        <p className="text-gray-500 text-sm mt-0.5">{content.company || company}</p>
      </div>

      {/* UBICACIÓN Y MODALIDAD */}
      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-[#5FD3BC]" /> {location}
        </span>
        {modalidad && (
          <span className="flex items-center gap-1">
            <Monitor className="w-4 h-4 text-[#5FD3BC]" /> {modalidad}
          </span>
        )}
      </div>

      {/* SALARIO */}
      {salaryRange && (
        <div className="flex items-center gap-1 text-sm text-gray-600 font-medium">
          <DollarSign className="w-4 h-4 text-[#5FD3BC]" /> {salaryRange}
        </div>
      )}

      {/* DESCRIPCIÓN (preview) */}
      {content.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{isTranslating ? `${t.loading}...` : content.description}</p>
      )}

      {/* TAGS */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* BOTONES */}
      <div className="flex gap-2 mt-auto">
        {onVerDetalle && (
          <button type="button" onClick={onVerDetalle}
            className="flex-1 h-11 rounded-xl font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-sm">
            {t.viewDetail}
          </button>
        )}
        <button
          onClick={handleApply}
          disabled={isLoading || applied}
          style={!applied ? { background: "linear-gradient(to right, #7FFFD4, #98FF98)" } : {}}
          className={`flex-1 flex justify-center items-center font-bold rounded-xl h-11 transition-all text-sm ${
            applied ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-black hover:opacity-90"
          }`}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : applied ? `${t.applied}` : t.applyNow}
        </button>
      </div>
    </div>
  );
}