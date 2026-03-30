// components/ui/JobCard.tsx
"use client";

/**
 * JobCard.tsx
 * 
 * Componente de tarjeta de trabajo que muestra información relevante sobre una vacante, como el título, la empresa, la ubicación, el porcentaje de match con el perfil del usuario, etiquetas relacionadas, y un botón para postularse. También maneja diferentes estados de la vacante (abierta, urgente) y el estado de la postulación (postulado, en revisión, entrevista agendada, rechazado). El componente utiliza íconos de lucide-react para mejorar la apariencia y proporciona retroalimentación visual al usuario sobre el estado de su postulación.
 * 
 * Este componente es utilizado tanto en la sección de búsqueda de vacantes como en el dashboard del usuario para mostrar las vacantes a las que se ha postulado.
 * 
 */

import { useState } from "react"; // Importamos useState para manejar el estado de la aplicación dentro del componente
import { MapPin, EyeOff, Eye, Loader2, Monitor, DollarSign } from "lucide-react"; // Importamos íconos de lucide-react para mejorar la apariencia de la tarjeta de trabajo
import { applyToVacancy } from "../../app/actions/apply"; // Importamos la función applyToVacancy que se encargará de manejar la lógica de postulación a una vacante en el servidor

const STATUS_CONFIG: Record<string, { label: string; color: string }> = { // Configuración para los diferentes estados de postulación, cada uno con una etiqueta y un color específico para mostrar en la tarjeta
  POSTULADO:   { label: "Postulado",           color: "bg-blue-50 text-blue-700" },
  EN_REVISION: { label: "En Revisión",         color: "bg-yellow-50 text-yellow-700" },
  ENTREVISTA:  { label: "Entrevista Agendada", color: "bg-purple-50 text-purple-700" },
  RECHAZADO:   { label: "Rechazado",           color: "bg-red-50 text-red-700" },
};

function getMatchColor(match: number) { // Función que devuelve una clase de color basada en el porcentaje de match, para proporcionar retroalimentación visual sobre qué tan bien se ajusta el perfil del usuario a la vacante
  if (match >= 80) return "bg-[#7FFFD4]/40 text-[#1a7a65] border border-[#5FD3BC]/40";
  if (match >= 50) return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  return "bg-red-50 text-red-500 border border-red-100";
}

export function JobCard({ // Recibimos las props necesarias para mostrar la información de la vacante y manejar la lógica de postulación
  id, title, company, location, match, tags, profileId, 
  isApplied, status, salaryRange, description, modalidad, isUrgent,
  onHide, isHidden
}: any) { // Aquí se podrían definir tipos más específicos para las props en lugar de usar "any" para mayor seguridad de tipo.
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga al postularse a una vacante, lo que permite mostrar un spinner de carga y deshabilitar el botón mientras se procesa la postulación
  const [applied, setApplied] = useState(isApplied); // Estado para manejar si el usuario ya se ha postulado a la vacante, lo que permite cambiar el texto y estilo del botón de postulación

  const handleApply = async () => { // Función que se ejecuta al hacer clic en el botón de postulación, maneja la lógica de postulación a la vacante utilizando la función applyToVacancy y proporciona retroalimentación al usuario sobre el resultado de la postulación
    if (!profileId) return alert("Error: Perfil no encontrado."); // Si no se encuentra el ID del perfil, mostramos una alerta de error y no procedemos con la postulación
    setIsLoading(true); // Establecemos el estado de carga en true para mostrar el spinner de carga en el botón y deshabilitarlo mientras se procesa la postulación
    const result = await applyToVacancy(id, profileId); // Llamamos a la función applyToVacancy con el ID de la vacante y el ID del perfil para procesar la postulación en el servidor, y almacenamos el resultado en la variable result
    setIsLoading(false);
    if (result.success) {
      setApplied(true);
      alert("¡Te has postulado exitosamente!");
    } else {
      alert(result.error);
    }
  };

  const statusConfig = status ? STATUS_CONFIG[status] || STATUS_CONFIG["POSTULADO"] : null; // Obtenemos la configuración de estado basada en el estado de postulación recibido en las props, o null si no hay estado. Esto nos permite mostrar la etiqueta y el color correspondientes al estado de postulación del usuario para esta vacante.
  const esVacante = match !== null && match !== undefined;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
      
      {/* FILA SUPERIOR: badges + ocultar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {esVacante ? (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isUrgent ? "bg-red-100 text-red-600" : "bg-[#7FFFD4]/30 text-[#2D8A75]"
            }`}>
              {isUrgent ? "Urgente" : "Abierta"}
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

        {/* ✅ Botón ocultar/mostrar — solo en vacantes */}
        {onHide && (
          <button
            onClick={onHide}
            title={isHidden ? "Mostrar vacante" : "Ocultar vacante"}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            {isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* TÍTULO Y EMPRESA */}
      <div>
        <h3 className="text-lg font-bold text-black leading-tight">{title}</h3>
        <p className="text-gray-500 text-sm mt-0.5">{company}</p>
      </div>

      {/* UBICACIÓN Y MODALIDAD */}
      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-[#5FD3BC]" /> {location}
        </span>
        {modalidad && (
          <span className="flex items-center gap-1">
            <Monitor className="w-4 h-4 text-[#5FD3BC]" /> {modalidad} • Tiempo completo
          </span>
        )}
      </div>

      {/* SALARIO */}
      {salaryRange && (
        <div className="flex items-center gap-1 text-sm text-gray-600 font-medium">
          <DollarSign className="w-4 h-4 text-[#5FD3BC]" /> {salaryRange}
        </div>
      )}

      {/* DESCRIPCIÓN */}
      {description && (
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
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

      {/* BOTÓN */}
      <button
        onClick={handleApply}
        disabled={isLoading || applied}
        style={!applied ? { background: "linear-gradient(to right, #7FFFD4, #98FF98)" } : {}}
        className={`w-full flex justify-center items-center font-bold rounded-xl h-11 transition-all mt-auto ${
          applied
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "text-black hover:opacity-90"
        }`}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : applied ? "Postulado ✓" : "Postularme"}
      </button>
    </div>
  );
}