// app/profile-company/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LanguageSelector from "../../components/ui/LanguageSelector";
import { getSessionUserId } from "../actions/auth";
import CompanyProfileForm from "./CompanyProfileForm";

export default async function ProfileCompanyPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const company = await prisma.company.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!company) {
    redirect("/dashboard-company");
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">

      {/* ─── HEADER ─── */}
      <header
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="py-4 px-6 flex justify-between items-center shadow-sm"
      >
        <h2 className="text-2xl font-black text-black tracking-tight">ProfileManager</h2>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 font-bold text-black text-sm">
            {company.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8">
        <Link href="/dashboard-company"
          className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 font-medium mb-6">
          <ArrowLeft className="w-5 h-5" /> Volver al Panel
        </Link>
        <CompanyProfileForm company={company} />
      </main>

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