import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

const EmailVerified = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        // Get the current session after email verification
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setIsVerified(true);
          // Redirect to account page after 3 seconds
          setTimeout(() => {
            window.location.href = '/account';
          }, 3000);
        } else {
          setIsVerified(false);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerification();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nuabok-yellow via-nuabok-cream to-nuabok-mint flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-nuabok-navy mb-4" />
            <p className="text-nuabok-navy">Verificando tu email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nuabok-yellow via-nuabok-cream to-nuabok-mint flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src="/lovable-uploads/301af982-f0a4-462c-800b-7b1c363b974e.png" 
            alt="Nuabok" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-nuabok-navy">
            {isVerified ? '¡Email Verificado!' : 'Error de Verificación'}
          </CardTitle>
          <CardDescription>
            {isVerified 
              ? 'Tu cuenta ha sido verificada exitosamente. Serás redirigido a tu cuenta en unos segundos.' 
              : 'Hubo un problema al verificar tu email. Por favor, intenta nuevamente o inicia sesión.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerified ? (
            <Button 
              onClick={() => window.location.href = '/account'}
              className="w-full bg-nuabok-navy text-white hover:bg-nuabok-navy/90"
            >
              Ir a Mi Cuenta
            </Button>
          ) : (
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full bg-nuabok-navy text-white hover:bg-nuabok-navy/90"
            >
              Ir a Iniciar Sesión
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerified;