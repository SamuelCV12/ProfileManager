"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, X, Briefcase, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { registerCompany } from "../actions/register-company";
import LanguageSelector from "@/components/ui/LanguageSelector";

export default function RegisterCompanyPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [roles, setRoles] = useState<{ title: string; description: string; salary: string }[]>([]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleSalary, setNewRoleSalary] = useState("");

  const handleAddRole = () => {
    if (newRoleTitle.trim() === "") return;
    setRoles([...roles, { title: newRoleTitle, description: newRoleDescription, salary: newRoleSalary }]);
    setNewRoleTitle("");
    setNewRoleDescription("");
    setNewRoleSalary("");
    setIsAddingRole(false);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formDataRaw = new FormData(e.currentTarget);
    const data = Object.fromEntries(formDataRaw.entries());
    try {
      const result = await registerCompany(data, roles);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.companyRegistered);
        router.push("/");
      }
    } catch {
      toast.error(t.serverError);
    } finally {
      setIsLoading(false);
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

          {/* Header de la card */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <Link href="/" className="flex items-center text-sm text-gray-500 hover:text-black mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> {t.backToLogin}
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#7FFFD4] rounded-full flex items-center justify-center shadow-inner">
                <Building2 className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">{t.registerCompany}</h1>
                <p className="text-gray-500 text-sm mt-0.5">{t.companyRegisterDesc}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">

            {/* --- INFORMACIÓN DE LA EMPRESA --- */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2">{t.companyInfo}</h3>

              <div className="space-y-2">
                <Label className="text-black font-semibold text-sm">{t.companyName}</Label>
                <Input name="name" placeholder={t.companyNamePlaceholder} required
                  className="h-11 bg-gray-50 border-gray-200 text-black" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-black font-semibold text-sm">{t.nit}</Label>
                  <Input name="nit" placeholder={t.nitPlaceholder} required
                    className="h-11 bg-gray-50 border-gray-200 text-black" />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-semibold text-sm">{t.locationLabel}</Label>
                  <Input name="location" placeholder={t.locationPlaceholder} required
                    className="h-11 bg-gray-50 border-gray-200 text-black" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-black font-semibold text-sm">{t.coreBusiness}</Label>
                <textarea name="coreBusiness" required
                  className="flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5FD3BC]"
                  placeholder={t.coreBusinessPlaceholder} />
              </div>

              <div className="space-y-2">
                <Label className="text-black font-semibold text-sm">{t.employeeCount}</Label>
                <Input name="employeeCount" type="number" placeholder={t.employeeCountPlaceholder} required
                  className="h-11 bg-gray-50 border-gray-200 text-black" />
              </div>
            </section>

            {/* ─── CARGOS DISPONIBLES ─── */}
            <section className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-black">{t.availablePositions}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{t.positionsDesc}</p>
                </div>
                {!isAddingRole && (
                  <button type="button" onClick={() => setIsAddingRole(true)}
                    style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg font-bold text-black text-sm hover:opacity-90">
                    <Plus className="w-4 h-4" /> {t.addPosition}
                  </button>
                )}
              </div>

              {/* Formulario nueva vacante */}
              {isAddingRole && (
                <div className="p-6 border-2 border-[#5FD3BC] rounded-xl bg-[#7FFFD4]/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#5FD3BC]/30 pb-3">
                    <h4 className="font-bold text-black flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#5FD3BC]" /> {t.newVacancy}
                    </h4>
                    <button type="button" onClick={() => setIsAddingRole(false)} className="text-gray-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-black font-semibold text-sm">{t.positionTitle}</Label>
                      <Input placeholder={t.positionTitlePlaceholder} value={newRoleTitle}
                        onChange={(e) => setNewRoleTitle(e.target.value)}
                        className="h-11 bg-white border-gray-200 text-black" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-black font-semibold text-sm">{t.positionInfo}</Label>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5FD3BC]"
                        placeholder={t.positionInfoPlaceholder}
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)} />
                    </div>
                    {/* ✅ CAMPO SALARIO */}
                    <div className="space-y-1">
                      <Label className="text-black font-semibold text-sm">{t.salary}</Label>
                      <Input placeholder={t.salaryPlaceholder} value={newRoleSalary}
                        onChange={(e) => setNewRoleSalary(e.target.value)}
                        className="h-11 bg-white border-gray-200 text-black" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setIsAddingRole(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        {t.cancel}
                      </button>
                      <button type="button" onClick={handleAddRole}
                        className="px-6 py-2 text-sm font-bold bg-black text-[#7FFFD4] rounded-lg hover:bg-gray-800 transition-colors">
                        {t.savePosition}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de cargos agregados */}
              <div className="space-y-3">
                {roles.map((role, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl bg-white hover:border-[#5FD3BC] transition-all">
                    <div className="flex gap-3">
                      <div className="p-2 bg-[#7FFFD4]/20 rounded-lg mt-0.5">
                        <Briefcase className="w-4 h-4 text-[#5FD3BC]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-black">{role.title}</h4>
                        {role.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{role.description}</p>}
                        {role.salary && <p className="text-xs text-[#2D8A75] font-semibold mt-1">$ {parseInt(role.salary).toLocaleString("es-CO")} COP</p>}
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveRole(index)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── CREDENCIALES ─── */}
            <section className="space-y-4 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2">{t.accessCredentials}</h3>
              <div className="space-y-2">
                <Label className="text-black font-semibold text-sm">{t.corporateEmail}</Label>
                <Input name="email" type="email" placeholder={t.corporateEmailPlaceholder} required
                  className="h-11 bg-gray-50 border-gray-200 text-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-black font-semibold text-sm">{t.password}</Label>
                <Input name="password" type="password" placeholder={t.passwordPlaceholder} required
                  className="h-11 bg-gray-50 border-gray-200 text-black" />
              </div>
            </section>

            {/* ─── BOTÓN REGISTRAR ─── */}
            <button type="submit" disabled={isLoading}
              style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
              className="w-full h-14 rounded-xl font-bold text-black text-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.processingButton}</> : t.registerButton}
            </button>

            {/* ─── LINKS ─── */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                {t.alreadyAccount}{" "}
                <Link href="/" className="text-[#5FD3BC] font-bold hover:underline">{t.loginHere}</Link>
              </div>
              <div className="text-sm text-gray-600">
                {t.areYouCandidate}{" "}
                <Link href="/register" className="text-[#5FD3BC] font-bold hover:underline">{t.individualRegistration}</Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full py-4 text-center text-sm text-black/70 font-medium mt-8"
      >
        {t.allRightsReserved}
      </footer>
    </div>
  );
}