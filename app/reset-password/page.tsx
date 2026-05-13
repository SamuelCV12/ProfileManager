/**
 * Página de restablecimiento de contraseña para la extensión de VSCode.
 * Permite a los usuarios ingresar una nueva contraseña utilizando un token de restablecimiento.
 * Se comunica con el servidor para actualizar la contraseña y muestra mensajes de éxito o error.
 * Si el token no es válido o ha expirado, muestra un mensaje de error y un enlace para solicitar un nuevo enlace de restablecimiento.
 */

"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { Loader2, LockKeyhole, ArrowRight } from "lucide-react";
import { resetPassword } from "../actions/reset-password";

function ResetPasswordForm() {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      toast.error(t.noValidToken);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.passwordsDontMatch);
      return;
    }

    if (newPassword.length < 3) {
      toast.error(t.passwordTooShort);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await resetPassword(token, newPassword);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        setIsSuccess(true);
        toast.success(t.passwordUpdatedSuccess);
      }
    } catch {
      toast.error(t.connectionErrorServer);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 font-bold mb-4">{t.invalidResetLink}</p>
        <Link href="/forgot-password">
          <Button className="bg-black text-[#7FFFD4]">{t.requestNewLink}</Button>
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
        <h3 className="text-2xl font-bold text-black">{t.allSetTitle}</h3>
        <p className="text-gray-600">{t.passwordChangedSuccess}</p>
        <Link href="/">
          <Button className="w-full bg-[#7FFFD4] text-black font-bold hover:bg-[#5FD3BC] mt-4">
            {t.goToLogin} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label className="text-black font-semibold block text-left">{t.newPasswordLabel}</Label>
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
        <Label className="text-black font-semibold block text-left">{t.confirmPasswordLabel}</Label>
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
        {isLoading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : t.saveNewPassword}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-md border-none bg-white text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-black">{t.createNewPasswordTitle}</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            {t.enterNewPasswordDesc}
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
