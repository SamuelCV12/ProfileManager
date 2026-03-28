// components/ui/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutUser } from "../../app/actions/auth";
import { Button } from "./button";

export default function LogoutButton() {
const router = useRouter();
const handleLogout = async () => {
    await logoutUser();
    router.push("/");
};

return (
    <Button
    variant="outline"
    onClick={handleLogout}
    className="h-9 border-black/20 text-black font-semibold rounded-xl hover:bg-white/50 gap-2"
    >
    <LogOut className="w-4 h-4" /> Cerrar Sesión
    </Button>
);
}