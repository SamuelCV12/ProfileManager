// app/profile-company/CompanyProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Save, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateCompany } from "../actions/company";
import { useLanguage } from "../../context/LanguageContext";

export default function CompanyProfileForm({ company }: any) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nit: "",
    location: "",
    coreBusiness: "",
    employeeCount: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name:          company.name || "",
        nit:           company.nit || "",
        location:      company.location || "",
        coreBusiness:  company.coreBusiness || "",
        employeeCount: company.employeeCount?.toString() || "",
      });
    }
  }, [company]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await updateCompany(company.id, {
      ...formData,
      employeeCount: parseInt(formData.employeeCount) || 0,
    });
    setIsLoading(false);
    if (result.success) {
      toast.success("¡Perfil de empresa actualizado!");
      router.refresh();
    } else {
      toast.error("Error al actualizar el perfil.");
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/40 flex items-center justify-center border-2 border-[#5FD3BC]/30">
            <Building2 className="w-6 h-6 text-[#2D8A75]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Perfil de Empresa</h2>
            <p className="text-sm text-gray-500">Actualiza los datos de tu empresa</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

        <div className="space-y-1.5">
          <Label className="font-semibold text-black">{t.companyName} *</Label>
          <Input name="name" value={formData.name} onChange={handleChange} required
            className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="font-semibold text-black">{t.nit} *</Label>
            <Input name="nit" value={formData.nit} onChange={handleChange} required
              className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
          </div>
          <div className="space-y-1.5">
            <Label className="font-semibold text-black">{t.locationLabel} *</Label>
            <Input name="location" value={formData.location} onChange={handleChange} required
              className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-black">{t.coreBusiness} *</Label>
          <Textarea name="coreBusiness" value={formData.coreBusiness} onChange={handleChange}
            placeholder="Describe el giro principal de tu empresa..."
            className="min-h-[100px] rounded-xl text-black border-gray-200 bg-gray-50" />
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-black">Número Aproximado de Empleados *</Label>
          <Input name="employeeCount" type="number" value={formData.employeeCount} onChange={handleChange}
            placeholder="Ej: 50"
            className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-black">Correo corporativo</Label>
          <Input value={company?.user?.email || ""} readOnly
            className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
        </div>

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