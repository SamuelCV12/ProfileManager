// app/profile/page.tsx
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import prisma from "../../lib/prisma";
import ProfileForm from "./ProfileForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LanguageSelector from "../../components/ui/LanguageSelector";

export default async function ProfilePage({ searchParams }: any) {
  const profileId = searchParams?.id;

  const profile = await prisma.profile.findFirst({
    where: profileId ? { id: profileId } : undefined,
    orderBy: { id: "asc" },
    include: { user: true },
  });

  if (!profile) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Perfil no encontrado. Debes registrarte primero.
      </div>
    );
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
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        <Link href="/dashboard"
          className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 font-medium mb-6">
          <ArrowLeft className="w-5 h-5" /> Volver al Dashboard
        </Link>
        <ProfileForm profile={profile} />
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