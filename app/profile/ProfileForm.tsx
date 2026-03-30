// app/profile/ProfileForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../actions/profile";
import { uploadAvatar } from "../actions/upload-avatar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Save, User, Loader2, Plus, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";

type EducationEntry = { degree: string; institution: string; year: string };
type ExperienceEntry = { role: string; company: string; period: string; description: string };

function parseEducation(arr: string[]): EducationEntry[] {
  return arr.map((item) => {
    const parts = item.split(" | ");
    return { degree: parts[0] || "", institution: parts[1] || "", year: parts[2] || "" };
  });
}

function parseExperience(arr: string[]): ExperienceEntry[] {
  return arr.map((item) => {
    const parts = item.split(" | ");
    return { role: parts[0] || "", company: parts[1] || "", period: parts[2] || "", description: parts[3] || "" };
  });
}

function serializeEducation(list: EducationEntry[]): string[] {
  return list.map((e) => [e.degree, e.institution, e.year].join(" | "));
}

function serializeExperience(list: ExperienceEntry[]): string[] {
  return list.map((e) => [e.role, e.company, e.period, e.description].join(" | "));
}

function getCompletionMessage(pct: number) {
  if (pct === 100) return "¡Perfecto! Tu perfil está completo 🎉";
  if (pct >= 80)  return "¡Excelente! Tu perfil está casi completo";
  if (pct >= 50)  return "Buen progreso, sigue completando tu perfil";
  return "Completa tu perfil para mejorar tus oportunidades";
}

