// app/dashboard-company/ClientDashboard.tsx
"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Briefcase, MapPin, GraduationCap, Eye, Star } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";

// Mantenemos tus interfaces intactas
interface Candidato {
  id: string; nombre: string; cargo: string; ubicacion: string; experiencia: string;
  educacion: string; habilidades: string[]; salarioDeseado: number;
  disponibilidad: "Inmediata" | "2 semanas" | "1 mes"; resumen: string; email: string; telefono: string;
}

interface CargoDisponible {
  id: string; titulo: string; descripcion: string; salario: number;
  ubicacion: string; modalidad: "Remoto" | "Presencial" | "Híbrido";
  estado: "Activo" | "Pausado"; candidatosPostulados: number;
}

// ✅ AHORA RECIBIMOS LOS DATOS REALES COMO PROPIEDADES (PROPS)
export default function ClientDashboard({ candidatosIniciales, cargosDisponiblesIniciales }: { candidatosIniciales: Candidato[], cargosDisponiblesIniciales: CargoDisponible[] }) {
  
  const [candidatos] = useState<Candidato[]>(candidatosIniciales);
  const [cargosDisponibles] = useState<CargoDisponible[]>(cargosDisponiblesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroExperiencia, setFiltroExperiencia] = useState<string>("todos");
  const [filtroSalarioMax, setFiltroSalarioMax] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<Candidato | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Tu lógica de filtrado original
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

  return (
    <div className="min-h-screen bg-white text-black pb-12">
      <header className="bg-[#7FFFD4] py-4 px-6 flex justify-between items-center shadow-sm">
        <h2 className="text-2xl font-black text-black tracking-tight">ProfileManager Empresas</h2>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-black">
          TM
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Panel de Empresa</h1>
          <p className="text-gray-600 mb-6 font-medium">Encuentra los mejores candidatos para tu empresa</p>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                    <Button variant="ghost" onClick={() => { setFiltroExperiencia("todos"); setFiltroSalarioMax(""); }} className="text-gray-500 hover:text-gray-800">
                      Limpiar filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Tabs defaultValue="candidatos" className="w-full">
          <TabsList className="mb-6 bg-transparent gap-4 h-auto p-0">
            <TabsTrigger value="candidatos" className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#7FFFD4] data-[state=active]:text-black border border-gray-200 text-gray-500 transition-all font-bold">
              Candidatos ({candidatosFiltrados.length})
            </TabsTrigger>
            <TabsTrigger value="cargos" className="rounded-full px-6 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-black border border-transparent text-gray-500 font-bold">
              Mis Cargos Disponibles ({cargosDisponibles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidatos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatosFiltrados.map((candidato) => (
                <Card key={candidato.id} className="border-gray-200 hover:shadow-lg transition-shadow rounded-2xl">
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-14 h-14 rounded-full bg-[#7FFFD4]/50 flex items-center justify-center text-lg text-black font-bold">
                        {candidato.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-black">{candidato.nombre}</CardTitle>
                        <CardDescription className="text-gray-600 font-medium">{candidato.cargo}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">{candidato.disponibilidad}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-6">
                    <div className="flex items-center text-sm text-gray-600 gap-2"><MapPin className="w-4 h-4 text-[#5FD3BC]" /> {candidato.ubicacion}</div>
                    <div className="flex items-center text-sm text-gray-600 gap-2"><Briefcase className="w-4 h-4 text-[#5FD3BC]" /> {candidato.experiencia}</div>
                    <div className="flex items-center text-sm text-gray-600 gap-2"><Star className="w-4 h-4 text-[#5FD3BC]" /> ${candidato.salarioDeseado.toLocaleString()} COP</div>
                  </CardContent>
                  <div className="px-6 pb-6 space-y-2">
                    <Button onClick={() => { setCandidatoSeleccionado(candidato); setMostrarModal(true); }} variant="outline" className="w-full border-gray-200 text-gray-700 rounded-xl h-10">
                      <Eye className="w-4 h-4 mr-2" /> Ver Perfil Completo
                    </Button>
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

          <TabsContent value="cargos">
            <div className="grid grid-cols-1 gap-4">
               {cargosDisponibles.map((cargo) => (
                 <Card key={cargo.id} className="border-gray-200 p-6">
                   <h3 className="text-xl font-bold text-black">{cargo.titulo}</h3>
                   <p className="text-gray-600 mt-2">{cargo.descripcion}</p>
                   <div className="mt-4 flex gap-4 text-sm text-gray-500">
                     <span>📍 {cargo.ubicacion}</span>
                     <span>🏢 {cargo.modalidad}</span>
                     <span>👥 {cargo.candidatosPostulados} Postulaciones</span>
                   </div>
                 </Card>
               ))}
               
               {cargosDisponibles.length === 0 && (
                 <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                   <p className="text-gray-500 font-medium">Tus cargos activos aparecerán aquí.</p>
                 </div>
               )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Vista Previa */}
        <Dialog open={mostrarModal} onOpenChange={setMostrarModal}>
          <DialogContent className="max-w-2xl bg-white text-black border-gray-100">
            {candidatoSeleccionado && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/50 flex items-center justify-center text-lg text-black font-bold">
                      {candidatoSeleccionado.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    {candidatoSeleccionado.nombre}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-gray-600 font-medium pt-2">{candidatoSeleccionado.cargo}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <p className="text-gray-700">{candidatoSeleccionado.resumen}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                    <p><strong>Educación:</strong> {candidatoSeleccionado.educacion}</p>
                    <p><strong>Habilidades:</strong> {candidatoSeleccionado.habilidades.join(", ")}</p>
                    <p><strong>Contacto:</strong> {candidatoSeleccionado.email}</p>
                  </div>

                  <Button className="w-full bg-[#7FFFD4] text-black font-bold hover:bg-[#5FD3BC] rounded-xl h-11" onClick={() => alert(`Contactando a ${candidatoSeleccionado.email}`)}>
                    Contactar Candidato
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}