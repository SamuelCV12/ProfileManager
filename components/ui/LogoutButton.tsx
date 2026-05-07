// components/ui/LogoutButton.tsx
"use client";

/**
 * LogoutButton.tsx
 * 
 * Componente de botón para cerrar sesión. Al hacer clic, elimina la cookie de sesión y redirige al usuario a la página de inicio.
 * Utiliza la función logoutUser del archivo app/actions/auth.ts para manejar la lógica de cierre de sesión en el servidor, y luego usa useRouter de Next.js para redirigir al usuario.
 * 
 * Este componente se puede colocar en el header o en cualquier parte de la interfaz donde el usuario deba tener la opción de cerrar sesión.
 */

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutUser } from "../../app/actions/auth";
import { Button } from "./button";
import { broadcast } from "@/lib/tab-sync";
import { useLanguage } from "../../context/LanguageContext";

export default function LogoutButton() { 
const router = useRouter();
const { t } = useLanguage();
const handleLogout = async () => {
    await logoutUser();
    broadcast('LOGOUT');
    router.push("/");
};

return (
    <Button
    variant="outline"
    onClick={handleLogout}
    className="h-9 border-black/20 text-black font-semibold rounded-xl hover:bg-white/50 gap-2"
    >
    <LogOut className="w-4 h-4" /> {t.logout}
    </Button>
);
}