// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/app/actions/auth";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { broadcast } from "@/lib/tab-sync";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<"candidato" | "empresa">("candidato");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await loginUser({ email, password, tipoUsuario });
    setIsLoading(false);
    if (result.error) { toast.error(result.error); return; }
    if (result.success) {
      toast.success("¡Inicio de sesión exitoso!");
      router.refresh(); // Revalida server data
      await new Promise(r => setTimeout(r, 500)); // Delay para hydration
      broadcast('LOGIN');
      router.push(tipoUsuario === "empresa" ? "/dashboard-company" : "/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ─── HEADER ─── */}
      <header
        style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
        className="w-full px-6 py-4 flex items-center justify-between shadow-sm"
      >
        <span className="text-black font-bold text-xl tracking-tight">ProfileManager</span>
        <LanguageSelector />
      </header>

      {/* ─── CONTENIDO CENTRAL ─── */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-gray-200 bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-black font-bold">{t.loginTitle}</CardTitle>
            <CardDescription className="text-gray-600">
              {t.loginDesc}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-black">{t.accountType}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setTipoUsuario("candidato")}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      tipoUsuario === "candidato" ? "border-[#5FD3BC] bg-[#7FFFD4]/10" : "border-gray-300 hover:border-gray-400"
                    }`}>
                    <Users className={`w-6 h-6 ${tipoUsuario === "candidato" ? "text-[#5FD3BC]" : "text-gray-600"}`} />
                    <span className={`text-sm ${tipoUsuario === "candidato" ? "text-black font-bold" : "text-gray-600"}`}>{t.candidate}</span>
                  </button>
                  <button type="button" onClick={() => setTipoUsuario("empresa")}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      tipoUsuario === "empresa" ? "border-[#5FD3BC] bg-[#7FFFD4]/10" : "border-gray-300 hover:border-gray-400"
                    }`}>
                    <Briefcase className={`w-6 h-6 ${tipoUsuario === "empresa" ? "text-[#5FD3BC]" : "text-gray-600"}`} />
                    <span className={`text-sm ${tipoUsuario === "empresa" ? "text-black font-bold" : "text-gray-600"}`}>{t.company}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">{t.email}</Label>
                <Input id="email" type="email" placeholder="tu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required className="border-gray-300 text-black bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">{t.password}</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required className="border-gray-300 text-black bg-gray-50" />
              </div>

              <button type="submit" disabled={isLoading}
                style={{ background: "linear-gradient(to right, #7FFFD4, #98FF98)" }}
                className="w-full h-10 rounded-md font-bold text-black hover:opacity-90 transition-opacity mt-2 flex items-center justify-center disabled:opacity-60">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.connecting}</> : t.login}
              </button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600 text-center w-full">
              {t.noAccount}{" "}
              <Link href="/register" className="text-[#5FD3BC] hover:underline font-bold">{t.register}</Link>
            </div>
            <div className="text-sm text-gray-600 text-center w-full">
              {t.forgotPassword}{" "}
              <Link href="/forgot-password" className="text-[#5FD3BC] hover:underline font-bold">{t.recoverAccount}</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}