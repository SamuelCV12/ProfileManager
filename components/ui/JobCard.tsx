// components/ui/JobCard.tsx
"use client"; // <-- Esto permite usar interactividad (clics y estados)

import { useState } from "react";
import { MapPin, EyeOff, Loader2 } from "lucide-react";
import { applyToVacancy } from "../../app/actions/apply";

export function JobCard({ id, title, company, location, match, tags, profileId, isApplied }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [applied, setApplied] = useState(isApplied); // Controla si ya se postuló

  const handleApply = async () => {
    if (!profileId) return alert("Error: Perfil no encontrado.");
    
    setIsLoading(true);
    const result = await applyToVacancy(id, profileId);
    setIsLoading(false);

    if (result.success) {
      setApplied(true);
      alert("¡Te has postulado exitosamente!"); 
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 rounded-full text-xs bg-[#7FFFD4]/20 text-[#2D8A75] font-bold">
          {match ? `${match}% Match` : "Postulado"}
        </span>
        <EyeOff className="w-5 h-5 text-gray-300 cursor-pointer hover:text-gray-500" />
      </div>
      
      <h3 className="text-xl font-bold text-black mb-1">{title}</h3>
      <p className="text-gray-500 text-sm mb-4">{company}</p>
      
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
        <MapPin className="w-4 h-4 text-[#5FD3BC]" /> {location}
      </div>

      {/* BOTÓN INTERACTIVO */}
      <button 
        onClick={handleApply}
        disabled={isLoading || applied}
        className={`w-full flex justify-center items-center font-bold rounded-xl h-11 transition-colors ${
          applied 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-[#7FFFD4] text-black hover:bg-[#5FD3BC]"
        }`}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : applied ? "Postulado ✓" : "Postularme"}
      </button>
    </div>
  );
}