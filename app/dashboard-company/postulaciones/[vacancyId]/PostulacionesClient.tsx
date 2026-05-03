"use client";

// app/dashboard-company/postulaciones/[vacancyId]/PostulacionesClient.tsx

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../../../context/LanguageContext";
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
  const { t } = useLanguage();
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
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-black border border-gray-100 uppercase">
            {companyInitials}
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">

        {/* ── BACK ── */}
        <Link href="/dashboard-company"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-5 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> {t.backToPanel}
        </Link>

        {/* info de la vacante */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black mb-1">{vacancyTitle}</h1>
              <p className="text-gray-500 text-sm mb-4">{vacancyDescription}</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg font-medium">
                  {vacancyModalidad}
                </span>
                {vacancySalaryRange && (
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg font-bold text-black">
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
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">{t.skillsRequired}</p>
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
              placeholder={t.searchCandidate}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-12 h-12 border-gray-200 bg-white text-black rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(v => !v)}
            className={`h-12 border-gray-200 rounded-xl px-5 font-semibold gap-2 transition-all ${mostrarFiltros ? "bg-black text-white border-black" : "text-gray-700 bg-white"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            <ChevronDown className={`w-3 h-3 transition-transform ${mostrarFiltros ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* panel filtros */}
        {mostrarFiltros && (
          <Card className="border-gray-100 bg-white rounded-2xl shadow-sm mb-4 animate-in fade-in slide-in-from-top-2">
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
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
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
              const matchPct = vacancyMustHave.length > 0
                ? Math.round((matchingSkills.length / vacancyMustHave.length) * 100)
                : null;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="p-5 pb-4 flex items-start gap-3 border-b border-gray-50">
                    <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/30 flex items-center justify-center font-bold text-black text-sm shrink-0">
                      {initials(c.nombre)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-black truncate">{c.nombre}</p>
                      <p className="text-xs text-gray-400 truncate">{c.cargo}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${cfg.pill}`}>
                          {cfg.label}
                        </span>
                        {matchPct !== null && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            matchPct >= 80 ? "bg-[#7FFFD4]/30 text-[#1a7a65] border-[#5FD3BC]/40"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}>
                            {matchPct}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {c.habilidades.slice(0, 3).map((h, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${vacancyMustHave.includes(h) ? 'bg-[#7FFFD4]/20 text-[#1a7a65]' : 'bg-gray-100 text-gray-500'}`}>
                          {h}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 text-[11px] text-gray-500">
                      <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#5FD3BC]" /> {c.ubicacion}</p>
                      <p className="flex items-center gap-1.5 truncate"><Briefcase className="w-3 h-3 text-[#5FD3BC]" /> {parseField(c.experiencia)}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 space-y-2 mt-auto">
                    <Select value={p.status} onValueChange={val => handleCambiarEstado(p.id, val)}>
                      <SelectTrigger className={`border h-9 bg-white text-xs rounded-xl font-semibold w-full ${cfg.pill}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-gray-600 rounded-xl h-9 text-xs"
                        onClick={() => { setCandidatoModal(c); setMostrarModalCandidato(true); }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Perfil
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

      {/* MODAL — PERFIL COMPLETO */}
      <Dialog open={mostrarModalCandidato} onOpenChange={setMostrarModalCandidato}>
        <DialogContent className="max-w-md bg-white text-black border-none rounded-3xl p-0 overflow-hidden shadow-2xl">
          {candidatoModal && (
            <div className="flex flex-col">
              <div className="h-20 bg-gradient-to-r from-[#7FFFD4] to-[#98FF98]" />
              <div className="px-6 pb-6">
                <div className="flex justify-between items-end -mt-8 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
                    <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center text-2xl font-black text-gray-300">
                      {initials(candidatoModal.nombre)}
                    </div>
                  </div>
                </div>

                <DialogHeader className="text-left mb-6">
                  <DialogTitle className="text-2xl font-black text-black">{candidatoModal.nombre}</DialogTitle>
                  <DialogDescription className="text-[#1a7a65] font-bold text-sm uppercase tracking-wider">{candidatoModal.cargo}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Mail className="w-4 h-4 text-gray-400" /></div>
                      {candidatoModal.email}
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Phone className="w-4 h-4 text-gray-400" /></div>
                      {candidatoModal.telefono}
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-5">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> Resumen
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{candidatoModal.resumen || "Sin descripción."}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest flex items-center gap-2">
                        <GraduationCap className="w-3 h-3" /> Educación
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">{parseField(candidatoModal.educacion)}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Habilidades</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {candidatoModal.habilidades.map((skill, i) => (
                          <Badge key={i} variant="outline" className={`text-[10px] font-bold ${vacancyMustHave.includes(skill) ? 'bg-[#7FFFD4]/20 border-[#5FD3BC] text-[#1a7a65]' : 'bg-white border-gray-100 text-gray-500'}`}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                    className="w-full h-12 rounded-xl font-black text-black hover:scale-[1.02] transition-all shadow-md mt-4"
                    onClick={() => window.location.href = `mailto:${candidatoModal.email}`}
                  >
                    CONTACTAR CANDIDATO
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="w-full py-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-auto border-t border-gray-100">
        © 2026 ProfileManager · Sistemas EAFIT
      </footer>
    </div>
  );
}