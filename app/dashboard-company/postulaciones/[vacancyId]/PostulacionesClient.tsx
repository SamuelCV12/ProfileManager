"use client";

// app/dashboard-company/postulaciones/[vacancyId]/PostulacionesClient.tsx

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Search, SlidersHorizontal, Mail, Phone,
  MapPin, X, ChevronDown, Eye, GraduationCap, Briefcase,
} from "lucide-react";
import { toast } from "sonner";

import { Button }   from "../../../../components/ui/button";
import { Input }    from "../../../../components/ui/input";
import { Label }    from "../../../../components/ui/label";
import { Badge }    from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../../components/ui/dialog";
import { updateApplicationStatus } from "../../../actions/apply";
import LanguageSelector from "../../../../components/ui/LanguageSelector";
import LogoutButton     from "../../../../components/ui/LogoutButton";

// ─── types ───────────────────────────────────────────────────────────────────

interface Candidato {
  id: string; nombre: string; email: string; telefono: string;
  cargo: string; ubicacion: string; resumen: string;
  habilidades: string[]; experiencia: string; educacion: string;
  disponibilidad: "Inmediata" | "2 semanas" | "1 mes";
}

interface Postulacion {
  id: string; status: string; appliedAt: string; candidato: Candidato;
}

// ─── config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; pill: string; select: string }> = {
  POSTULADO:   { label: "Postulado",           pill: "bg-blue-50 text-blue-700 border-blue-200",     select: "text-blue-700" },
  EN_REVISION: { label: "En Revisión",         pill: "bg-yellow-50 text-yellow-700 border-yellow-200", select: "text-yellow-700" },
  ENTREVISTA:  { label: "Entrevista Agendada", pill: "bg-purple-50 text-purple-700 border-purple-200", select: "text-purple-700" },
  RECHAZADO:   { label: "Rechazado",           pill: "bg-red-50 text-red-700 border-red-200",         select: "text-red-500" },
};

function parseField(raw: string): string {
  if (!raw || !raw.includes(" | ")) return raw || "—";
  return raw.split(" | ").filter(Boolean).join(" · ");
}

