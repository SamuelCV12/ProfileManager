// app/profile/ProfileForm.tsx
"use client";

import { useState, useEffect } from "react"; // ✅ Agregamos useEffect
import { useRouter } from "next/navigation";
import { updateProfile } from "../actions/profile";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Save, User, Loader2 } from "lucide-react";

export default function ProfileForm({ profile }: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", desiredRole: "", description: "",
    skills: "", experience: "", education: "",
  });

  // ✅ FORZAMOS A REACT A USAR LOS DATOS DE LA BASE DE DATOS
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        desiredRole: profile.desiredRole || "",
        description: profile.description || "",
        skills: profile.skills?.join("\n") || "",
        experience: profile.experience?.join("\n\n") || "",
        education: profile.education?.join("\n\n") || "",
      });
    }
  }, [profile]); // Se ejecuta cada vez que el perfil de PostgreSQL cambia

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSave = {
      ...formData,
      skills: formData.skills.split("\n").filter((s: string) => s.trim() !== ""),
      experience: formData.experience.split("\n\n").filter((e: string) => e.trim() !== ""),
      education: formData.education.split("\n\n").filter((e: string) => e.trim() !== ""),
    };

    const result = await updateProfile(profile.id, dataToSave);
    setIsLoading(false);

    if (result.success) {
      alert("¡Perfil actualizado con éxito!");
      router.refresh(); // Refrescamos la página automáticamente
    } else {
      alert("Error al actualizar el perfil.");
    }
  };

  return (
    <Card className="border-gray-100 shadow-sm rounded-2xl">
      <CardHeader className="bg-gray-50 rounded-t-2xl border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#7FFFD4] flex items-center justify-center border-4 border-white shadow-sm">
            <User className="w-8 h-8 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl text-black">Información Personal</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Actualiza los datos extraídos de tu CV</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nombres</Label>
              <Input name="firstName" value={formData.firstName} onChange={handleChange} className="h-12 rounded-xl text-black border-gray-200" required />
            </div>
            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input name="lastName" value={formData.lastName} onChange={handleChange} className="h-12 rounded-xl text-black border-gray-200" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cargo Deseado</Label>
            <Input name="desiredRole" value={formData.desiredRole} onChange={handleChange} placeholder="Ej: Desarrollador Backend" className="h-12 rounded-xl text-black border-gray-200" />
          </div>

          <div className="space-y-2">
            <Label>Descripción Profesional</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Cuéntanos sobre ti..." className="min-h-[100px] rounded-xl text-black border-gray-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Habilidades (Una por línea)</Label>
              <Textarea name="skills" value={formData.skills} onChange={handleChange} className="min-h-[120px] rounded-xl text-black border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label>Educación (Separada por doble salto de línea)</Label>
              <Textarea name="education" value={formData.education} onChange={handleChange} className="min-h-[120px] rounded-xl text-black border-gray-200" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experiencia Laboral (Separada por doble salto de línea)</Label>
            <Textarea name="experience" value={formData.experience} onChange={handleChange} className="min-h-[120px] rounded-xl text-black border-gray-200" />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-[#7FFFD4] text-black hover:bg-[#5FD3BC] h-12 px-8 rounded-xl font-bold">
              {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-5 h-5 mr-2" /> Guardar Cambios</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}