export default function ProfileForm({ profile }: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", desiredRole: "", description: "",
    skills: "", birthDate: "", phone: "",
  });

  const [educationList, setEducationList] = useState<EducationEntry[]>([]);
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        desiredRole: profile.desiredRole || "",
        description: profile.description || "",
        skills: profile.skills?.join("\n") || "",
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split("T")[0] : "",
        phone: profile.phone || "",
      });
      setAvatarPreview(profile.avatarUrl || null);

      const edu = profile.education || [];
      setEducationList(
        edu.length > 0 && edu[0].includes(" | ")
          ? parseEducation(edu)
          : edu.map((e: string) => ({ degree: e, institution: "", year: "" }))
      );

      const exp = profile.experience || [];
      setExperienceList(
        exp.length > 0 && exp[0].includes(" | ")
          ? parseExperience(exp)
          : exp.map((e: string) => ({ role: e, company: "", period: "", description: "" }))
      );
    }
  }, [profile]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Subir avatar al seleccionar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview inmediato
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Subir al servidor
    setIsUploadingAvatar(true);
    const fd = new FormData();
    fd.append("avatar", file);
    const result = await uploadAvatar(fd);
    setIsUploadingAvatar(false);

    if (result.error) {
      toast.error(result.error);
      setAvatarPreview(profile?.avatarUrl || null);
    } else {
      toast.success("Foto subida. Guarda los cambios para confirmar.");
      // Guardamos la URL en formData para que se envíe al guardar
      setFormData(prev => ({ ...prev, avatarUrl: result.url } as any));
    }
  };

  const addEducation    = () => setEducationList([...educationList, { degree: "", institution: "", year: "" }]);
  const updateEducation = (i: number, field: keyof EducationEntry, val: string) => {
    const list = [...educationList]; list[i] = { ...list[i], [field]: val }; setEducationList(list);
  };
  const removeEducation = (i: number) => setEducationList(educationList.filter((_, idx) => idx !== i));

  const addExperience    = () => setExperienceList([...experienceList, { role: "", company: "", period: "", description: "" }]);
  const updateExperience = (i: number, field: keyof ExperienceEntry, val: string) => {
    const list = [...experienceList]; list[i] = { ...list[i], [field]: val }; setExperienceList(list);
  };
  const removeExperience = (i: number) => setExperienceList(experienceList.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = {
      ...formData,
      skills: formData.skills.split("\n").filter((s: string) => s.trim() !== ""),
      education: serializeEducation(educationList),
      experience: serializeExperience(experienceList),
    };
    const result = await updateProfile(profile.id, dataToSave);
    setIsLoading(false);
    if (result.success) {
      toast.success("¡Perfil actualizado con éxito!");
      router.refresh();
    } else {
      toast.error("Error al actualizar el perfil.");
    }
  };

  const completitud = profile?.completitud || 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      {/* ─── HEADER CARD ─── */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/40 flex items-center justify-center border-2 border-[#5FD3BC]/30">
            <User className="w-6 h-6 text-[#2D8A75]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Mi Perfil</h2>
            <p className="text-sm text-gray-500">Actualiza tu información personal y profesional</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Completado del perfil</span>
            <span className="font-bold text-black">{completitud}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#5FD3BC] to-[#7FFFD4] transition-all duration-1000 rounded-full"
              style={{ width: `${completitud}%` }} />
          </div>
          <p className="text-xs text-gray-400">{getCompletionMessage(completitud)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8">

        {/* ─── FOTO DE PERFIL ─── */}
        <div className="flex flex-col items-center gap-2 pb-4 border-b border-gray-100">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-300" />
              )}
            </div>
            {/* Botón cámara sobre la foto */}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#5FD3BC] flex items-center justify-center shadow-md hover:bg-[#7FFFD4] transition-colors">
              {isUploadingAvatar
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Camera className="w-4 h-4 text-white" />}
            </button>
          </div>
          <p className="text-sm text-gray-500">Foto de Perfil</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={handleAvatarChange} />
          <p className="text-xs text-gray-400">JPG, PNG o WEBP · Máx 5MB</p>
        </div>

        {/* ─── INFORMACIÓN PERSONAL ─── */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">Nombres *</Label>
              <Input name="firstName" value={formData.firstName} onChange={handleChange} required
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">Apellidos *</Label>
              <Input name="lastName" value={formData.lastName} onChange={handleChange} required
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">Fecha de Nacimiento *</Label>
              <Input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange}
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">Teléfono *</Label>
              <Input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                placeholder="+57 300 123 4567"
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">Correo electrónico *</Label>
              <Input value={profile?.user?.email || ""} readOnly
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">Cargo Deseado *</Label>
              <Input name="desiredRole" value={formData.desiredRole} onChange={handleChange}
                placeholder="Ej: Desarrollador Backend"
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-semibold text-black">Descripción Personal *</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange}
              placeholder="Cuéntanos sobre ti..."
              className="min-h-[100px] rounded-xl text-black border-gray-200 bg-gray-50" />
          </div>
        </section>

        {/* ─── HABILIDADES ─── */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2">Habilidades</h3>
          <Label className="text-sm text-gray-500">Una por línea</Label>
          <Textarea name="skills" value={formData.skills} onChange={handleChange}
            className="min-h-[120px] rounded-xl text-black border-gray-200 bg-gray-50" />
        </section>

        {/* ─── EDUCACIÓN ─── */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-black">Educación</h3>
            <button type="button" onClick={addEducation}
              style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-bold text-black hover:opacity-90">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
          {educationList.map((edu, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative">
              <button type="button" onClick={() => removeEducation(i)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Educación</p>
              <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)}
                placeholder="Título / Carrera" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
              <Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)}
                placeholder="Institución" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
              <Input value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)}
                placeholder="Año (Ej: 2019-2023)" className="h-10 rounded-lg text-black border-gray-200 bg-white" />
            </div>
          ))}
          {educationList.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No hay entradas de educación. Haz clic en Agregar.</p>
          )}
        </section>

        {/* ─── EXPERIENCIA LABORAL ─── */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-black">Experiencia Laboral</h3>
            <button type="button" onClick={addExperience}
              style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-bold text-black hover:opacity-90">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
          {experienceList.map((exp, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative">
              <button type="button" onClick={() => removeExperience(i)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Experiencia</p>
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
          {experienceList.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No hay entradas de experiencia. Haz clic en Agregar.</p>
          )}
        </section>

        {/* ─── BOTONES ─── */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={isLoading}
            style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
            className="flex-1 h-12 rounded-xl font-bold text-black hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
              : <><Save className="w-5 h-5" /> Guardar Cambios</>}
          </button>
          <button type="button" onClick={() => window.history.back()}
            className="flex-1 h-12 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}