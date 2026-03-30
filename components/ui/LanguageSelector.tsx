// components/ui/LanguageSelector.tsx
"use client";

/**
 * LanguageSelector.tsx
 * Componente de selector de idioma para la aplicación. Permite a los usuarios elegir entre varios idiomas disponibles (español, inglés, francés) y muestra el idioma seleccionado en el botón. Al hacer clic en el botón, se despliega un menú con las opciones de idioma, y al seleccionar una opción, se actualiza el estado del idioma seleccionado y se cierra el menú.
 *  Este componente utiliza el hook useState para manejar el estado del idioma seleccionado y si el menú está abierto o cerrado, y useRef junto con useEffect para detectar clics fuera del componente y cerrar el menú automáticamente. Además, se utilizan íconos de lucide-react para mejorar la apariencia del selector de idioma.
 */

import { useState, useRef, useEffect } from "react"; // Importamos los hooks necesarios de React para manejar el estado y las referencias del componente
import { Languages, ChevronDown, Check } from "lucide-react"; // Importamos íconos de lucide-react para mejorar la apariencia del selector de idioma

const LANGUAGES = [ 
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export default function LanguageSelector() { // Exportamos el componente LanguageSelector como el valor predeterminado del módulo
  const [selectedLang, setSelectedLang] = useState("es"); // Inicializamos el estado selectedLang con el código del idioma predeterminado (español) y setSelectedLang como la función para actualizar ese estado
  const [open, setOpen] = useState(false); // Inicializamos el estado open para controlar si el menú de selección de idioma está abierto o cerrado, y setOpen como la función para actualizar ese estado
  const ref = useRef<HTMLDivElement>(null); // Creamos una referencia con useRef para el contenedor del selector de idioma, lo que nos permitirá detectar clics fuera de este contenedor y cerrar el menú automáticamente

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang)!; // Encontramos el objeto del idioma actualmente seleccionado en el array LANGUAGES utilizando el código almacenado en selectedLang, y lo asignamos a currentLang para mostrar su etiqueta en el botón del selector

  useEffect(() => { // Utilizamos useEffect para agregar un event listener que detecta clics fuera del componente y cierra el menú de selección de idioma si está abierto
    function handleClickOutside(e: MouseEvent) { // Definimos la función handleClickOutside que se ejecutará cada vez que se haga clic en cualquier parte del documento
      if (ref.current && !ref.current.contains(e.target as Node)) { // Verificamos si el clic se realizó fuera del contenedor del selector de idioma utilizando la referencia ref. Si el clic no está dentro del contenedor, significa que el usuario hizo clic fuera del selector.
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside); // Agregamos el event listener para detectar clics en el documento y llamar a handleClickOutside cada vez que se haga clic
    return () => document.removeEventListener("mousedown", handleClickOutside); // Limpiamos el event listener cuando el componente se desmonte para evitar fugas de memoria
  }, []);

  return (
    <div className="relative" ref={ref}> 
      <button
        type="button"
        onClick={() => setOpen((v) => !v)} 
        className="flex items-center gap-2 border border-black/20 bg-white/60 hover:bg-white/80 transition-colors rounded-lg px-3 py-1.5 text-sm font-medium text-black"
      >
        <Languages className="w-4 h-4" />
        {currentLang.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {LANGUAGES.map((lang) => ( // Iteramos sobre el array LANGUAGES para renderizar un botón para cada idioma disponible en el menú desplegable
            <button
              key={lang.code} // Asignamos una key única a cada botón de idioma utilizando el código del idioma
              type="button"
              onClick={() => { setSelectedLang(lang.code); setOpen(false); }} // Al seleccionar un idioma, actualizamos el estado selectedLang con el código del idioma seleccionado y cerramos el menú estableciendo open en false
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-black hover:bg-gray-50 transition-colors"
            >
              {lang.label}
              {selectedLang === lang.code && <Check className="w-4 h-4 text-[#5FD3BC]" />} 
            </button>
          ))}
        </div>
      )}
    </div>
  );
}