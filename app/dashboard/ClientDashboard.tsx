"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, MapPin, Monitor, DollarSign, CheckCircle2, Briefcase, X } from "lucide-react";
import { JobCard } from "../../components/ui/JobCard";
import { ApplicationCard } from "../../components/ui/ApplicationCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import LanguageSelector from "../../components/ui/LanguageSelector";
import LogoutButton from "../../components/ui/LogoutButton";
import { toast } from "sonner";
import { applyToVacancy } from "../../app/actions/apply";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

function getMatchColor(match: number) {
  if (match === 100) return "bg-[#7FFFD4] text-[#1a7a65] border border-[#5FD3BC]";
  if (match >= 80)   return "bg-[#7FFFD4]/40 text-[#1a7a65] border border-[#5FD3BC]/40";
  if (match >= 50)   return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  return "bg-red-50 text-red-500 border border-red-100";
}

function ProfileCompletionBanner({ profile }: { profile: any }) {
  const pct = profile?.completitud ?? 0;
  const getColor = () => {
    if (pct === 100) return "from-[#5FD3BC] to-[#7FFFD4]";
    if (pct >= 70)   return "from-[#7FFFD4] to-[#98FF98]";
    if (pct >= 40)   return "from-yellow-300 to-yellow-400";
    return "from-red-300 to-red-400";
  };
  const getMessage = () => {
    if (pct === 100) return "¡Perfil completo! Tienes más posibilidades de ser encontrado.";
    if (pct >= 70)   return "Buen progreso. Completa tu perfil para mejorar tus matches.";
    if (pct >= 40)   return "Tu perfil está incompleto. Agregar más info mejora tu visibilidad.";
    return "Perfil muy incompleto. Complétalo para empezar a recibir matches.";
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#7FFFD4]/30 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#2D8A75]" />
          </div>
          <span className="font-bold text-black text-sm">Completitud del Perfil</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-black">{pct}%</span>
          <Link href="/profile"
            className="text-xs font-bold px-3 py-1.5 rounded-lg text-black hover:opacity-80 transition-all"
            style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}>
            Completar
          </Link>
        </div>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-700 rounded-full`}
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">{getMessage()}</p>
    </div>
  );
}

export default function ClientDashboard({ profile, vacantes, postulaciones, autoPostuladas }: any) {
  const [busqueda,         setBusqueda]         = useState("");
  const [filtroModalidad,  setFiltroModalidad]  = useState<string>("todas");
  const [filtroSalarioMin, setFiltroSalarioMin] = useState<string>("");
  const [mostrarFiltros,   setMostrarFiltros]   = useState(false);
  const [ocultasIds,       setOcultasIds]       = useState<Set<string>>(new Set());
  const [matchMinimo,      setMatchMinimo]      = useState<number>(0);
  const [vacanteDetalle,   setVacanteDetalle]   = useState<any>(null);
  const [postuladas,       setPostuladas]       = useState<Set<string>>(
    new Set(vacantes.filter((v: any) => v.isApplied).map((v: any) => v.id))
  );

  // ── Notificación de auto-postulaciones ──
  useEffect(() => {
    if (autoPostuladas && autoPostuladas.length > 0) {
      autoPostuladas.forEach((title: string) => {
        toast.success(`¡Match perfecto! Te postulamos automáticamente a "${title}"`, {
          duration: 6000,
          icon: "🎯",
        });
      });
    }
  }, []);

  const toggleOcultar = (id: string) => {
    setOcultasIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApplyFromModal = async (vacancyId: string, vacancyTitle: string) => {
    if (!profile?.id) return;
    const result = await applyToVacancy(vacancyId, profile.id);
    if (result.success) {
      setPostuladas(prev => new Set(prev).add(vacancyId));
      toast.success(`¡Te postulaste a "${vacancyTitle}" exitosamente!`);
      setVacanteDetalle((prev: any) => prev ? { ...prev, isApplied: true } : prev);
    } else {
      toast.error(result.error || "Error al postularse");
    }
  };

  const vacantesFiltradas = vacantes.filter((job: any) => {
    if (ocultasIds.has(job.id))                                       return false;
    if (job.matchScore < matchMinimo)                                 return false;
    if (busqueda && !job.title.toLowerCase().includes(busqueda.toLowerCase()) &&
        !job.company.toLowerCase().includes(busqueda.toLowerCase()))  return false;
    if (filtroModalidad !== "todas" && job.modalidad !== filtroModalidad) return false;
    if (filtroSalarioMin && job.salarioMin < parseInt(filtroSalarioMin)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">

      {/* ── HEADER ── */}
      <header style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="py-4 px-6 flex justify-between items-center shadow-sm">
        <h2 className="text-2xl font-black text-black tracking-tight">ProfileManager</h2>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link href="/profile" className="transition-transform hover:scale-110">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-black border border-gray-100 overflow-hidden">
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                : <span className="text-sm font-bold">{profile?.firstName?.charAt(0)?.toUpperCase() || "U"}</span>}
            </div>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">

        {/* ── BIENVENIDA ── */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-black leading-tight">
            Bienvenido de nuevo{profile?.firstName ? `, ${profile.firstName}` : ""}
          </h1>
        </div>

        {/* ── BANNER COMPLETITUD ── */}
        <ProfileCompletionBanner profile={profile} />

        {/* ── BUSCADOR + FILTROS ── */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input type="text" placeholder="Buscar por puesto o empresa..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl text-black" />
            </div>
            <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="h-12 border-gray-200 text-gray-700 rounded-xl px-6 font-semibold">
              <SlidersHorizontal className="w-5 h-5 mr-2" /> Filtros
            </Button>
          </div>

          {mostrarFiltros && (
            <Card className="border-gray-100 bg-white rounded-2xl shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Slider match mínimo */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-black font-semibold">Match mínimo</Label>
                      <span className="text-lg font-black text-[#2D8A75]">{matchMinimo}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5}
                      value={matchMinimo}
                      onChange={e => setMatchMinimo(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "#5FD3BC" }} />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                  </div>

                  {/* Modalidad */}
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Modalidad</Label>
                    <Select value={filtroModalidad} onValueChange={setFiltroModalidad}>
                      <SelectTrigger className="w-full border-gray-200 h-11 bg-gray-50 text-black rounded-xl">
                        <SelectValue placeholder="Todas las modalidades" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="Remoto">Remoto</SelectItem>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                        <SelectItem value="Híbrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salario mínimo */}
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Salario mínimo (COP)</Label>
                    <Input type="number" placeholder="Ej: 5000000"
                      value={filtroSalarioMin} onChange={e => setFiltroSalarioMin(e.target.value)}
                      className="border-gray-200 h-11 bg-gray-50 text-black rounded-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── TABS ── */}
        <Tabs defaultValue="vacantes" className="w-full">
          <TabsList className="mb-6 bg-transparent gap-4 h-auto p-0">
            <TabsTrigger value="vacantes"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#7FFFD4] data-[state=active]:text-black border border-gray-200 text-gray-500 font-bold">
              Vacantes Recomendadas ({vacantesFiltradas.length})
            </TabsTrigger>
            <TabsTrigger value="postulaciones"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#7FFFD4] data-[state=active]:text-black border border-gray-200 text-gray-500 font-bold">
              Mis Postulaciones ({postulaciones.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vacantes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vacantesFiltradas.map((job: any) => (
                <JobCard key={job.id}
                  id={job.id} profileId={profile?.id}
                  title={job.title} company={job.company}
                  location={job.location} match={job.matchScore}
                  tags={job.mustHave}
                  isApplied={postuladas.has(job.id)}
                  salaryRange={job.salarioMin ? formatCurrency(job.salarioMin) : null}
                  description={job.description}
                  modalidad={job.modalidad}
                  isUrgent={job.isUrgent}
                  isActive={job.isActive}
                  onHide={() => toggleOcultar(job.id)}
                  onVerDetalle={() => setVacanteDetalle(job)}
                />
              ))}
            </div>
            {vacantesFiltradas.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No hay vacantes con ese nivel de compatibilidad.</p>
                <p className="text-sm mt-1">Prueba bajando el filtro de match mínimo.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="postulaciones">
            <div className="flex flex-col gap-4">
              {postulaciones.map((app: any) => (
                <ApplicationCard key={app.id}
                  title={app.vacancy.title}
                  company={app.vacancy.company.name}
                  location={app.vacancy.company.location}
                  modalidad={app.vacancy.modality}
                  salaryRange={app.vacancy.salaryRange ? formatCurrency(app.vacancy.salaryRange) : "No especificado"}
                  status={app.status}
                  isActive={app.vacancy.isActive}
                  appliedAt={app.appliedAt}
                  interviewDate={app.interviewDate} />
              ))}
              {postulaciones.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <p className="font-medium">Aún no te has postulado a ninguna vacante.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── MODAL DETALLE VACANTE ── */}
      <Dialog open={!!vacanteDetalle} onOpenChange={() => setVacanteDetalle(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
          {vacanteDetalle && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMatchColor(vacanteDetalle.matchScore)}`}>
                        {vacanteDetalle.matchScore}% Match
                      </span>
                      {vacanteDetalle.isUrgent && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">Urgente</span>
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        {vacanteDetalle.modalidad}
                      </span>
                    </div>
                    <DialogTitle className="text-2xl font-black text-black">
                      {vacanteDetalle.title}
                    </DialogTitle>
                    <p className="text-gray-500 font-medium mt-1">{vacanteDetalle.company}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 mt-2">

                {/* Info básica */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#5FD3BC] shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{vacanteDetalle.location}</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#5FD3BC] shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{vacanteDetalle.modalidad}</span>
                  </div>
                  {vacanteDetalle.salarioMin > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 col-span-2">
                      <DollarSign className="w-4 h-4 text-[#5FD3BC] shrink-0" />
                      <span className="text-sm text-gray-700 font-medium">
                        {formatCurrency(vacanteDetalle.salarioMin)} COP
                      </span>
                    </div>
                  )}
                </div>

                {/* Descripción completa */}
                <div>
                  <h4 className="font-bold text-black mb-2">Descripción del cargo</h4>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {vacanteDetalle.description}
                  </p>
                </div>

                {/* Requisitos must-have */}
                {vacanteDetalle.mustHave?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-black mb-2">Requisitos indispensables</h4>
                    <div className="flex flex-wrap gap-2">
                      {vacanteDetalle.mustHave.map((req: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-[#7FFFD4]/20 text-[#1a7a65] rounded-full text-sm font-medium border border-[#5FD3BC]/30">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón postular */}
                <button
                  onClick={() => handleApplyFromModal(vacanteDetalle.id, vacanteDetalle.title)}
                  disabled={postuladas.has(vacanteDetalle.id)}
                  style={!postuladas.has(vacanteDetalle.id) ? {
                    background: "linear-gradient(to right, #7FFFD4, #98FF98)"
                  } : {}}
                  className={`w-full h-12 rounded-xl font-bold text-black transition-all ${
                    postuladas.has(vacanteDetalle.id)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                >
                  {postuladas.has(vacanteDetalle.id) ? "Postulado ✓" : "Postularme a esta vacante"}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <footer style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full py-4 text-center text-sm text-black/70 font-medium mt-auto">
        © 2026 ProfileManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}