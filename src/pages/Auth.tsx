import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        window.location.href = '/account';
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          window.location.href = '/account';
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setLoading(true);

    try {
        if (isSignUp) {
        const name = formData.get('name') as string;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/email-verified`,
            data: {
              full_name: name
            }
          }
        });

        if (error) throw error;

        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu email para confirmar tu cuenta.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nuabok-yellow via-nuabok-cream to-nuabok-mint flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>¡Bienvenido!</CardTitle>
            <CardDescription>Ya has iniciado sesión correctamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/account'}
              className="w-full bg-nuabok-navy text-white hover:bg-nuabok-navy/90"
            >
              Ir a mi cuenta
            </Button>
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
          <CardTitle className="text-2xl text-nuabok-navy">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Únete a Nuabok y accede a tu scanner facial personalizado' 
              : 'Accede a tu cuenta de Nuabok'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <Input
                  name="name"
                  type="text"
                  placeholder="Nombre completo"
                  required
                  className="w-full"
                />
              </div>
            )}
            <div>
              <Input
                name="email"
                type="email"
                placeholder="Correo electrónico"
                required
                className="w-full"
              />
            </div>
            <div>
              <Input
                name="password"
                type="password"
                placeholder="Contraseña"
                required
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-nuabok-navy text-white hover:bg-nuabok-navy/90"
            >
              {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-nuabok-navy hover:text-nuabok-navy/80"
            >
              {isSignUp 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;