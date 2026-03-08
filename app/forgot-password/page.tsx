"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { requestPasswordReset } from "../actions/reset-password"; 

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
    try {
      // AQUÍ ESTÁ LA MAGIA: Llamamos a tu servidor de verdad
      const result = await requestPasswordReset(email);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        setEmailSent(true);
        toast.success("¡Revisa tu terminal de VS Code!");
      }
    } catch (err) {
      toast.error("Ocurrió un error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-md border-none bg-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-[#7FFFD4]/20 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-[#5FD3BC]" />
          </div>
          <CardTitle className="text-2xl font-bold text-black">Recuperar tu cuenta</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            {!emailSent 
              ? "Ingresa tu correo electrónico y te enviaremos un enlace seguro." 
              : "Revisa la terminal de VS Code para ver el enlace secreto."}
          </p>
        </CardHeader>
        
        <CardContent className="pt-4">
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-black font-semibold text-left block">Correo electrónico *</Label>
                <Input 
                  name="email" 
                  type="email" 
                  placeholder="Ej: tu@email.com" 
                  required 
                  className="bg-gray-50 border-gray-300 text-black" 
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-[#7FFFD4] text-black hover:bg-[#5FD3BC] font-bold transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <><Mail className="w-4 h-4 mr-2" /> Generar enlace de recuperación</>}
              </Button>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 text-sm font-semibold mb-4">
                ¡Enlace generado exitosamente! Míralo en VS Code.
              </p>
              <Button 
               variant="outline" // O quita el variant si usas uno personalizado
               className="w-full h-11 bg-[#7FFFD4] text-black font-bold hover:bg-[#5FD3BC] border-none transition-all rounded-lg shadow-sm"
              >
               Intentar con otro correo
              </Button>
            </div>
          )}

          <div className="text-center pt-6 mt-4 border-t border-gray-100">
            <Link href="/" className="text-sm text-gray-500 hover:text-black flex items-center justify-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}