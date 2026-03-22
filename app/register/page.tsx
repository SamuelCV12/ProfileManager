"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Upload, Plus, User, FileText, Loader2, ArrowLeft, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { registerUser } from "../actions/register";
import { uploadResume } from "../actions/upload";
import LanguageSelector from "../../components/ui/LanguageSelector";

// ─── Tipos estructurados ───
type EducationEntry = { degree: string; institution: string; year: string };
type ExperienceEntry = { role: string; company: string; period: string; description: string };

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [educationList, setEducationList] = useState<EducationEntry[]>([]);
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([]);

  const router = useRouter();

  // ─── Educación ───
  const addEducation = () => setEducationList([...educationList, { degree: "", institution: "", year: "" }]);
  const updateEducation = (i: number, field: keyof EducationEntry, val: string) => {
    const list = [...educationList]; list[i] = { ...list[i], [field]: val }; setEducationList(list);
  };
  const removeEducation = (i: number) => setEducationList(educationList.filter((_, idx) => idx !== i));

  // ─── Experiencia ───
  const addExperience = () => setExperienceList([...experienceList, { role: "", company: "", period: "", description: "" }]);
  const updateExperience = (i: number, field: keyof ExperienceEntry, val: string) => {
    const list = [...experienceList]; list[i] = { ...list[i], [field]: val }; setExperienceList(list);
  };
  const removeExperience = (i: number) => setExperienceList(experienceList.filter((_, idx) => idx !== i));

  const handleProcessFile = async () => {
    if (!file) { toast.error("Por favor, selecciona un archivo primero."); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const result = await uploadResume(formData);
      if (result?.success) {
        setResumeUrl(result.url || "");
        if (result.extractedData) {
          setFirstName(result.extractedData.firstName);
          setLastName(result.extractedData.lastName);
          // Convertir datos extraídos al formato estructurado
          setEducationList(result.extractedData.education.map((e: string) => ({ degree: e, institution: "", year: "" })));
          setExperienceList(result.extractedData.experience.map((e: string) => ({ role: e, company: "", period: "", description: "" })));
          toast.success("¡Datos extraídos! Por favor, valida la información.");
        }
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al procesar el documento.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName,
      lastName,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      description: formData.get("description") as string,
      desiredRole: formData.get("desiredRole") as string,
      birthDate: formData.get("birthDate") as string,
      role: "CANDIDATE" as const,
      education: educationList.map((e) => `${e.degree} | ${e.institution} | ${e.year}`),
      experience: experienceList.map((e) => `${e.role} | ${e.company} | ${e.period} | ${e.description}`),
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
    <div className="min-h-screen bg-white flex flex-col text-black">

      {/* ─── HEADER ─── */}
      <header
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full px-6 py-4 flex items-center justify-between shadow-sm"
      >
        <span className="text-black font-bold text-xl tracking-tight">ProfileManager</span>
        <LanguageSelector />
      </header>

      {/* ─── CONTENIDO ─── */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 pt-8 pb-4">
            <Link href="/" className="flex items-center text-sm text-gray-500 hover:text-black mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver al login
            </Link>
            <h1 className="text-3xl font-bold text-black">Crear Cuenta</h1>
            <p className="text-gray-600 mt-1">Completa el formulario para registrarte en nuestro portal</p>
          </div>

          <div className="px-8 pb-8 space-y-8">

            {/* ─── CV UPLOAD ─── */}
            <div className="bg-[#7FFFD4]/10 border border-[#7FFFD4]/30 p-5 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg border border-[#7FFFD4]/50 shadow-sm">
                <FileText className="w-6 h-6 text-[#5FD3BC]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-black">Sube tu CV para llenar automáticamente el formulario (Opcional)</p>
                <p className="text-xs text-gray-500 mb-3">Formatos aceptados: PDF, DOC, DOCX</p>
                <div className="flex gap-2">
                  <input type="file" id="resume-upload" className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <label htmlFor="resume-upload"
                    className="flex-1 h-10 border border-gray-300 rounded-lg bg-gray-50 flex items-center px-3 text-black text-sm cursor-pointer hover:border-[#5FD3BC] transition-colors overflow-hidden whitespace-nowrap">
                    {file ? file.name : "Elegir archivo"}
                  </label>
                  <button type="button" onClick={handleProcessFile} disabled={isUploading || !file}
                    style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                    className="flex items-center gap-2 px-5 h-10 rounded-lg font-bold text-black hover:opacity-90 disabled:opacity-50">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Procesar</>}
                  </button>
                </div>
                {resumeUrl && <p className="text-[10px] text-green-600 mt-2 font-bold">✓ Contenido extraído del documento</p>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ─── FOTO DE PERFIL ─── */}
              <div className="space-y-3">
                <Label className="text-black font-bold flex items-center gap-2">
                  <User className="w-4 h-4" /> Foto de Perfil (Opcional)
                </Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                    <User className="w-10 h-10" />
                  </div>
                  <input type="file" accept="image/*"
                    className="flex-1 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-200 file:text-sm file:bg-white file:text-gray-600 hover:file:bg-gray-50 cursor-pointer" />
                </div>
              </div>

              {/* ─── INFORMACIÓN PERSONAL ─── */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-black border-b pb-2">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Nombres *</Label>
                    <Input name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ej: Juan Carlos" required className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Apellidos *</Label>
                    <Input name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej: García López" required className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Fecha de Nacimiento *</Label>
                    <Input name="birthDate" type="date" required className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-semibold">Descripción Personal (Opcional)</Label>
                  <Textarea name="description" placeholder="Escribe una breve descripción de ti mismo"
                    className="min-h-[120px] text-black bg-gray-50 border-gray-300" />
                </div>
              </div>

              {/* ─── EDUCACIÓN ─── */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-xl font-bold text-black">Educación (Opcional)</h3>
                  <button type="button" onClick={addEducation}
                    style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-bold text-black hover:opacity-90">
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
                {educationList.map((edu, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative">
                    <button type="button" onClick={() => removeEducation(i)}
                      className="absolute top-3 right-3 text-gray-300 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-bold text-gray-400 uppercase">Educación</p>
                    <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)}
                      placeholder="Título / Carrera" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)}
                      placeholder="Institución" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Input value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)}
                      placeholder="Año (Ej: 2019-2023)" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                  </div>
                ))}
              </div>

              {/* ─── EXPERIENCIA ─── */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-xl font-bold text-black">Experiencia Laboral (Opcional)</h3>
                  <button type="button" onClick={addExperience}
                    style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-bold text-black hover:opacity-90">
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
                {experienceList.map((exp, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative">
                    <button type="button" onClick={() => removeExperience(i)}
                      className="absolute top-3 right-3 text-gray-300 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-bold text-gray-400 uppercase">Experiencia</p>
                    <Input value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)}
                      placeholder="Cargo" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)}
                      placeholder="Empresa" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Input value={exp.period} onChange={(e) => updateExperience(i, "period", e.target.value)}
                      placeholder="Período (Ej: 2020-2024)" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Textarea value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)}
                      placeholder="Descripción de responsabilidades..."
                      className="min-h-[80px] rounded-lg text-black border-gray-200 bg-white" />
                  </div>
                ))}
              </div>

              {/* ─── CARGO DESEADO ─── */}
              <div className="space-y-2">
                <Label className="text-black font-semibold">Cargo Deseado *</Label>
                <Input name="desiredRole" placeholder="Ej: Analista Senior de Datos" required
                  className="bg-gray-50 border-gray-300 text-black" />
              </div>

              {/* ─── CREDENCIALES ─── */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-black border-b pb-2">Credenciales de Acceso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Correo electrónico *</Label>
                    <Input name="email" type="email" placeholder="tu@email.com" required
                      className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Contraseña *</Label>
                    <Input name="password" type="password" placeholder="••••••••" required
                      className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                </div>
              </div>

              {/* ─── BOTÓN CREAR CUENTA ─── */}
              <button type="submit" disabled={isLoading}
                style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                className="w-full h-14 rounded-xl font-bold text-black text-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
                {isLoading ? <><Loader2 className="animate-spin w-5 h-5" /> Creando cuenta...</> : "Crear Cuenta"}
              </button>
            </form>

            {/* ─── FOOTER LINKS ─── */}
            <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-600 text-center">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/" className="text-[#5FD3BC] font-bold hover:underline">Inicia sesión aquí</Link>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <p className="text-sm text-gray-600">¿Eres una empresa?</p>
                <Link href="/register-company" className="w-full">
                  <button type="button"
                    className="w-full h-11 rounded-lg font-bold text-black border border-gray-300 hover:bg-gray-50 transition-colors">
                    Registrar Empresa
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

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