"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { Loader2, LockKeyhole, ArrowRight } from "lucide-react";
import { resetPassword } from "../actions/reset-password"; 

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("No se encontró un token válido en la URL.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 3) {
      toast.error("La contraseña debe ser más larga.");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await resetPassword(token, newPassword);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        setIsSuccess(true);
        toast.success("¡Contraseña actualizada con éxito!");
      }
    } catch (err) {
      toast.error("Ocurrió un error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 font-bold mb-4">Enlace de recuperación inválido o incompleto.</p>
        <Link href="/forgot-password">
          <Button className="bg-black text-[#7FFFD4]">Solicitar uno nuevo</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LockKeyhole className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-black">¡Todo listo!</h3>
        <p className="text-gray-600">Tu contraseña ha sido cambiada exitosamente.</p>
        <Link href="/">
          <Button className="w-full bg-[#7FFFD4] text-black font-bold hover:bg-[#5FD3BC] mt-4">
            Ir a Iniciar Sesión <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label className="text-black font-semibold block text-left">Nueva Contraseña</Label>
        <Input 
          type="password" 
          placeholder="••••••••" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required 
          className="bg-gray-50 border-gray-300 text-black" 
        />
      </div>
      <div className="space-y-2">
        <Label className="text-black font-semibold block text-left">Confirmar Contraseña</Label>
        <Input 
          type="password" 
          placeholder="••••••••" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
          className="bg-gray-50 border-gray-300 text-black" 
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-[#7FFFD4] text-black hover:bg-[#5FD3BC] font-bold transition-all mt-4"
      >
        {isLoading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : "Guardar Nueva Contraseña"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-md border-none bg-white text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-black">Crear nueva contraseña</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa tu nueva contraseña a continuación.
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-[#5FD3BC]" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}