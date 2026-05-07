// app/profile-company/CompanyProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Building2, Loader2 } from "lucide-react";
import LanguageSelector from "../../components/ui/LanguageSelector";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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
      toast.success(t.companyProfileUpdated);
      router.refresh();
    } else {
      toast.error(t.companyProfileUpdateError);
    }
  };

  const initials = company?.name
    ? company.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
    : "E";

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

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8">
        <Link href="/dashboard-company"
          className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 font-medium mb-6">
          <ArrowLeft className="w-5 h-5" /> {t.backToPanelCompany}
        </Link>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#7FFFD4]/40 flex items-center justify-center border-2 border-[#5FD3BC]/30">
                <Building2 className="w-6 h-6 text-[#2D8A75]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">{t.companyProfileTitle}</h2>
                <p className="text-sm text-gray-500">{t.companyProfileSubtitle}</p>
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
              <Label className="font-semibold text-black">{t.coreBusiness}</Label>
              <Textarea name="coreBusiness" value={formData.coreBusiness} onChange={handleChange}
                placeholder={t.coreBusinessPlaceholder}
                className="min-h-[100px] rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-black">{t.employeeCountLabel}</Label>
              <Input name="employeeCount" type="number" value={formData.employeeCount} onChange={handleChange}
                placeholder={t.employeeCountPlaceholder}
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-black">{t.corporateEmailLabel}</Label>
              <Input value={company?.user?.email || ""} readOnly
                className="h-11 rounded-xl text-black border-gray-200 bg-gray-50" />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="submit" disabled={isLoading}
                style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                className="flex-1 h-12 rounded-xl font-bold text-black hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
                {isLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.savingLoading}</>
                  : <><Save className="w-5 h-5" /> {t.saveChangesBtn}</>}
              </button>
              <button type="button" onClick={() => window.history.back()}
                className="flex-1 h-12 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                {t.cancelBtn}
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
