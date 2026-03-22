// app/dashboard/ClientDashboard.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, LogOut, ChevronDown } from "lucide-react";
import { JobCard } from "../../components/ui/JobCard";
import { ApplicationCard } from "../../components/ui/ApplicationCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import LanguageSelector from "../../components/ui/LanguageSelector";

export default function ClientDashboard({ profile, vacantes, postulaciones }: any) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState<string>("todas");
  const [filtroSalarioMin, setFiltroSalarioMin] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ocultasIds, setOcultasIds] = useState<Set<string>>(new Set());
  const [mostrarOcultas, setMostrarOcultas] = useState(false);

  const toggleOcultar = (id: string) => {
    setOcultasIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const vacantesFiltradas = vacantes.filter((job: any) => {
    if (ocultasIds.has(job.id)) return false;
    if (busqueda &&
      !job.title.toLowerCase().includes(busqueda.toLowerCase()) &&
      !job.company.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroModalidad !== "todas" && job.modalidad !== filtroModalidad) return false;
    if (filtroSalarioMin && job.salarioMin < parseInt(filtroSalarioMin)) return false;
    return true;
  });

  const vacantesOcultas = vacantes.filter((job: any) => ocultasIds.has(job.id));

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">

      {/* ─── HEADER ─── */}
      <header
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="py-4 px-6 flex justify-between items-center shadow-sm"
      >
        <h2 className="text-2xl font-black text-black tracking-tight">ProfileManager</h2>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link href={`/profile?id=${profile?.id}`} title="Ir a mi perfil"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-black border border-gray-100 hover:scale-105 hover:bg-gray-50 transition-all cursor-pointer">
            {profile?.firstName?.charAt(0) || "U"}
          </Link>
          <Button variant="outline" onClick={() => router.push("/")}
            className="h-9 border-black/20 text-black font-semibold rounded-xl hover:bg-white/50 gap-2">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-black mb-2">
            Bienvenido de nuevo{profile?.firstName ? `, ${profile.firstName}` : ""}
          </h1>
          <p className="text-gray-600 mb-6 font-medium">Encuentra tu próxima oportunidad profesional</p>

          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 w-fit mb-8">
            <p className="text-sm font-medium text-gray-700">Tu perfil está al {profile?.completitud || 0}%</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#5FD3BC] transition-all duration-1000"
                style={{ width: `${profile?.completitud || 0}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input type="text" placeholder="Buscar por puesto o empresa..." value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl text-black focus:border-[#5FD3BC]" />
              </div>
              <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="h-12 border-gray-200 text-gray-700 rounded-xl px-6 font-semibold">
                <SlidersHorizontal className="w-5 h-5 mr-2" /> Filtros
              </Button>
            </div>

            {mostrarFiltros && (
              <Card className="border-gray-100 bg-white rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-black font-semibold">Modalidad</Label>
                      <Select value={filtroModalidad} onValueChange={setFiltroModalidad}>
                        <SelectTrigger className="w-full border-gray-200 h-11 bg-gray-50 text-black rounded-xl">
                          <SelectValue placeholder="Todas las modalidades" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="todas">Todas las modalidades</SelectItem>
                          <SelectItem value="Remoto">Remoto</SelectItem>
                          <SelectItem value="Presencial">Presencial</SelectItem>
                          <SelectItem value="Híbrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-black font-semibold">Salario mínimo (COP)</Label>
                      <Input type="number" placeholder="Ej: 5000000" value={filtroSalarioMin}
                        onChange={(e) => setFiltroSalarioMin(e.target.value)}
                        className="border-gray-200 h-11 bg-gray-50 text-black rounded-xl" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={() => { setFiltroModalidad("todas"); setFiltroSalarioMin(""); }}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl">
                      Limpiar filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ─── TABS ─── */}
        <Tabs defaultValue="vacantes" className="w-full">
          <TabsList className="mb-6 bg-transparent gap-4 h-auto p-0">
            <TabsTrigger value="vacantes"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#7FFFD4] data-[state=active]:text-black border border-gray-200 text-gray-500 transition-all font-bold">
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
                <JobCard key={job.id} id={job.id} profileId={profile?.id}
                  title={job.title} company={job.company} location={job.location}
                  match={job.matchScore} tags={job.mustHave} isApplied={job.isApplied}
                  salaryRange={job.salaryRange} description={job.description}
                  modalidad={job.modalidad} isUrgent={job.isUrgent}
                  onHide={() => toggleOcultar(job.id)} />
              ))}
              {vacantesFiltradas.length === 0 && (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No se encontraron vacantes con esos filtros.</p>
                </div>
              )}
            </div>

            {vacantesOcultas.length > 0 && (
              <div className="mt-10">
                <button onClick={() => setMostrarOcultas((v) => !v)}
                  className="flex items-center gap-2 text-gray-500 font-semibold text-sm hover:text-black transition-colors mb-4">
                  <ChevronDown className={`w-4 h-4 transition-transform ${mostrarOcultas ? "rotate-180" : ""}`} />
                  Vacantes Ocultas ({vacantesOcultas.length})
                </button>
                {mostrarOcultas && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                    {vacantesOcultas.map((job: any) => (
                      <JobCard key={job.id} id={job.id} profileId={profile?.id}
                        title={job.title} company={job.company} location={job.location}
                        match={job.matchScore} tags={job.mustHave} isApplied={job.isApplied}
                        salaryRange={job.salaryRange} description={job.description}
                        modalidad={job.modalidad} isUrgent={job.isUrgent}
                        isHidden={true} onHide={() => toggleOcultar(job.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="postulaciones">
            <div className="flex flex-col gap-4">
              {postulaciones.map((app: any) => (
                <ApplicationCard key={app.id}
                  title={app.vacancy.title} company={app.vacancy.company.name}
                  location={app.vacancy.company.location} modalidad={app.vacancy.modality}
                  salaryRange={app.vacancy.salaryRange} status={app.status}
                  appliedAt={app.appliedAt} interviewDate={app.interviewDate} />
              ))}
              {postulaciones.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">Aún no te has postulado a ninguna vacante.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full py-4 text-center text-sm text-black/70 font-medium mt-8">
        © 2026 ProfileManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}