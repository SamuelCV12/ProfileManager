// app/profile/ProfileForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Loader2, Plus, Trash2, Camera, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import LanguageSelector from "../../components/ui/LanguageSelector";
import { useLanguage } from "../../context/LanguageContext";
import { updateProfile } from "../actions/profile";
import { uploadAvatar } from "../actions/upload-avatar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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

function getCompletionMessage(pct: number, t: any) {
  if (pct === 100) return t.profileCompleteMsg100;
  if (pct >= 80)  return t.profileCompleteMsg80;
  if (pct >= 50)  return t.profileCompleteMsg50;
  return t.profileCompleteMsgLow;
}

export default function ProfileForm({ profile }: any) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isProcessingCV, setIsProcessingCV] = useState(false);
  const [cvProcessed, setCvProcessed] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

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

  // ── SUBIR AVATAR ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    const fd = new FormData();
    fd.append("avatar", file);
    const result = await uploadAvatar(fd);
    setIsUploadingAvatar(false);

    if (result.error) {
      toast.error(result.error);
      setAvatarPreview(profile?.avatarUrl || null);
    } else {
      toast.success(t.avatarUploaded);
      setFormData(prev => ({ ...prev, avatarUrl: result.url } as any));
    }
  };

  // ── PROCESAR CV CON IA ──
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (15MB máx)
    if (file.size > 15 * 1024 * 1024) {
      toast.error(t.fileTooLarge);
      return;
    }

    const isPdf  = file.type === "application/pdf";
    const isWord = file.type.includes("wordprocessingml") || file.type.includes("msword");
    const isText = file.type.startsWith("text/");

    if (!isPdf && !isWord && !isText) {
      toast.error(t.unsupportedFormat);
      return;
    }

    setIsProcessingCV(true);
    setCvProcessed(false);
    toast.info(t.analyzingCV, { duration: 4000 });

    try {
      // Convertir archivo a base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(file);
      });

      // Llamar a la API — PDF va directo, Word/texto se extrae en servidor
      const body = isPdf
        ? { pdfBase64: base64 }
        : { fileBase64: base64, mimeType: file.type };

      const response = await fetch("/api/ai/process-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al procesar el CV");
      }

      const data = result.data;

      // ── VERIFICAR que el CV pertenece al usuario actual ──
      const profileFirstName = formData.firstName?.trim().toLowerCase();
      const profileLastName  = formData.lastName?.trim().toLowerCase();
      const cvFirstName      = data.firstName?.trim().toLowerCase();
      const cvLastName       = data.lastName?.trim().toLowerCase();

      // Solo validar si el perfil ya tiene nombre guardado
      if (profileFirstName && profileLastName && cvFirstName && cvLastName) {
        const firstNameMatch = profileFirstName.includes(cvFirstName) || cvFirstName.includes(profileFirstName);
        const lastNameMatch  = profileLastName.includes(cvLastName)   || cvLastName.includes(profileLastName);

        if (!firstNameMatch && !lastNameMatch) {
          toast.error(
            t.cvMismatchError
              .replace("{firstName}", data.firstName)
              .replace("{lastName}", data.lastName),
            { duration: 6000 }
          );
          setIsProcessingCV(false);
          if (cvInputRef.current) cvInputRef.current.value = "";
          return;
        }
      }

      // ── AUTOCOMPLETAR el formulario con los datos extraídos ──
      setFormData(prev => ({
        ...prev,
        // Campos de identidad: SOLO llenar si están vacíos — nunca sobreescribir
        firstName:   (!prev.firstName?.trim() && data.firstName)  ? data.firstName  : prev.firstName,
        lastName:    (!prev.lastName?.trim()  && data.lastName)   ? data.lastName   : prev.lastName,
        phone:       (!prev.phone?.trim()     && data.phone)      ? data.phone      : prev.phone,
        // Campos profesionales: actualizar siempre desde el CV
        desiredRole: data.desiredRole || prev.desiredRole,
        description: data.summary    || prev.description,
        // Skills: combinar existentes + nuevas del CV (sin duplicados)
        skills: mergeSkills(prev.skills, data.skills || []),
      }));

      // Autocompletar educación — siempre reemplaza con los datos del CV
      if (data.education && data.education.length > 0) {
        const parsedEdu: EducationEntry[] = data.education.map((edu: any) => {
          // Caso 1: Gemini devuelve objeto correcto { degree, institution, year }
          if (typeof edu === "object" && edu !== null) {
            return {
              degree:      String(edu.degree      || "").trim(),
              institution: String(edu.institution || "").trim(),
              year:        String(edu.year        || "").trim(),
            };
          }
          // Caso 2: Gemini devuelve string — parsear manualmente
          // Ej: "Ingeniería de Sistemas – Universidad EAFIT | En curso (2026)"
          const raw = String(edu).trim();
          let degree = raw, institution = "", year = "";

          if (raw.includes(" – ") && raw.includes(" | ")) {
            // Formato: "Título – Institución | Año"
            const [titlePart, yearPart] = raw.split(" | ");
            const [deg, inst] = titlePart.split(" – ");
            degree      = deg?.trim()      || raw;
            institution = inst?.trim()     || "";
            year        = yearPart?.trim() || "";
          } else if (raw.includes(" – ")) {
            const [deg, rest] = raw.split(" – ");
            degree      = deg?.trim()  || raw;
            institution = rest?.trim() || "";
          } else if (raw.includes(" | ")) {
            const parts = raw.split(" | ");
            degree      = parts[0]?.trim() || raw;
            institution = parts[1]?.trim() || "";
            year        = parts[2]?.trim() || "";
          }
          return { degree, institution, year };
        });
        setEducationList(parsedEdu);
      }

      // Autocompletar experiencia — siempre reemplaza con los datos del CV
      if (data.experience && data.experience.length > 0) {
        const parsedExp: ExperienceEntry[] = data.experience.map((exp: any) => {
          // Caso 1: Gemini devuelve objeto correcto { role, company, period, description }
          if (typeof exp === "object" && exp !== null) {
            return {
              role:        String(exp.role        || "").trim(),
              company:     String(exp.company     || "").trim(),
              period:      String(exp.period      || "").trim(),
              description: String(exp.description || "").trim(),
            };
          }
          // Caso 2: Gemini devuelve string — parsear manualmente
          // Ej: "Desarrollador Junior – Empresa X | Enero 2025 – Presente | Descripción..."
          const raw = String(exp).trim();
          let role = raw, company = "", period = "", description = "";

          if (raw.includes(" – ") && raw.includes(" | ")) {
            const parts = raw.split(" | ");
            const [r, c] = parts[0].split(" – ");
            role        = r?.trim()        || raw;
            company     = c?.trim()        || "";
            period      = parts[1]?.trim() || "";
            description = parts[2]?.trim() || "";
          } else if (raw.includes(" – ")) {
            const [r, rest] = raw.split(" – ");
            role    = r?.trim()    || raw;
            company = rest?.trim() || "";
          } else if (raw.includes(" | ")) {
            const parts = raw.split(" | ");
            role    = parts[0]?.trim() || raw;
            company = parts[1]?.trim() || "";
            period  = parts[2]?.trim() || "";
          }
          return { role, company, period, description };
        });
        setExperienceList(parsedExp);
      }

      setCvProcessed(true);
      toast.success(t.cvProcessedReview);

    } catch (err) {
      const msg = err instanceof Error ? err.message : t.unknownError;
      toast.error(t.cvProcessingError.replace("{error}", msg));
    } finally {
      setIsProcessingCV(false);
      // Limpiar el input para permitir re-subir el mismo archivo
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  };

  // Combina skills existentes con las nuevas sin duplicar
  function mergeSkills(existing: string, newSkills: string[]): string {
    const existingList = existing.split("\n").map(s => s.trim().toLowerCase()).filter(Boolean);
    const toAdd = newSkills.filter(s => !existingList.includes(s.toLowerCase()));
    if (toAdd.length === 0) return existing;
    return existing
      ? `${existing}\n${toAdd.join("\n")}`
      : toAdd.join("\n");
  }

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
      toast.success(t.profileUpdatedSuccess);
      router.refresh();
    } else {
      toast.error(t.profileUpdateError);
    }
  };

  const completitud = profile?.completitud || 0;

  const initials = profile?.firstName
    ? [profile.firstName, profile.lastName].filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="py-4 px-6 flex justify-between items-center shadow-sm"
      >
        <h2 className="text-2xl font-black text-black tracking-tight">ProfileManager</h2>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 font-bold text-black text-sm">
            {initials}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        <Link href="/dashboard"
          className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 font-medium mb-6">
          <ArrowLeft className="w-5 h-5" /> {t.backToDashboard}
        </Link>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      {/* ─── HEADER CARD ─── */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/40 flex items-center justify-center border-2 border-[#5FD3BC]/30">
            <User className="w-6 h-6 text-[#2D8A75]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">{t.myProfile}</h2>
            <p className="text-sm text-gray-500">{t.profileSubtitle}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">{t.profileCompletion}</span>
            <span className="font-bold text-black">{completitud}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#5FD3BC] to-[#7FFFD4] transition-all duration-1000 rounded-full"
              style={{ width: `${completitud}%` }} />
          </div>
          <p className="text-xs text-gray-400">{getCompletionMessage(completitud, t)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8">

        {/* ─── BANNER: SUBIR CV CON IA ─── */}
        <div className={`rounded-2xl border-2 border-dashed p-5 transition-all ${
          cvProcessed
            ? "border-green-300 bg-green-50"
            : "border-[#7FFFD4] bg-[#7FFFD4]/10"
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
                {cvProcessed ? t.cvSuccess : t.autocompleteCV}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {cvProcessed
                  ? t.reviewCV
                  : t.uploadCVDesc}
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
              {isProcessingCV ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t.processing}</>
              ) : cvProcessed ? (
                <><FileText className="w-4 h-4" /> {t.uploadAnotherCV}</>
              ) : (
                <><FileText className="w-4 h-4" /> {t.uploadCV}</>
              )}
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
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#5FD3BC] flex items-center justify-center shadow-md hover:bg-[#7FFFD4] transition-colors">
              {isUploadingAvatar
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Camera className="w-4 h-4 text-white" />}
            </button>
          </div>
          <p className="text-sm text-gray-500">{t.profilePhoto}</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={handleAvatarChange} />
          <p className="text-xs text-gray-400">{t.photoFormat}</p>
        </div>

        {/* ─── INFORMACIÓN PERSONAL ─── */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2">{t.personalInfo}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">{t.firstName} *</Label>
              <Input name="firstName" value={formData.firstName} onChange={handleChange} required
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">{t.lastName} *</Label>
              <Input name="lastName" value={formData.lastName} onChange={handleChange} required
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">{t.birthDate} *</Label>
              <Input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange}
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">{t.phone} *</Label>
              <Input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                placeholder={t.phonePlaceholder}
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">{t.email} *</Label>
              <Input value={profile?.user?.email || ""} readOnly
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-black">{t.desiredRole} *</Label>
              <Input name="desiredRole" value={formData.desiredRole} onChange={handleChange}
                placeholder={t.desiredRolePlaceholder}
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-semibold text-black">{t.description} *</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange}
              placeholder={t.aboutYouPlaceholder}
              className="min-h-[100px] rounded-xl text-black border-gray-200 bg-gray-50" />
          </div>
        </section>

        {/* ─── HABILIDADES ─── */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2">{t.skills}</h3>
          <Label className="text-sm text-gray-500">{t.onePerLine}</Label>
          <Textarea name="skills" value={formData.skills} onChange={handleChange}
            className="min-h-[120px] rounded-xl text-black border-gray-200 bg-gray-50" />
        </section>

        {/* ─── EDUCACIÓN ─── */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-black">{t.education}</h3>
            <button type="button" onClick={addEducation}
              style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-bold text-black hover:opacity-90">
              <Plus className="w-4 h-4" /> {t.add}
            </button>
          </div>
          {educationList.map((edu, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative">
              <button type="button" onClick={() => removeEducation(i)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.education}</p>
              <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)}
                placeholder={t.degree} className="h-10 rounded-lg text-black border-gray-200 bg-white" />
              <Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)}
                placeholder={t.institution} className="h-10 rounded-lg text-black border-gray-200 bg-white" />
              <Input value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)}
                placeholder={t.year} className="h-10 rounded-lg text-black border-gray-200 bg-white" />
            </div>
          ))}
          {educationList.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">{t.noEducation}</p>
          )}
        </section>

        {/* ─── EXPERIENCIA LABORAL ─── */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-black">{t.workExperience}</h3>
            <button type="button" onClick={addExperience}
              style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-bold text-black hover:opacity-90">
              <Plus className="w-4 h-4" /> {t.add}
            </button>
          </div>
          {experienceList.map((exp, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative">
              <button type="button" onClick={() => removeExperience(i)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.experience}</p>
              <Input value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)}
                placeholder={t.role} className="h-10 rounded-lg text-black border-gray-200 bg-white" />
              <Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)}
                placeholder={t.company} className="h-10 rounded-lg text-black border-gray-200 bg-white" />
              <Input value={exp.period} onChange={(e) => updateExperience(i, "period", e.target.value)}
                placeholder={t.period} className="h-10 rounded-lg text-black border-gray-200 bg-white" />
              <Textarea value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)}
                placeholder={t.responsibilities}
                className="min-h-[80px] rounded-lg text-black border-gray-200 bg-white" />
            </div>
          ))}
          {experienceList.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">{t.noExperience}</p>
          )}
        </section>

        {/* ─── BOTONES ─── */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={isLoading}
            style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
            className="flex-1 h-12 rounded-xl font-bold text-black hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.saving}</>
              : <><Save className="w-5 h-5" /> {t.saveChanges}</>}
          </button>
          <button type="button" onClick={() => window.history.back()}
            className="flex-1 h-12 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            {t.cancel}
          </button>
        </div>
      </form>
        </div>
      </main>

      <footer
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full py-4 text-center text-sm text-black/70 font-medium mt-8"
      >
        {t.allRightsReserved}
      </footer>
    </div>
  );
}