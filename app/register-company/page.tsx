"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 1. Agregado para redirección
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Building2, Plus, X, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Importado para notificaciones
import { registerCompany } from "../actions/register-company"; // 2. Importamos la acción del servidor

export default function RegisterCompanyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // --- ESTADOS PARA LOS CARGOS DINÁMICOS ---
  const [roles, setRoles] = useState<{title: string, description: string}[]>([]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const handleAddRole = () => {
    if (newRoleTitle.trim() === "") return;
    
    setRoles([...roles, { title: newRoleTitle, description: newRoleDescription }]);
    
    setNewRoleTitle("");
    setNewRoleDescription("");
    setIsAddingRole(false);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  // 3. FUNCIÓN DE ENVÍO CONECTADA A LA BASE DE DATOS
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Capturamos automáticamente todos los campos con 'name'
    const formDataRaw = new FormData(e.currentTarget);
    const data = Object.fromEntries(formDataRaw.entries());

    try {
      const result = await registerCompany(data, roles);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("¡Empresa registrada exitosamente!");
        router.push("/"); // Redirigir al login al finalizar
      }
    } catch (err) {
      toast.error("Ocurrió un error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 text-black font-sans">
      
      <div className="w-full max-w-3xl mb-6 flex justify-between items-center px-0">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2">
          Profile<span className="text-[#5FD3BC]">Manager</span>
        </h1>
      </div>

      <Card className="w-full max-w-3xl shadow-lg border-gray-200 bg-white">
        <CardHeader className="space-y-1 pb-6 border-b border-gray-100 px-6 md:px-10 pt-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#7FFFD4] rounded-full flex items-center justify-center shadow-inner">
              <Building2 className="w-7 h-7 text-black" />
            </div>
            <div>
              <CardTitle className="text-2xl text-black">Registro de Empresa</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Completa el formulario para registrar tu empresa
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 px-6 md:px-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Sección: Información de la Empresa */}
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-black border-l-4 border-[#7FFFD4] pl-3">Información de la Empresa</h3>
              
              <div className="space-y-2">
                <Label className="text-black font-semibold text-sm">Nombre de la Empresa *</Label>
                {/* 4. ATRIBUTO 'name' AGREGADO */}
                <Input name="name" placeholder="Ej: Tech Solutions Colombia S.A.S" required className="h-11 bg-gray-50 border-gray-300 placeholder:text-gray-600 text-black" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label className="text-black font-semibold text-sm">NIT *</Label>
                  <Input name="nit" placeholder="Ej: 900123456-7" required className="h-11 bg-gray-50 border-gray-300 placeholder:text-gray-600 text-black" />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-semibold text-sm">Ubicación *</Label>
                  <Input name="location" placeholder="Ej: Medellín, Colombia" required className="h-11 bg-gray-50 border-gray-300 placeholder:text-gray-600 text-black" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-black font-semibold text-sm">Core de Negocios *</Label>
                <textarea 
                  name="coreBusiness" // 4. ATRIBUTO 'name' AGREGADO
                  className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-black placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5FD3BC]"
                  placeholder="Describe el giro principal de tu empresa..."
                  required
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-black font-semibold text-sm">Número Aproximado de Empleados *</Label>
                <Input name="employeeCount" type="number" placeholder="Ej: 50" required className="h-11 bg-gray-50 border-gray-300 placeholder:text-gray-600 text-black" />
              </div>
            </div>

            {/* Sección: Cargos Disponibles Interactiva */}
            <div className="space-y-5 border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-black border-l-4 border-[#7FFFD4] pl-3">Cargos Disponibles (Opcional)</h3>
                  <p className="text-sm text-gray-500 mt-1">Puedes agregar vacantes iniciales para tu empresa</p>
                </div>
                {!isAddingRole && (
                  <Button 
                    type="button" 
                    onClick={() => setIsAddingRole(true)} 
                    className="bg-[#5FD3BC] hover:bg-[#4ebfac] text-black font-bold h-10 px-4 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Agregar Cargo
                  </Button>
                )}
              </div>

              {isAddingRole && (
                <div className="p-6 border-2 border-[#5FD3BC] rounded-xl bg-[#7FFFD4]/5 space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center border-b border-[#5FD3BC]/30 pb-3">
                    <h4 className="font-bold text-black flex items-center gap-2 text-lg">
                      <Briefcase className="w-5 h-5 text-[#5FD3BC]" /> Nueva Vacante
                    </h4>
                    <button type="button" onClick={() => setIsAddingRole(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-black font-semibold text-sm">Título de la Vacante *</Label>
                      <Input 
                        placeholder="Ej: Desarrollador Backend Senior" 
                        value={newRoleTitle}
                        onChange={(e) => setNewRoleTitle(e.target.value)}
                        className="h-11 bg-white border-gray-300 mt-1 text-black" 
                      />
                    </div>
                    <div>
                      <Label className="text-black font-semibold text-sm">Información del Cargo / Requisitos</Label>
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5FD3BC]"
                        placeholder="Información adicional..."
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setIsAddingRole(false)} className="text-gray-500 hover:bg-gray-100">
                        Cancelar
                      </Button>
                      <Button type="button" onClick={handleAddRole} className="bg-black text-[#7FFFD4] hover:bg-gray-800 font-bold px-8">
                        Guardar Cargo
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-3 mt-4">
                {roles.map((role, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-[#5FD3BC] transition-all">
                    <div className="flex gap-3">
                      <div className="mt-1 p-2 bg-[#7FFFD4]/20 rounded-lg">
                         <Briefcase className="w-4 h-4 text-[#5FD3BC]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-black">{role.title}</h4>
                        {role.description && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{role.description}</p>}
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveRole(index)} className="text-gray-300 hover:text-red-500 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección: Credenciales */}
            <div className="space-y-5 border-t border-gray-100 pt-8">
              <h3 className="text-xl font-bold text-black border-l-4 border-[#7FFFD4] pl-3">Credenciales de Acceso</h3>
              <div className="space-y-2">
                <Label className="text-black font-semibold text-sm">Correo electrónico corporativo *</Label>
                <Input name="email" type="email" placeholder="Ej: rrhh@empresa.com" required className="h-11 bg-gray-50 border-gray-300 placeholder:text-gray-600 text-black" />
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-black font-semibold text-sm">Contraseña *</Label>
                <Input name="password" type="password" placeholder="••••••••" required className="h-11 bg-gray-50 border-gray-300 placeholder:text-gray-600 text-black" />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#7FFFD4] text-black hover:bg-[#5FD3BC] font-bold h-14 text-xl shadow-md rounded-xl transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin"/> Procesando...
                </span>
              ) : "Registrar Empresa"}
            </Button>

          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pb-10 pt-6 border-t border-gray-100/50 mt-4 px-6 md:px-10">
          <div className="text-sm text-gray-600 text-center w-full">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/" className="text-[#5FD3BC] hover:underline font-bold">
              Inicia sesión aquí
            </Link>
          </div>
          <div className="text-sm text-gray-600 text-center w-full">
            ¿Eres un solicitante?{" "}
            <Link href="/register" className="text-[#5FD3BC] hover:underline font-bold">
              Registro individual
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}