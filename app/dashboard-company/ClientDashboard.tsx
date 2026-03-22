"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Briefcase, MapPin, Eye, Star, Plus, LogOut, Users, GraduationCap, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { createVacancy, deleteVacancy } from "../actions/vacancy";
import { updateApplicationStatus } from "../actions/apply";
import LanguageSelector from "../../components/ui/LanguageSelector";

function parseExperience(raw: string): string {
  if (!raw.includes(" | ")) return raw;
  const parts = raw.split(" | ");
  return [parts[0], parts[1], parts[2]].filter(Boolean).join(" · ");
}

function parseEducation(raw: string): string {
  if (!raw.includes(" | ")) return raw;
  const parts = raw.split(" | ");
  return [parts[0], parts[1], parts[2]].filter(Boolean).join(" · ");
}

interface Candidato {
  id: string; nombre: string; cargo: string; ubicacion: string; experiencia: string;
  educacion: string; habilidades: string[]; salarioDeseado: number;
  disponibilidad: "Inmediata" | "2 semanas" | "1 mes"; resumen: string; email: string; telefono: string;
}

interface CargoDisponible {
  id: string; titulo: string; descripcion: string; salario: number; salaryRange: string | null;
  ubicacion: string; modalidad: "Remoto" | "Presencial" | "Híbrido";
  estado: "Activo" | "Pausado"; candidatosPostulados: number; mustHave: string[];
}

interface Postulacion {
  id: string; status: string; candidatoNombre: string; candidatoEmail: string;
  candidatoHabilidades: string[]; vacancyTitle: string; appliedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  POSTULADO:   { label: "Postulado",           color: "bg-blue-50 text-blue-700 border-blue-200" },
  EN_REVISION: { label: "En Revisión",         color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ENTREVISTA:  { label: "Entrevista Agendada", color: "bg-purple-50 text-purple-700 border-purple-200" },
  RECHAZADO:   { label: "Rechazado",           color: "bg-red-50 text-red-700 border-red-200" },
};

export default function ClientDashboard({ candidatosIniciales, cargosDisponiblesIniciales, postulacionesIniciales, companyId, companyName, companyInitials }: {
  candidatosIniciales: Candidato[];
  cargosDisponiblesIniciales: CargoDisponible[];
  postulacionesIniciales: Postulacion[];
  companyId: string;
  companyName: string;
  companyInitials: string;
}) {
  const router = useRouter();
  const [candidatos] = useState<Candidato[]>(candidatosIniciales);
  const [cargos, setCargos] = useState<CargoDisponible[]>(cargosDisponiblesIniciales);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>(postulacionesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroExperiencia, setFiltroExperiencia] = useState<string>("todos");
  const [filtroSalarioMax, setFiltroSalarioMax] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<Candidato | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalVacante, setMostrarModalVacante] = useState(false);
  const [cargoPostulacionesId, setCargoPostulacionesId] = useState<string | null>(null);
  const [nuevaVacante, setNuevaVacante] = useState({ title: "", description: "", modality: "Presencial", salaryRange: "", mustHave: "" });
  const [loadingVacante, setLoadingVacante] = useState(false);

  const candidatosFiltrados = candidatos.filter(candidato => {
    if (busqueda && !candidato.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !candidato.cargo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroExperiencia !== "todos") {
      const años = parseInt(candidato.experiencia.match(/\d+/)?.[0] || "0");
      if (filtroExperiencia === "junior" && años >= 3) return false;
      if (filtroExperiencia === "mid" && (años < 3 || años >= 6)) return false;
      if (filtroExperiencia === "senior" && años < 6) return false;
    }
    if (filtroSalarioMax && candidato.salarioDeseado > parseInt(filtroSalarioMax)) return false;
    return true;
  });

