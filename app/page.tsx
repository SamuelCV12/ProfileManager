// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner"; 
import { loginUser } from "@/app/actions/auth"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<"candidato" | "empresa">("candidato");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Llamamos a la base de datos a través de la Server Action
    const result = await loginUser({ email, password, tipoUsuario });
    
    setIsLoading(false);

    if (result.error) {
      // Si hay error, mostramos el mensaje que nos devolvió el servidor
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success("¡Inicio de sesión exitoso!");
      // Redirigimos al dashboard correspondiente
      if (tipoUsuario === "empresa") {
        router.push("/dashboard-company");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-black">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-600">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Selector de tipo de usuario */}
            <div className="space-y-2">
              <Label className="text-black">Tipo de cuenta</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoUsuario("candidato")}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    tipoUsuario === "candidato"
                      ? "border-[#5FD3BC] bg-[#7FFFD4]/10"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Users className={`w-6 h-6 ${tipoUsuario === "candidato" ? "text-[#5FD3BC]" : "text-gray-600"}`} />
                  <span className={`text-sm ${tipoUsuario === "candidato" ? "text-black font-medium" : "text-gray-600"}`}>
                    Candidato
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTipoUsuario("empresa")}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    tipoUsuario === "empresa"
                      ? "border-[#5FD3BC] bg-[#7FFFD4]/10"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Briefcase className={`w-6 h-6 ${tipoUsuario === "empresa" ? "text-[#5FD3BC]" : "text-gray-600"}`} />
                  <span className={`text-sm ${tipoUsuario === "empresa" ? "text-black font-medium" : "text-gray-600"}`}>
                    Empresa
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 text-black"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 text-black"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#7FFFD4] to-[#98FF98] text-black hover:opacity-90 mt-2 font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
        </CardContent>
        
        {/* SECCIÓN ACTUALIZADA DE ENLACES CON EL MISMO COLOR AZUL */}
        <CardFooter className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600 text-center w-full">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-bold">
              Regístrate aquí
            </Link>
          </div>
          <div className="text-sm text-gray-600 text-center w-full">
            ¿Olvidaste tu contraseña?{" "}
            <Link href="/forgot-password" className="text-blue-600 hover:underline font-bold">
              Recupera tu cuenta aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}