"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Plus, User, FileText, Loader2, ArrowLeft, Trash2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { registerUser } from "../actions/register";
import LanguageSelector from "../../components/ui/LanguageSelector";

type EducationEntry  = { degree: string; institution: string; year: string };
type ExperienceEntry = { role: string; company: string; period: string; description: string };

export default function RegisterPage() {
  const [isLoading,      setIsLoading]      = useState(false);
  const [isProcessingCV, setIsProcessingCV] = useState(false);
  const [cvProcessed,    setCvProcessed]    = useState(false);
  const [resumeUrl,      setResumeUrl]      = useState("");
  const [firstName,      setFirstName]      = useState("");
  const [lastName,       setLastName]       = useState("");
  const [desiredRole,    setDesiredRole]    = useState("");
  const [description,    setDescription]    = useState("");
  const [skills,         setSkills]         = useState("");
  const [avatarPreview,  setAvatarPreview]  = useState<string | null>(null);
  const [avatarFile,     setAvatarFile]     = useState<File | null>(null);
  const [educationList,  setEducationList]  = useState<EducationEntry[]>([]);
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef     = useRef<HTMLInputElement>(null);
  const router         = useRouter();

  // ── EDUCACIÓN ──
  const addEducation    = () => setEducationList([...educationList, { degree: "", institution: "", year: "" }]);
  const updateEducation = (i: number, field: keyof EducationEntry, val: string) => {
    const list = [...educationList]; list[i] = { ...list[i], [field]: val }; setEducationList(list);
  };
  const removeEducation = (i: number) => setEducationList(educationList.filter((_, idx) => idx !== i));

  // ── EXPERIENCIA ──
  const addExperience    = () => setExperienceList([...experienceList, { role: "", company: "", period: "", description: "" }]);
  const updateExperience = (i: number, field: keyof ExperienceEntry, val: string) => {
    const list = [...experienceList]; list[i] = { ...list[i], [field]: val }; setExperienceList(list);
  };
  const removeExperience = (i: number) => setExperienceList(experienceList.filter((_, idx) => idx !== i));

  // ── AVATAR ──
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  // ── PROCESAR CV CON GEMINI ──
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("El archivo no debe superar los 15MB");
      return;
    }

    const isPdf  = file.type === "application/pdf";
    const isWord = file.type.includes("wordprocessingml") || file.type.includes("msword");
    const isText = file.type.startsWith("text/");

    if (!isPdf && !isWord && !isText) {
      toast.error("Formato no soportado. Usa PDF, Word (.docx) o texto.");
      return;
    }

    setIsProcessingCV(true);
    setCvProcessed(false);
    toast.info("Analizando tu CV con IA...", { duration: 4000 });

    try {
      // Convertir a base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(file);
      });

      const body = isPdf
        ? { pdfBase64: base64 }
        : { fileBase64: base64, mimeType: file.type };

      const response = await fetch("/api/ai/process-cv-public", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al procesar el CV");

      const data = result.data;

      // En registro no hay validación de nombre — se llena todo libremente
      setFirstName(  data.firstName   || "");
      setLastName(   data.lastName    || "");
      setDesiredRole(data.desiredRole || "");
      setDescription(data.summary     || "");
      setSkills((data.skills || []).join("\n"));
      setResumeUrl(file.name);

      // Educación
      if (data.education?.length > 0) {
        setEducationList(data.education.map((edu: any) => {
          if (typeof edu === "object" && edu !== null) {
            return {
              degree:      String(edu.degree      || "").trim(),
              institution: String(edu.institution || "").trim(),
              year:        String(edu.year        || "").trim(),
            };
          }
          const raw = String(edu).trim();
          const sep = raw.includes(" – ") ? " – " : raw.includes(" | ") ? " | " : " - ";
          const parts = raw.split(sep);
          return { degree: parts[0]?.trim() || raw, institution: parts[1]?.trim() || "", year: parts[2]?.trim() || "" };
        }));
      }

      // Experiencia
      if (data.experience?.length > 0) {
        setExperienceList(data.experience.map((exp: any) => {
          if (typeof exp === "object" && exp !== null) {
            return {
              role:        String(exp.role        || "").trim(),
              company:     String(exp.company     || "").trim(),
              period:      String(exp.period      || "").trim(),
              description: String(exp.description || "").trim(),
            };
          }
          const raw = String(exp).trim();
          const sep = raw.includes(" – ") ? " – " : raw.includes(" | ") ? " | " : " - ";
          const parts = raw.split(sep);
          return { role: parts[0]?.trim() || raw, company: parts[1]?.trim() || "", period: parts[2]?.trim() || "", description: parts[3]?.trim() || "" };
        }));
      }

      setCvProcessed(true);
      toast.success("¡CV procesado! Revisa los datos y completa el formulario.");

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error al procesar el CV: ${msg}`);
    } finally {
      setIsProcessingCV(false);
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  };

  // ── SUBMIT ──
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    let avatarUrl = "";
    if (avatarFile) {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const { uploadAvatar } = await import("../actions/upload-avatar");
      const res = await uploadAvatar(fd);
      if (res.success) avatarUrl = res.url || "";
    }

    const data = {
      firstName,
      lastName,
      email:       formData.get("email")       as string,
      password:    formData.get("password")     as string,
      description: formData.get("description") as string || description,
      desiredRole: formData.get("desiredRole") as string || desiredRole,
      birthDate:   formData.get("birthDate")   as string,
      skills:      skills.split("\n").filter(s => s.trim() !== ""),
      role:        "CANDIDATE" as const,
      education:   educationList.map(e  => `${e.degree} | ${e.institution} | ${e.year}`),
      experience:  experienceList.map(e => `${e.role} | ${e.company} | ${e.period} | ${e.description}`),
      avatarUrl,
    };

    const result = await registerUser(data);
    setIsLoading(false);
    if (result.error) { toast.error(result.error); }
    else { toast.success("¡Cuenta creada exitosamente!"); router.push("/"); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-black">
      <header style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full px-6 py-4 flex items-center justify-between shadow-sm">
        <span className="text-black font-bold text-xl tracking-tight">ProfileManager</span>
        <LanguageSelector />
      </header>

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

            {/* ── BANNER CV CON IA ── */}
            <div className={`rounded-2xl border-2 border-dashed p-5 transition-all ${
              cvProcessed ? "border-green-300 bg-green-50" : "border-[#7FFFD4] bg-[#7FFFD4]/10"
            }`}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  cvProcessed ? "bg-green-100" : "bg-[#7FFFD4]/40"
                }`}>
                  {cvProcessed
                    ? <CheckCircle2 className="w-6 h-6 text-green-600" />
                    : <Sparkles className="w-6 h-6 text-[#2D8A75]" />}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-bold text-black text-sm">
                    {cvProcessed ? "¡CV procesado! Revisa los campos autocompletados" : "Autocompletar con CV (Opcional)"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {cvProcessed
                      ? "Puedes editar cualquier campo antes de crear tu cuenta"
                      : "Sube tu CV en PDF o Word y la IA completará el formulario automáticamente"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={isProcessingCV}
                  className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isProcessingCV
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : cvProcessed
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "text-black hover:opacity-90"
                  }`}
                  style={!isProcessingCV && !cvProcessed ? {
                    background: "linear-gradient(to right, #7FFFD4, #98FF98)"
                  } : {}}
                >
                  {isProcessingCV
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                    : cvProcessed
                    ? <><FileText className="w-4 h-4" /> Subir otro CV</>
                    : <><FileText className="w-4 h-4" /> Subir CV (PDF, Word)</>}
                </button>
              </div>
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={handleCVUpload}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* FOTO DE PERFIL */}
              <div className="space-y-3">
                <Label className="text-black font-bold flex items-center gap-2">
                  <User className="w-4 h-4" /> Foto de Perfil (Opcional)
                </Label>
                <div className="flex items-center gap-4">
                  <div onClick={() => avatarInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#5FD3BC] transition-colors overflow-hidden shrink-0">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      : <User className="w-10 h-10 text-gray-300" />}
                  </div>
                  <div className="flex-1">
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <button type="button" onClick={() => avatarInputRef.current?.click()}
                      className="text-sm border border-gray-300 rounded-lg px-4 py-2 text-gray-600 hover:border-[#5FD3BC] transition-colors">
                      {avatarPreview ? "Cambiar foto" : "Elegir archivo"}
                    </button>
                    {avatarPreview && (
                      <button type="button" onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                        className="ml-2 text-sm text-red-400 hover:text-red-600">Eliminar</button>
                    )}
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP · Máx 5MB</p>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN PERSONAL */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-black border-b pb-2">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Nombres *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ej: Juan Carlos" required className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Apellidos *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej: García López" required className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Fecha de Nacimiento *</Label>
                    <Input name="birthDate" type="date" required className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-semibold">Descripción Personal (Opcional)</Label>
                  <Textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Escribe una breve descripción de ti mismo"
                    className="min-h-[100px] text-black bg-gray-50 border-gray-300" />
                </div>
              </div>

              {/* CARGO DESEADO */}
              <div className="space-y-2">
                <Label className="text-black font-semibold">Cargo Deseado *</Label>
                <Input value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)}
                  name="desiredRole" placeholder="Ej: Desarrollador Backend" required
                  className="bg-gray-50 border-gray-300 text-black" />
              </div>

              {/* HABILIDADES */}
              <div className="space-y-2">
                <Label className="text-black font-semibold">Habilidades (Opcional)</Label>
                <p className="text-xs text-gray-400">Una por línea</p>
                <Textarea value={skills} onChange={(e) => setSkills(e.target.value)}
                  placeholder="React&#10;Node.js&#10;TypeScript"
                  className="min-h-[100px] text-black bg-gray-50 border-gray-300" />
              </div>

              {/* EDUCACIÓN */}
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
                    <button type="button" onClick={() => removeEducation(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-bold text-gray-400 uppercase">Educación</p>
                    <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="Título / Carrera" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} placeholder="Institución" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Input value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} placeholder="Año (Ej: 2019-2023)" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                  </div>
                ))}
                {educationList.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No hay entradas. Sube tu CV o haz clic en Agregar.</p>
                )}
              </div>

              {/* EXPERIENCIA */}
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
                    <button type="button" onClick={() => removeExperience(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-bold text-gray-400 uppercase">Experiencia</p>
                    <Input value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} placeholder="Cargo" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Empresa" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Input value={exp.period} onChange={(e) => updateExperience(i, "period", e.target.value)} placeholder="Período (Ej: 2020-2024)" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
                    <Textarea value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} placeholder="Descripción de responsabilidades..." className="min-h-[80px] rounded-lg text-black border-gray-200 bg-white" />
                  </div>
                ))}
                {experienceList.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No hay entradas. Sube tu CV o haz clic en Agregar.</p>
                )}
              </div>

              {/* CREDENCIALES */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-black border-b pb-2">Credenciales de Acceso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Correo electrónico *</Label>
                    <Input name="email" type="email" placeholder="tu@email.com" required className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Contraseña *</Label>
                    <Input name="password" type="password" placeholder="••••••••" required className="bg-gray-50 border-gray-300 text-black" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                className="w-full h-14 rounded-xl font-bold text-black text-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
                {isLoading ? <><Loader2 className="animate-spin w-5 h-5" /> Creando cuenta...</> : "Crear Cuenta"}
              </button>
            </form>

            <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-600 text-center">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/" className="text-[#5FD3BC] font-bold hover:underline">Inicia sesión aquí</Link>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <p className="text-sm text-gray-600">¿Eres una empresa?</p>
                <Link href="/register-company" className="w-full">
                  <button type="button" className="w-full h-11 rounded-lg font-bold text-black border border-gray-300 hover:bg-gray-50 transition-colors">
                    Registrar Empresa
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full py-4 text-center text-sm text-black/70 font-medium mt-8">
        © 2026 ProfileManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}