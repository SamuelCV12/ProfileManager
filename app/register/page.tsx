"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea"; 
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Upload, Plus, User, FileText, Loader2, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { registerUser } from "../actions/register"; 
import { uploadResume } from "../actions/upload"; 

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [file, setFile] = useState<File | null>(null); 
  const [resumeUrl, setResumeUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState(""); 
  
  // --- ESTADOS PARA LISTAS DINÁMICAS (US-01) ---
  const [educationList, setEducationList] = useState<string[]>([]);
  const [experienceList, setExperienceList] = useState<string[]>([]);
  
  const router = useRouter();

  // Funciones para Educación
  const addEducation = () => setEducationList([...educationList, ""]);
  const updateEducation = (index: number, value: string) => {
    const newList = [...educationList];
    newList[index] = value;
    setEducationList(newList);
  };
  const removeEducation = (index: number) => setEducationList(educationList.filter((_, i) => i !== index));

  // Funciones para Experiencia
  const addExperience = () => setExperienceList([...experienceList, ""]);
  const updateExperience = (index: number, value: string) => {
    const newList = [...experienceList];
    newList[index] = value;
    setExperienceList(newList);
  };
  const removeExperience = (index: number) => setExperienceList(experienceList.filter((_, i) => i !== index));

  // Función para subir el archivo (.docx) y autollenar campos
  const handleProcessFile = async () => {
    if (!file) {
      toast.error("Por favor, selecciona un archivo primero.");
      return;
    }
  
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
  
      const result = await uploadResume(formData);
      
      if (result?.success) {
        setResumeUrl(result.url || "");
        
        // CUMPLIMIENTO DE CRITERIO: Revisar y corregir
        if (result.extractedData) {
          setFirstName(result.extractedData.firstName);
          setLastName(result.extractedData.lastName);
          setEducationList(result.extractedData.education);
          setExperienceList(result.extractedData.experience);
          
          toast.success("¡Datos extraídos! Por favor, valida la información.");
        }
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Error al procesar el documento.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Unificamos datos de estado y formulario para la US-01
    const data = {
      firstName,
      lastName,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      description: formData.get("description") as string,
      desiredRole: formData.get("desiredRole") as string,
      birthDate: formData.get("birthDate") as string,
      role: "CANDIDATE" as const,
      education: educationList, 
      experience: experienceList 
    };

    const result = await registerUser(data);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("¡Cuenta creada exitosamente!");
      router.push("/"); 
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 text-black">
      <Card className="max-w-3xl mx-auto border-none shadow-none">
        <CardHeader className="px-0">
          <Link href="/" className="flex items-center text-sm text-gray-500 hover:text-black mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al login
          </Link>
          <CardTitle className="text-3xl font-bold text-black">Crear Cuenta</CardTitle>
          <p className="text-gray-600">Completa tu perfil para acceder a vacantes personalizadas</p>
        </CardHeader>

        <CardContent className="px-0 space-y-8">
          {/* SECCIÓN CV EXCLUSIVA DOCX */}
          <div className="bg-[#7FFFD4]/10 border border-[#7FFFD4]/30 p-5 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg border border-[#7FFFD4]/50 shadow-sm">
              <FileText className="w-6 h-6 text-[#5FD3BC]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-black">Sube tu CV para llenar automáticamente el formulario (Opcional)</p>
              <p className="text-xs text-gray-500 mb-3">Formato aceptado: DOCX</p>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  id="resume-upload" 
                  className="hidden" 
                  accept=".docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label 
                  htmlFor="resume-upload"
                  className="flex-1 h-10 border border-gray-300 rounded-lg bg-gray-50 flex items-center px-3 text-black text-sm cursor-pointer hover:border-[#5FD3BC] transition-colors overflow-hidden whitespace-nowrap"
                >
                  {file ? file.name : "Seleccionar archivo .docx..."}
                </label>
                
                <Button 
                  type="button" 
                  onClick={handleProcessFile}
                  disabled={isUploading || !file}
                  className="bg-black text-[#7FFFD4] hover:bg-gray-800 font-bold px-6"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <> <Upload className="w-4 h-4 mr-2" /> Procesar </>}
                </Button>
              </div>
              {resumeUrl && <p className="text-[10px] text-green-600 mt-2 font-bold">✓ Contenido extraído del documento</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Foto de Perfil */}
            <div className="space-y-4">
              <Label className="text-black font-bold flex items-center gap-2">
                <User className="w-4 h-4" /> Foto de Perfil (Opcional)
              </Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                  <User className="w-10 h-10" />
                </div>
                <div className="flex-1 h-11 border border-gray-300 rounded-lg bg-gray-50 flex items-center px-4 text-black text-sm cursor-not-allowed opacity-60">
                  Próximamente...
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-black border-b pb-2">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-black font-semibold">Nombres *</Label>
                  <Input 
                    name="firstName" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej: Samuel" 
                    required 
                    className="bg-gray-50 border-gray-300 text-black" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-semibold">Apellidos *</Label>
                  <Input 
                    name="lastName" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej: Smith" 
                    required 
                    className="bg-gray-50 border-gray-300 text-black" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-semibold">Fecha de Nacimiento *</Label>
                  <Input name="birthDate" type="date" required className="bg-gray-50 border-gray-300 text-black" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-black font-semibold">Descripción Personal (Opcional)</Label>
                <Textarea 
                  name="description"
                  placeholder="Describe tu perfil profesional..."
                  className="min-h-[120px] text-black bg-gray-50 border-gray-300"
                />
              </div>
            </div>

            {/* SECCIÓN EDUCACIÓN */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xl font-bold text-black">Educación</h3>
                <Button type="button" onClick={addEducation} size="sm" className="bg-[#5FD3BC] text-black hover:bg-[#7FFFD4] font-bold">
                  <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
              </div>
              <div className="space-y-4">
                {educationList.map((edu, index) => (
                  <div key={index} className="relative group">
                    <Textarea 
                      placeholder="Título, Institución y Año"
                      value={edu}
                      onChange={(e) => updateEducation(index, e.target.value)}
                      className="bg-gray-50 border-gray-300 text-black pr-10"
                    />
                    <button type="button" onClick={() => removeEducation(index)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* SECCIÓN EXPERIENCIA */}
              <div className="flex justify-between items-center border-b pb-2 pt-4">
                <h3 className="text-xl font-bold text-black">Experiencia Laboral</h3>
                <Button type="button" onClick={addExperience} size="sm" className="bg-[#5FD3BC] text-black hover:bg-[#7FFFD4] font-bold">
                  <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
              </div>
              <div className="space-y-4">
                {experienceList.map((exp, index) => (
                  <div key={index} className="relative group">
                    <Textarea 
                      placeholder="Cargo, Empresa y Duración"
                      value={exp}
                      onChange={(e) => updateExperience(index, e.target.value)}
                      className="bg-gray-50 border-gray-300 text-black pr-10"
                    />
                    <button type="button" onClick={() => removeExperience(index)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-black font-semibold">Cargo Deseado *</Label>
              <Input name="desiredRole" placeholder="Ej: Desarrollador Backend" required className="bg-gray-50 border-gray-300 text-black" />
            </div>

            <div className="space-y-5 pt-4">
              <h3 className="text-xl font-bold text-black border-b pb-2">Credenciales de Acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-black font-semibold">Correo electrónico *</Label>
                  <Input name="email" type="email" placeholder="ejemplo@correo.com" required className="bg-gray-50 border-gray-300 text-black" />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-semibold">Contraseña *</Label>
                  <Input name="password" type="password" placeholder="••••••••" required className="bg-gray-50 border-gray-300 text-black" />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 bg-[#7FFFD4] text-black font-bold text-xl hover:bg-[#5FD3BC] transition-all rounded-xl shadow-md mt-6"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Crear Cuenta"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-8 border-t border-gray-100 px-0 mt-4">
          <div className="text-sm text-gray-600 text-center w-full">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/" className="text-[#5FD3BC] font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
          
          <div className="w-full flex flex-col items-center gap-2 pt-2 border-t border-gray-100/50">
            <p className="text-sm text-gray-600">¿Eres una empresa?</p>
            <Link href="/register-company" className="w-full">
              <Button 
                className="w-full h-11 bg-[#7FFFD4] text-black font-bold hover:bg-[#5FD3BC] transition-all rounded-lg shadow-sm"
                >Registrar Empresa
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}