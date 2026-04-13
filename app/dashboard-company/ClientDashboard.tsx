"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Edit2, Ban, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button }   from "../../components/ui/button";
import { Input }    from "../../components/ui/input";
import { Label }    from "../../components/ui/label";
import { Card }     from "../../components/ui/card";
import { Badge }    from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { createVacancy, deleteVacancy, updateVacancy } from "../actions/vacancy";
import LanguageSelector from "../../components/ui/LanguageSelector";
import LogoutButton     from "../../components/ui/LogoutButton";
import { useSession }   from "../../hooks/useSession";

// Interfaz corregida para coincidir con el schema de Prisma
interface CargoDisponible {
  id: string;
  titulo: string;
  descripcion: string;
  salaryRange: string | null;
  ubicacion: string;
  modalidad: string;
  isActive: boolean; // Cambiado de 'estado' (string) a 'isActive' (boolean)
  candidatosPostulados: number;
  mustHave: string[];
}

export default function ClientDashboard({
  cargosDisponiblesIniciales,
  companyId,
  companyInitials,
}: {
  candidatosIniciales: any[];
  cargosDisponiblesIniciales: CargoDisponible[];
  postulacionesIniciales: any[];
  companyId: string;
  companyName: string;
  companyInitials: string;
}) {
  const { isLoggedIn, loading } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn && !loading) window.location.href = "/";
  }, [isLoggedIn, loading]);

  const [cargos, setCargos] = useState<CargoDisponible[]>(cargosDisponiblesIniciales);
  const [busquedaCargo, setBusquedaCargo] = useState("");
  const [mostrarModalVacante, setMostrarModalVacante] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState<string | null>(null);

  const [nuevaVacante, setNuevaVacante] = useState({
    title: "", 
    description: "", 
    modality: "Presencial", 
    salaryRange: "", 
    mustHave: "",
  });
  const [loadingVacante, setLoadingVacante] = useState(false);

  if (!mounted) return null;

  const cargosFiltrados = cargos.filter(c =>
    !busquedaCargo ||
    c.titulo.toLowerCase().includes(busquedaCargo.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(busquedaCargo.toLowerCase())
  );

  const abrirCrear = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    setNuevaVacante({ title: "", description: "", modality: "Presencial", salaryRange: "", mustHave: "" });
    setMostrarModalVacante(true);
  };

  const abrirEditar = (cargo: CargoDisponible) => {
    setModoEdicion(true);
    setIdEdicion(cargo.id);
    setNuevaVacante({
      title: cargo.titulo,
      description: cargo.descripcion,
      modality: cargo.modalidad,
      salaryRange: cargo.salaryRange || "",
      mustHave: cargo.mustHave.join(", "),
    });
    setMostrarModalVacante(true);
  };

  const handleGuardarVacante = async () => {
    if (!nuevaVacante.title || !nuevaVacante.description) {
      toast.error("El título y la descripción son obligatorios.");
      return;
    }
    setLoadingVacante(true);
    
    const mustHaveArray = nuevaVacante.mustHave
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const payload = {
      title: nuevaVacante.title,
      description: nuevaVacante.description,
      modality: nuevaVacante.modality,
      salaryRange: nuevaVacante.salaryRange,
      mustHave: mustHaveArray,
    };

    try {
      const result = modoEdicion && idEdicion
        ? await updateVacancy(idEdicion, payload)
        : await createVacancy({ ...payload, companyId });

      // @ts-ignore
      if (result?.error) { 
        toast.error(result.error); 
      } else {
        toast.success(modoEdicion ? "Cargo actualizado." : "¡Cargo publicado!");
        setMostrarModalVacante(false);
        window.location.reload(); // Recarga para sincronizar con Server Actions
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor.");
    } finally {
      setLoadingVacante(false);
    }
  };

  const handleCambiarEstado = async (id: string, isActiveActual: boolean) => {
    const nuevoEstado = !isActiveActual;
    const result = await updateVacancy(id, { isActive: nuevoEstado });
    
    if (result.error) {
      toast.error(result.error);
      return;
    }
    
    toast.info(nuevoEstado ? "Vacante activada" : "Vacante pausada");
    window.location.reload();
  };

  const handleEliminarVacante = async (vacancyId: string) => {
    if (!confirm("¿Eliminar este cargo permanentemente?")) return;
    const result = await deleteVacancy(vacancyId);
    if (result.error) { 
      toast.error(result.error); 
      return; 
    }
    toast.success("Cargo eliminado.");
    setCargos(prev => prev.filter(c => c.id !== vacancyId));
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }} className="py-4 px-6 flex justify-between items-center shadow-sm">
        <h2 className="text-2xl font-black text-black">ProfileManager</h2>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold border">{companyInitials}</div>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Panel de Empresa</h1>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="Buscar cargo..." value={busquedaCargo} onChange={e => setBusquedaCargo(e.target.value)} className="pl-12 h-12 rounded-xl" />
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Mis Cargos ({cargosFiltrados.length})</h2>
          <button onClick={abrirCrear} style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }} className="flex items-center gap-2 px-5 h-11 rounded-xl font-bold">
            <Plus className="w-5 h-5" /> Publicar Nuevo Cargo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cargosFiltrados.map(cargo => (
            <Card key={cargo.id} className="p-6 border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold truncate">{cargo.titulo}</h3>
                    <Badge className={cargo.isActive ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-600"}>
                      {cargo.isActive ? "Activo" : "Pausado"}
                    </Badge>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">{cargo.descripcion}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="icon" onClick={() => abrirEditar(cargo)} className="text-blue-500 h-8 w-8"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCambiarEstado(cargo.id, cargo.isActive)} className="text-orange-500 h-8 w-8">
                    {cargo.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEliminarVacante(cargo.id)} className="text-red-500 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 mb-4 text-xs">
                <div><span className="text-gray-400 block uppercase text-[10px]">Ubicación</span><span className="font-medium">{cargo.ubicacion}</span></div>
                <div><span className="text-gray-400 block uppercase text-[10px]">Modalidad</span><span className="font-medium">{cargo.modalidad}</span></div>
                <div><span className="text-gray-400 block uppercase text-[10px]">Salario</span><span className="font-medium">{cargo.salaryRange || "N/A"}</span></div>
              </div>

              <div className="space-y-3">
                <div className="bg-[#7FFFD4]/10 rounded-xl px-4 py-2 text-sm font-medium">
                  👥 {cargo.candidatosPostulados} candidatos postulados
                </div>
                <Link href={`/dashboard-company/postulaciones/${cargo.id}`} className="w-full">
                  <Button variant="outline" className="w-full border-gray-200 rounded-xl h-10">Ver Postulaciones</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={mostrarModalVacante} onOpenChange={setMostrarModalVacante}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{modoEdicion ? "Editar Cargo" : "Publicar Nuevo Cargo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label className="font-semibold">Título del cargo *</Label>
              <Input value={nuevaVacante.title} onChange={e => setNuevaVacante(p => ({ ...p, title: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Descripción *</Label>
              <Input value={nuevaVacante.description} onChange={e => setNuevaVacante(p => ({ ...p, description: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Modalidad</Label>
              <Select value={nuevaVacante.modality} onValueChange={v => setNuevaVacante(p => ({ ...p, modality: v }))}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Remoto">Remoto</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Rango Salarial</Label>
              <Input value={nuevaVacante.salaryRange} onChange={e => setNuevaVacante(p => ({ ...p, salaryRange: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Habilidades (comas)</Label>
              <Input value={nuevaVacante.mustHave} onChange={e => setNuevaVacante(p => ({ ...p, mustHave: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <button onClick={handleGuardarVacante} disabled={loadingVacante} style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }} className="w-full h-12 rounded-xl font-bold">
              {loadingVacante ? "Guardando..." : modoEdicion ? "Actualizar Cargo" : "Publicar Cargo"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <footer style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }} className="w-full py-4 text-center text-sm font-medium mt-auto">
        © 2026 ProfileManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}