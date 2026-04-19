"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { JobCard } from "../../components/ui/JobCard";
import { ApplicationCard } from "../../components/ui/ApplicationCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import LanguageSelector from "../../components/ui/LanguageSelector";
import LogoutButton from "../../components/ui/LogoutButton";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ClientDashboard({ profile, vacantes, postulaciones }: any) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState<string>("todas");
  const [filtroSalarioMin, setFiltroSalarioMin] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ocultasIds, setOcultasIds] = useState<Set<string>>(new Set());

  // --- Lógica de Auto-Postulación (100% Match) ---
  useEffect(() => {
    const autoPostular = async () => {
      const perfectMatches = vacantes.filter(
        (job: any) => job.matchScore === 100 && !job.isApplied
      );

      for (const job of perfectMatches) {
        console.log(`Auto-postulando a: ${job.title} en ${job.company}`);
        // Aquí llamarías a tu API de postulación
        // await fetch('/api/postulate', { method: 'POST', body: JSON.stringify({ jobId: job.id, profileId: profile.id }) });
      }
    };

    if (vacantes.length > 0) autoPostular();
  }, [vacantes, profile?.id]);

  const toggleOcultar = (id: string) => {
    setOcultasIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // --- Lógica de Filtrado (Mínimo 70% de Match) ---
  const vacantesFiltradas = vacantes.filter((job: any) => {
    // 1. Filtro base de compatibilidad >= 70%
    if (job.matchScore < 70) return false;
    
    // 2. Otros filtros existentes
    if (ocultasIds.has(job.id)) return false;
    if (busqueda && !job.title.toLowerCase().includes(busqueda.toLowerCase()) && !job.company.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroModalidad !== "todas" && job.modalidad !== filtroModalidad) return false;
    if (filtroSalarioMin && job.salarioMin < parseInt(filtroSalarioMin)) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="py-4 px-6 flex justify-between items-center shadow-sm">
        <h2 className="text-2xl font-black text-black tracking-tight">ProfileManager</h2>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link href="/profile" 
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-black border border-gray-100 hover:scale-105 transition-all overflow-hidden">
            {profile?.avatarUrl
              ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              : <span className="text-sm font-bold">{profile?.firstName?.charAt(0) || "U"}</span>}
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-black leading-tight">
                Bienvenido de nuevo{profile?.firstName ? `, ${profile.firstName}` : ""}
              </h1>
              <p className="text-gray-600 font-medium text-lg mt-1">
                Mostrando las mejores vacantes para tu perfil (70%+ compatibilidad)
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input type="text" placeholder="Buscar por puesto o empresa..." value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl text-black" />
              </div>
              <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="h-12 border-gray-200 text-gray-700 rounded-xl px-6 font-semibold">
                <SlidersHorizontal className="w-5 h-5 mr-2" /> Filtros
              </Button>
            </div>

            {mostrarFiltros && (
              <Card className="border-gray-100 bg-white rounded-2xl shadow-sm animate-in fade-in duration-200">
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>

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
                <JobCard key={job.id} id={job.id} profileId={profile?.id}
                  title={job.title} company={job.company} location={job.location}
                  match={job.matchScore} tags={job.mustHave} isApplied={job.isApplied}
                  salaryRange={formatCurrency(job.salarioMin)}
                  description={job.description}
                  modalidad={job.modalidad} isUrgent={job.isUrgent} isActive={job.isActive}
                  onHide={() => toggleOcultar(job.id)} />
              ))}
            </div>
            {vacantesFiltradas.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                No hay vacantes con más del 70% de compatibilidad en este momento.
              </div>
            )}
          </TabsContent>

          <TabsContent value="postulaciones">
            <div className="flex flex-col gap-4">
              {postulaciones.map((app: any) => (
                <ApplicationCard key={app.id}
                  title={app.vacancy.title} company={app.vacancy.company.name}
                  location={app.vacancy.company.location} modalidad={app.vacancy.modality}
                  salaryRange={formatCurrency(app.vacancy.salaryRange)}
                  status={app.status}
                  isActive={app.vacancy.isActive}
                  appliedAt={app.appliedAt} interviewDate={app.interviewDate} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full py-4 text-center text-sm text-black/70 font-medium mt-auto">
        © 2026 ProfileManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}