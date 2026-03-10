// app/profile/page.tsx
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import prisma from "../../lib/prisma";
import ProfileForm from "./ProfileForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProfilePage({ searchParams }: any) {
  const profileId = searchParams?.id;

  // ✅ SOLUCIÓN: Agregamos orderBy para que PostgreSQL siempre traiga los datos en el mismo orden
  const profile = await prisma.profile.findFirst({
    where: profileId ? { id: profileId } : undefined,
    orderBy: { id: 'asc' }, // <-- ESTA LÍNEA ES LA CLAVE DE LA SOLUCIÓN
    include: { user: true }
  });

  if (!profile) {
    return <div className="p-8 text-center text-red-500 font-bold">Perfil no encontrado. Debes registrarte primero.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-[#7FFFD4] py-4 px-6 flex justify-between items-center shadow-sm">
        <h2 className="text-2xl font-black text-black tracking-tight">ProfileManager</h2>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-black border border-gray-100">
           {profile?.firstName?.charAt(0) || "U"}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 font-medium">
            <ArrowLeft className="w-5 h-5" /> Volver al Dashboard
          </Link>
        </div>
        
        <ProfileForm profile={profile} />
      </main>
    </div>
  );
}