  const handleCrearVacante = async () => {
    if (!nuevaVacante.title || !nuevaVacante.description) { toast.error("El título y la descripción son obligatorios."); return; }
    setLoadingVacante(true);
    const mustHaveArray = nuevaVacante.mustHave.split(",").map(s => s.trim()).filter(s => s.length > 0);
    const result = await createVacancy({ companyId, title: nuevaVacante.title, description: nuevaVacante.description, modality: nuevaVacante.modality, salaryRange: nuevaVacante.salaryRange, mustHave: mustHaveArray });
    setLoadingVacante(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("¡Cargo publicado exitosamente!");
    setMostrarModalVacante(false);
    setNuevaVacante({ title: "", description: "", modality: "Presencial", salaryRange: "", mustHave: "" });
    router.refresh();
  };

  const handleEliminarVacante = async (vacancyId: string) => {
    const result = await deleteVacancy(vacancyId);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Cargo eliminado.");
    setCargos(prev => prev.filter(c => c.id !== vacancyId));
  };

  const handleCambiarEstado = async (applicationId: string, nuevoEstado: string) => {
    const result = await updateApplicationStatus(applicationId, nuevoEstado);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Estado actualizado.");
    setPostulaciones(prev => prev.map(p => p.id === applicationId ? { ...p, status: nuevoEstado } : p));
  };

  // Postulaciones del cargo seleccionado
  const postulacionesDeCargo = postulaciones.filter(p =>
    cargoPostulacionesId && cargos.find(c => c.id === cargoPostulacionesId)?.titulo === p.vacancyTitle
  );

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
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-black border border-gray-100">
            {companyInitials}
          </div>
          <Button variant="outline" onClick={() => router.push("/")} className="h-9 border-black/20 text-black font-semibold rounded-xl hover:bg-white/50 gap-2">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Panel de Empresa</h1>
          <p className="text-gray-600 mb-6 font-medium">Encuentra los mejores candidatos para tu empresa</p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input type="text" placeholder="Buscar por nombre o cargo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-12 h-12 border-gray-200 text-black rounded-xl" />
              </div>
              <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)} className="h-12 border-gray-200 text-gray-700 rounded-xl px-6 font-semibold">
                <SlidersHorizontal className="w-5 h-5 mr-2" /> Filtros
              </Button>
            </div>

            {mostrarFiltros && (
              <Card className="border-gray-100 bg-gray-50 rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-black font-semibold">Nivel de Experiencia</Label>
                      <Select value={filtroExperiencia} onValueChange={setFiltroExperiencia}>
                        <SelectTrigger className="border-gray-200 h-11 bg-white text-black rounded-xl"><SelectValue placeholder="Todos los niveles" /></SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="todos">Todos los niveles</SelectItem>
                          <SelectItem value="junior">Junior (0-2 años)</SelectItem>
                          <SelectItem value="mid">Mid (3-5 años)</SelectItem>
                          <SelectItem value="senior">Senior (6+ años)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-black font-semibold">Salario máximo (COP)</Label>
                      <Input type="number" placeholder="Ej: 10000000" value={filtroSalarioMax} onChange={(e) => setFiltroSalarioMax(e.target.value)} className="border-gray-200 h-11 bg-white text-black rounded-xl" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button variant="ghost" onClick={() => { setFiltroExperiencia("todos"); setFiltroSalarioMax(""); }} className="text-gray-500 hover:text-gray-800">Limpiar filtros</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ─── TABS — solo 2 ─── */}
        <Tabs defaultValue="candidatos" className="w-full">
          <TabsList className="mb-6 bg-transparent gap-4 h-auto p-0">
            <TabsTrigger value="candidatos" className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#7FFFD4] data-[state=active]:text-black border border-gray-200 text-gray-500 transition-all font-bold">
              Candidatos Recomendados ({candidatosFiltrados.length})
            </TabsTrigger>
            <TabsTrigger value="cargos" className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#7FFFD4] data-[state=active]:text-black border border-gray-200 text-gray-500 font-bold">
              Mis Cargos Disponibles ({cargos.length})
            </TabsTrigger>
          </TabsList>

          {/* ─── CANDIDATOS ─── */}
          <TabsContent value="candidatos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatosFiltrados.map((candidato) => (
                <Card key={candidato.id} className="border-gray-200 hover:shadow-lg transition-shadow rounded-2xl">
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-14 h-14 rounded-full bg-[#7FFFD4]/50 flex items-center justify-center text-lg text-black font-bold shrink-0">
                        {candidato.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-black">{candidato.nombre}</CardTitle>
                        <CardDescription className="text-gray-600 font-medium">{candidato.cargo}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">{candidato.disponibilidad}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-4">
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <MapPin className="w-4 h-4 text-[#5FD3BC] shrink-0" /> {candidato.ubicacion}
                    </div>
                    <div className="flex items-start text-sm text-gray-600 gap-2">
                      <Briefcase className="w-4 h-4 text-[#5FD3BC] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{parseExperience(candidato.experiencia)}</span>
                    </div>
                    <div className="flex items-start text-sm text-gray-600 gap-2">
                      <GraduationCap className="w-4 h-4 text-[#5FD3BC] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{parseEducation(candidato.educacion)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <Star className="w-4 h-4 text-[#5FD3BC] shrink-0" />
                      Salario deseado: ${candidato.salarioDeseado.toLocaleString()} COP
                    </div>
                    {candidato.habilidades.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {candidato.habilidades.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-gray-50">{skill}</Badge>
                        ))}
                        {candidato.habilidades.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50">+{candidato.habilidades.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <div className="px-6 pb-6 space-y-2">
                    <Button onClick={() => { setCandidatoSeleccionado(candidato); setMostrarModal(true); }}
                      variant="outline" className="w-full border-gray-200 text-gray-700 rounded-xl h-10">
                      <Eye className="w-4 h-4 mr-2" /> Ver Perfil Completo
                    </Button>
                    <button
                      style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                      className="w-full h-10 rounded-xl font-bold text-black hover:opacity-90 transition-opacity"
                      onClick={() => window.location.href = `mailto:${candidato.email}`}>
                      Contactar
                    </button>
                  </div>
                </Card>
              ))}
              {candidatosFiltrados.length === 0 && (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No hay candidatos registrados aún.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── CARGOS ─── */}
          <TabsContent value="cargos">
            <div className="flex justify-end mb-4">
              <button onClick={() => setMostrarModalVacante(true)}
                style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                className="flex items-center gap-2 px-5 h-11 rounded-xl font-bold text-black hover:opacity-90">
                <Plus className="w-5 h-5" /> Publicar Nuevo Cargo
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {cargos.map((cargo) => (
                <Card key={cargo.id} className="border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-black">{cargo.titulo}</h3>
                        <Badge variant="outline" className={`text-xs font-bold ${cargo.estado === "Activo" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500"}`}>
                          {cargo.estado}
                        </Badge>
                      </div>
                      <p className="text-gray-500 text-sm">{cargo.descripcion}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 mb-3 text-sm">
                    <div><p className="text-gray-400 text-xs mb-1">Ubicación</p><p className="font-medium text-black">{cargo.ubicacion}</p></div>
                    <div><p className="text-gray-400 text-xs mb-1">Modalidad</p><p className="font-medium text-black">{cargo.modalidad}</p></div>
                    <div><p className="text-gray-400 text-xs mb-1">Salario</p><p className="font-medium text-black">{cargo.salaryRange || "No especificado"}</p></div>
                  </div>
                  {cargo.mustHave?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cargo.mustHave.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-[#7FFFD4]/20 text-black border-[#5FD3BC]">{skill}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="bg-[#7FFFD4]/10 rounded-xl px-4 py-2 mb-4 text-sm font-medium text-gray-700">
                    👥 {cargo.candidatosPostulados} candidatos postulados
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline"
                      onClick={() => { setCargoPostulacionesId(cargo.id); }}
                      className="border-gray-200 text-gray-700 rounded-xl h-10">
                      Ver Postulaciones
                    </Button>
                    <Button variant="outline" onClick={() => handleEliminarVacante(cargo.id)}
                      className="border-red-100 text-red-500 hover:bg-red-50 rounded-xl h-10">
                      Eliminar Cargo
                    </Button>
                  </div>

                  {/* Postulaciones inline del cargo */}
                  {cargoPostulacionesId === cargo.id && (
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      <h4 className="font-bold text-black text-sm">Postulaciones a este cargo</h4>
                      {postulacionesDeCargo.length === 0 ? (
                        <p className="text-sm text-gray-400">No hay postulaciones aún.</p>
                      ) : (
                        postulacionesDeCargo.map((p) => {
                          const config = STATUS_CONFIG[p.status] || STATUS_CONFIG["POSTULADO"];
                          return (
                            <div key={p.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#7FFFD4]/50 flex items-center justify-center font-bold text-black text-xs">
                                  {p.candidatoNombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-semibold text-black text-sm">{p.candidatoNombre}</p>
                                  <p className="text-xs text-gray-500">{p.candidatoEmail}</p>
                                </div>
                              </div>
                              <Select value={p.status} onValueChange={(val) => handleCambiarEstado(p.id, val)}>
                                <SelectTrigger className="border-gray-200 h-8 bg-white text-black rounded-lg text-xs w-40"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="POSTULADO">Postulado</SelectItem>
                                  <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                                  <SelectItem value="ENTREVISTA">Entrevista</SelectItem>
                                  <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </Card>
              ))}
              {cargos.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No tienes cargos activos. ¡Publica tu primer cargo!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── MODAL VER CANDIDATO ─── */}
      <Dialog open={mostrarModal} onOpenChange={setMostrarModal}>
        <DialogContent className="max-w-md bg-white text-black border-gray-100 max-h-[90vh] overflow-y-auto">
          {candidatoSeleccionado && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/50 flex items-center justify-center text-lg font-bold text-black shrink-0">
                    {candidatoSeleccionado.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-black">{candidatoSeleccionado.nombre}</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">{candidatoSeleccionado.cargo}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                {candidatoSeleccionado.resumen && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-black">Resumen Profesional</h4>
                    <p className="text-sm text-gray-600">{candidatoSeleccionado.resumen}</p>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div className="space-y-2">
                  <h4 className="font-bold text-black">Información de Contacto</h4>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#5FD3BC]" /> {candidatoSeleccionado.email}</p>
                    {candidatoSeleccionado.telefono && candidatoSeleccionado.telefono !== "No registrado" && (
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#5FD3BC]" /> {candidatoSeleccionado.telefono}</p>
                    )}
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#5FD3BC]" /> {candidatoSeleccionado.ubicacion}</p>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-3">
                  <h4 className="font-bold text-black">Experiencia y Formación</h4>
                  {candidatoSeleccionado.experiencia && candidatoSeleccionado.experiencia !== "Sin experiencia registrada" && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Experiencia</p>
                      <p className="text-sm text-gray-700">{parseExperience(candidatoSeleccionado.experiencia)}</p>
                    </div>
                  )}
                  {candidatoSeleccionado.educacion && candidatoSeleccionado.educacion !== "Sin educación registrada" && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Educación</p>
                      <p className="text-sm text-gray-700">{parseEducation(candidatoSeleccionado.educacion)}</p>
                    </div>
                  )}
                </div>
                <hr className="border-gray-100" />
                {candidatoSeleccionado.habilidades.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-black">Habilidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidatoSeleccionado.habilidades.map((skill, i) => (
                        <span key={i} className="px-3 py-1 border border-[#5FD3BC] rounded-full text-xs text-black">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Disponibilidad</p>
                    <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
                      {candidatoSeleccionado.disponibilidad}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Salario Deseado</p>
                    <p className="text-sm font-bold text-black">${candidatoSeleccionado.salarioDeseado.toLocaleString("es-CO")} COP</p>
                  </div>
                </div>
                <button
                  style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                  className="w-full h-11 rounded-xl font-bold text-black hover:opacity-90 transition-opacity"
                  onClick={() => window.location.href = `mailto:${candidatoSeleccionado.email}`}>
                  Contactar Candidato
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── MODAL PUBLICAR CARGO ─── */}
      <Dialog open={mostrarModalVacante} onOpenChange={setMostrarModalVacante}>
        <DialogContent className="max-w-lg bg-white text-black border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Publicar Nuevo Cargo</DialogTitle>
            <DialogDescription className="text-gray-600">Completa los datos del cargo disponible</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold text-black">Título del cargo *</Label>
              <Input placeholder="Ej: Desarrollador Full Stack" value={nuevaVacante.title} onChange={e => setNuevaVacante(p => ({ ...p, title: e.target.value }))} className="border-gray-200 rounded-xl text-black" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-black">Descripción *</Label>
              <Input placeholder="Descripción del cargo" value={nuevaVacante.description} onChange={e => setNuevaVacante(p => ({ ...p, description: e.target.value }))} className="border-gray-200 rounded-xl text-black" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-black">Modalidad</Label>
              <Select value={nuevaVacante.modality} onValueChange={v => setNuevaVacante(p => ({ ...p, modality: v }))}>
                <SelectTrigger className="border-gray-200 rounded-xl text-black"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Remoto">Remoto</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-black">Rango Salarial</Label>
              <Input placeholder="Ej: $8.000.000 - $12.000.000 COP" value={nuevaVacante.salaryRange} onChange={e => setNuevaVacante(p => ({ ...p, salaryRange: e.target.value }))} className="border-gray-200 rounded-xl text-black" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-black">Habilidades requeridas (separadas por coma)</Label>
              <Input placeholder="Ej: React, Node.js, TypeScript" value={nuevaVacante.mustHave} onChange={e => setNuevaVacante(p => ({ ...p, mustHave: e.target.value }))} className="border-gray-200 rounded-xl text-black" />
            </div>
            <button onClick={handleCrearVacante} disabled={loadingVacante}
              style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
              className="w-full h-11 rounded-xl font-bold text-black hover:opacity-90 disabled:opacity-60">
              {loadingVacante ? "Publicando..." : "Publicar Cargo"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── FOOTER ─── */}
      <footer
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full py-4 text-center text-sm text-black/70 font-medium mt-8"
      >
        © 2026 ProfileManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}