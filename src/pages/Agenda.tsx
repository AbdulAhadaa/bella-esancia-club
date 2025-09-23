import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Calendar, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

const Agenda = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const COLOMBIA_TIMEZONE = 'America/Bogota';

  // Available time slots for appointments (30 min intervals) in Colombian time
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  // Generate available dates (next 30 days, excluding weekends) in Colombian timezone
  const getAvailableDates = () => {
    const dates = [];
    const today = toZonedTime(new Date(), COLOMBIA_TIMEZONE);
    
    for (let i = 1; i <= 20; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkCustomerData(session.user.email!);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkCustomerData(session.user.email!);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkCustomerData = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCustomerData(data);
        setShowAppointmentForm(true);
      }
    } catch (error: any) {
      console.error('Error checking customer data:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/agenda`
          }
        });

        if (error) throw error;

        // Create customer record
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            name,
            email,
            id: undefined // Let the database generate the ID
          });

        if (customerError) throw customerError;

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

  // Send calendar invites
  const sendCalendarInvites = async (customerEmail: string, date: string, time: string, customerName: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-calendar-invite', {
        body: {
          customerEmail,
          date,
          time,
          customerName,
          timezone: COLOMBIA_TIMEZONE
        },
      });

      if (error) {
        console.error('Failed to send calendar invite:', error);
      }
    } catch (error) {
      console.error('Error sending calendar invite:', error);
    }
  };

  const handleAppointmentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dateStr = formData.get('appointment_date') as string;
    const timeStr = formData.get('appointment_time') as string;
    
    // Convert Colombian time to UTC for storage
    const colombianDateTime = new Date(`${dateStr}T${timeStr}:00`);
    const utcDateTime = fromZonedTime(colombianDateTime, COLOMBIA_TIMEZONE);
    
    const appointmentData = {
      customer_id: customerData?.id,
      customer_name: customerData?.name || formData.get('customer_name') as string,
      appointment_date: dateStr,
      appointment_time: timeStr,
      appointment_datetime_utc: utcDateTime.toISOString(),
      service: 'Scanner Facial',
      skin_problems: formData.get('skin_problems') as string,
      current_routine: formData.get('current_routine') as string,
      desired_results: formData.get('desired_results') as string,
    };

    setLoading(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .insert(appointmentData);

      if (error) throw error;

      // Send calendar invites
      if (user?.email && customerData?.name) {
        await sendCalendarInvites(
          user.email,
          dateStr,
          timeStr,
          customerData.name
        );
      }

      toast({
        title: "¡Cita agendada!",
        description: "Tu cita para el scanner facial ha sido agendada exitosamente. Recibirás un email con los detalles del calendario.",
      });

      // Reset form or redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
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

  if (user && showAppointmentForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nuabok-yellow via-nuabok-cream to-nuabok-mint flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <img 
              src="/lovable-uploads/301af982-f0a4-462c-800b-7b1c363b974e.png" 
              alt="Nuabok" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <CardTitle className="text-2xl text-nuabok-navy flex items-center justify-center gap-2">
              <Calendar className="h-6 w-6" />
              Agenda tu Scanner Facial
            </CardTitle>
            <CardDescription>
              Selecciona la fecha y hora que mejor te convenga para tu análisis de piel personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAppointmentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuabok-navy mb-2">
                    Fecha de la cita
                  </label>
                  <select
                    name="appointment_date"
                    required
                    className="w-full p-3 border border-input rounded-md bg-background"
                  >
                    <option value="">Selecciona una fecha</option>
                    {availableDates.map((date) => (
                      <option key={format(date, 'yyyy-MM-dd')} value={format(date, 'yyyy-MM-dd')}>
                        {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuabok-navy mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Hora (Hora de Colombia)
                  </label>
                  <select
                    name="appointment_time"
                    required
                    className="w-full p-3 border border-input rounded-md bg-background"
                  >
                    <option value="">Selecciona una hora</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nuabok-navy mb-2">
                  ¿Qué problemas de piel te preocupan más?
                </label>
                <Input
                  name="skin_problems"
                  placeholder="Ej: acné, manchas, arrugas, sensibilidad..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nuabok-navy mb-2">
                  ¿Cuál es tu rutina actual de skincare?
                </label>
                <Input
                  name="current_routine"
                  placeholder="Describe brevemente tu rutina actual..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nuabok-navy mb-2">
                  ¿Qué resultados esperas obtener?
                </label>
                <Input
                  name="desired_results"
                  placeholder="Ej: piel más hidratada, reducir manchas, anti-aging..."
                  className="w-full"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-nuabok-navy text-white hover:bg-nuabok-navy/90 py-3"
                size="lg"
              >
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </Button>
            </form>
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
            {isSignUp ? 'Crear Cuenta para Agendar' : 'Iniciar Sesión'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Crea tu cuenta para agendar tu scanner facial' 
              : 'Accede a tu cuenta para agendar tu cita'
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
              {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta y Continuar' : 'Iniciar Sesión'}
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

export default Agenda;