function initials(nombre: string) {
  return nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── component ───────────────────────────────────────────────────────────────

export default function PostulacionesClient({
  vacancyId, vacancyTitle, vacancyDescription,
  vacancyModalidad, vacancySalaryRange, vacancyMustHave,
  companyInitials, postulaciones: postulacionesIniciales,
}: {
  vacancyId: string; vacancyTitle: string; vacancyDescription: string;
  vacancyModalidad: string; vacancySalaryRange: string | null;
  vacancyMustHave: string[]; companyInitials: string;
  postulaciones: Postulacion[];
}) {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>(postulacionesIniciales);

  // filtros
  const [busqueda, setBusqueda]           = useState("");
  const [filtroEstado, setFiltroEstado]   = useState("todos");
  const [filtroHabilidad, setFiltroHabilidad] = useState("todas");
  const [mostrarFiltros, setMostrarFiltros]   = useState(false);

  // modal candidato
  const [candidatoModal, setCandidatoModal]       = useState<Candidato | null>(null);
  const [mostrarModalCandidato, setMostrarModalCandidato] = useState(false);

  // habilidades únicas para el filtro
  const habilidadesUnicas = Array.from(
    new Set(postulaciones.flatMap(p => p.candidato.habilidades))
  ).sort();

  // filtrado
  const postulacionesFiltradas = postulaciones.filter(p => {
    const q = busqueda.toLowerCase();
    if (q && !p.candidato.nombre.toLowerCase().includes(q) && !p.candidato.email.toLowerCase().includes(q)) return false;
    if (filtroEstado !== "todos" && p.status !== filtroEstado) return false;
    if (filtroHabilidad !== "todas" && !p.candidato.habilidades.includes(filtroHabilidad)) return false;
    return true;
  });

  const hayFiltrosActivos = filtroEstado !== "todos" || filtroHabilidad !== "todas" || busqueda !== "";

  const handleCambiarEstado = async (applicationId: string, nuevoEstado: string) => {
    const result = await updateApplicationStatus(applicationId, nuevoEstado);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Estado actualizado.");
    setPostulaciones(prev =>
      prev.map(p => p.id === applicationId ? { ...p, status: nuevoEstado } : p)
    );
  };

  // resumen por estado
  const resumen = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key, label: cfg.label, pill: cfg.pill,
    count: postulaciones.filter(p => p.status === key).length,
  })).filter(r => r.count > 0);

  return (
    <div className="min-h-screen bg-[#f8faf9] text-black flex flex-col">

      {/* ── HEADER ── */}
      <header
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="py-4 px-6 flex justify-between items-center shadow-sm"
      >
        <h2 className="text-2xl font-black text-black tracking-tight">ProfileManager</h2>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link href="/profile-company" title="Perfil de empresa"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-black border border-gray-100 hover:scale-105 transition-all">
            {companyInitials}
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">

        {/* ── BACK + TÍTULO ── */}
        <div className="mb-8">
          <Link href="/dashboard-company"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-5 font-medium">
            <ArrowLeft className="w-4 h-4" /> Volver al panel
          </Link>

          {/* info de la vacante */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black mb-1">{vacancyTitle}</h1>
                <p className="text-gray-500 text-sm mb-4">{vacancyDescription}</p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                    {vacancyModalidad}
                  </span>
                  {vacancySalaryRange && (
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                      {vacancySalaryRange}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-[#7FFFD4]/20 px-3 py-1.5 rounded-lg font-semibold text-[#1a7a65]">
                    {postulaciones.length} postulacion{postulaciones.length !== 1 ? "es" : ""}
                  </span>
                </div>
              </div>

              {/* must have skills */}
              {vacancyMustHave.length > 0 && (
                <div className="shrink-0">
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Skills requeridas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vacancyMustHave.map((s, i) => (
                      <Badge key={i} variant="outline" className="bg-[#7FFFD4]/20 text-black border-[#5FD3BC] text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── resumen de estados ── */}
          {resumen.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {resumen.map(r => (
                <button
                  key={r.key}
                  onClick={() => setFiltroEstado(filtroEstado === r.key ? "todos" : r.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${r.pill} ${filtroEstado === r.key ? "ring-2 ring-offset-1 ring-black/10 scale-105" : "opacity-80 hover:opacity-100"}`}
                >
                  {r.label}: {r.count}
                </button>
              ))}
            </div>
          )}

          {/* ── barra búsqueda + filtros ── */}
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="pl-12 h-12 border-gray-200 bg-white text-black rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(v => !v)}
              className={`h-12 border-gray-200 rounded-xl px-5 font-semibold gap-2 transition-all ${mostrarFiltros ? "bg-black text-white border-black" : "text-gray-700"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              <ChevronDown className={`w-3 h-3 transition-transform ${mostrarFiltros ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* panel filtros */}
          {mostrarFiltros && (
            <Card className="border-gray-100 bg-white rounded-2xl shadow-sm mb-4">
              <CardContent className="pt-5 pb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-black font-semibold text-sm">Estado de postulación</Label>
                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                      <SelectTrigger className="border-gray-200 h-11 bg-white text-black rounded-xl">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="POSTULADO">Postulado</SelectItem>
                        <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                        <SelectItem value="ENTREVISTA">Entrevista Agendada</SelectItem>
                        <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold text-sm">Habilidad del candidato</Label>
                    <Select value={filtroHabilidad} onValueChange={setFiltroHabilidad}>
                      <SelectTrigger className="border-gray-200 h-11 bg-white text-black rounded-xl">
                        <SelectValue placeholder="Todas las habilidades" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="todas">Todas las habilidades</SelectItem>
                        {habilidadesUnicas.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {hayFiltrosActivos && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" onClick={() => { setFiltroEstado("todos"); setFiltroHabilidad("todas"); setBusqueda(""); }}
                      className="text-gray-400 hover:text-gray-700 text-sm h-8 gap-1">
                      <X className="w-3 h-3" /> Limpiar filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── GRID DE CANDIDATOS ── */}
        {postulacionesFiltradas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">
              {postulaciones.length === 0
                ? "Aún no hay postulaciones para este cargo."
                : "Ningún candidato coincide con los filtros aplicados."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {postulacionesFiltradas.map((p, idx) => {
              const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG["POSTULADO"];
              const c = p.candidato;
              const matchingSkills = c.habilidades.filter(h => vacancyMustHave.includes(h));
              const otherSkills    = c.habilidades.filter(h => !vacancyMustHave.includes(h));
              const matchPct = vacancyMustHave.length > 0
                ? Math.round((matchingSkills.length / vacancyMustHave.length) * 100)
                : null;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* cabecera candidato */}
                  <div className="p-5 pb-4 flex items-start gap-3 border-b border-gray-50">
                    <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/50 flex items-center justify-center font-bold text-black text-sm shrink-0">
                      {initials(c.nombre)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-black truncate">{c.nombre}</p>
                      <p className="text-xs text-gray-400 truncate">{c.cargo}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.pill}`}>
                          {cfg.label}
                        </span>
                        {matchPct !== null && (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            matchPct >= 80 ? "bg-[#7FFFD4]/30 text-[#1a7a65] border-[#5FD3BC]/40"
                            : matchPct >= 50 ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-500 border-red-100"
                          }`}>
                            {matchPct}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* cuerpo */}
                  <div className="p-5 space-y-3 flex-1">
                    {/* skills */}
                    <div className="flex flex-wrap gap-1.5">
                      {matchingSkills.slice(0, 4).map((h, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#7FFFD4]/25 text-[#1a7a65] rounded-full text-xs font-medium">
                          ✓ {h}
                        </span>
                      ))}
                      {otherSkills.slice(0, 2).map((h, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                          {h}
                        </span>
                      ))}
                      {c.habilidades.length > 6 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs">
                          +{c.habilidades.length - 6}
                        </span>
                      )}
                    </div>

                    {/* info */}
                    <div className="space-y-1.5 text-xs text-gray-500">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5FD3BC] shrink-0" /> {c.ubicacion}
                      </p>
                      {c.experiencia && c.experiencia !== "Sin experiencia registrada" && (
                        <p className="flex items-start gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-[#5FD3BC] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{parseField(c.experiencia)}</span>
                        </p>
                      )}
                      {c.educacion && c.educacion !== "Sin educación registrada" && (
                        <p className="flex items-start gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#5FD3BC] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{parseField(c.educacion)}</span>
                        </p>
                      )}
                    </div>

                    {/* fecha */}
                    <p className="text-xs text-gray-300">
                      Aplicó el {new Date(p.appliedAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>

                  {/* footer acciones */}
                  <div className="p-4 pt-0 space-y-2">
                    {/* selector de estado */}
                    <Select value={p.status} onValueChange={val => handleCambiarEstado(p.id, val)}>
                      <SelectTrigger className={`border h-9 bg-white text-xs rounded-xl font-semibold w-full ${cfg.pill}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="POSTULADO">Postulado</SelectItem>
                        <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                        <SelectItem value="ENTREVISTA">Entrevista Agendada</SelectItem>
                        <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-gray-600 rounded-xl h-9 text-xs"
                        onClick={() => { setCandidatoModal(c); setMostrarModalCandidato(true); }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Ver perfil
                      </Button>
                      <button
                        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                        className="h-9 rounded-xl font-bold text-black text-xs hover:opacity-90 transition-opacity"
                        onClick={() => window.location.href = `mailto:${c.email}`}
                      >
                        Contactar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          MODAL — PERFIL COMPLETO CANDIDATO
      ══════════════════════════════════════════════ */}
      <Dialog open={mostrarModalCandidato} onOpenChange={setMostrarModalCandidato}>
        <DialogContent className="max-w-md bg-white text-black border-gray-100 max-h-[90vh] overflow-y-auto">
          {candidatoModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/50 flex items-center justify-center text-lg font-bold text-black shrink-0">
                    {initials(candidatoModal.nombre)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">{candidatoModal.nombre}</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">{candidatoModal.cargo}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {candidatoModal.resumen && (
                  <div>
                    <h4 className="font-bold text-black mb-1">Resumen Profesional</h4>
                    <p className="text-sm text-gray-600">{candidatoModal.resumen}</p>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div>
                  <h4 className="font-bold text-black mb-2">Información de Contacto</h4>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#5FD3BC]" />{candidatoModal.email}</p>
                    {candidatoModal.telefono !== "No registrado" && (
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#5FD3BC]" />{candidatoModal.telefono}</p>
                    )}
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#5FD3BC]" />{candidatoModal.ubicacion}</p>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div>
                  <h4 className="font-bold text-black mb-2">Experiencia y Formación</h4>
                  {candidatoModal.experiencia && candidatoModal.experiencia !== "Sin experiencia registrada" && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400 mb-0.5">Experiencia</p>
                      <p className="text-sm text-gray-700">{parseField(candidatoModal.experiencia)}</p>
                    </div>
                  )}
                  {candidatoModal.educacion && candidatoModal.educacion !== "Sin educación registrada" && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Educación</p>
                      <p className="text-sm text-gray-700">{parseField(candidatoModal.educacion)}</p>
                    </div>
                  )}
                </div>
                <hr className="border-gray-100" />
                {candidatoModal.habilidades.length > 0 && (
                  <div>
                    <h4 className="font-bold text-black mb-2">Habilidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidatoModal.habilidades.map((skill, i) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          vacancyMustHave.includes(skill)
                            ? "bg-[#7FFFD4]/25 text-[#1a7a65] border-[#5FD3BC]"
                            : "border-gray-200 text-gray-600"
                        }`}>
                          {vacancyMustHave.includes(skill) ? "✓ " : ""}{skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Disponibilidad</p>
                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
                    {candidatoModal.disponibilidad}
                  </span>
                </div>
                <button
                  style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                  className="w-full h-11 rounded-xl font-bold text-black hover:opacity-90 transition-opacity"
                  onClick={() => window.location.href = `mailto:${candidatoModal.email}`}
                >
                  Contactar Candidato
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── FOOTER ── */}
      <footer
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full py-4 text-center text-sm text-black/70 font-medium mt-8"
      >
        © 2026 ProfileManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}