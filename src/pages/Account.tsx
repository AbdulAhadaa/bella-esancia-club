import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { LogOut, TrendingUp, Camera, Award, Target, Expand } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, LabelList } from "recharts";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  skin_type?: string;
  total_scans: number;
  last_scan_date?: string;
  last_scan_summary?: string;
  created_at: string;
}

interface HistoricScan {
  id: string;
  date_scan?: string;
  global_score?: number;
  pigment?: number;
  pore?: number;
  large_pore?: number;
  medium_pore?: number;
  small_pore?: number;
  sensitivity?: number;
  spot?: number;
  wrinkle?: number;
  nasolabial_folds?: number;
  forehead_wrinkles?: number;
  perioral_lines?: number;
  glabellar_lines?: number;
  crows_feet?: number;
  under_eye_wrinkles?: number;
  blackhead?: number;
  dark_circles?: number;
  acne?: number;
  pore_diagnostic_image?: string;
  wrinkle_diagnostic_image?: string;
}

interface InventoryProduct {
  id: string;
  name: string;
  brand?: string;
  price: number;
  image?: string;
  description?: string;
  effectiveness_pigment?: boolean;
  effectiveness_pore?: boolean;
  effectiveness_large_pore?: boolean;
  effectiveness_medium_pore?: boolean;
  effectiveness_small_pore?: boolean;
  effectiveness_wrinkle?: boolean;
  effectiveness_sensitivity?: boolean;
  effectiveness_spot?: boolean;
  effectiveness_acne?: boolean;
  effectiveness_blackhead?: boolean;
  effectiveness_dark_circles?: boolean;
}

interface UserProduct {
  id: string;
  name: string;
  brand?: string;
  price: number;
  image?: string;
  quantity: number;
  order_date: string;
}

const Account = () => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [scans, setScans] = useState<HistoricScan[]>([]);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        window.location.href = '/auth';
        return;
      }

      setUser(session.user);
      await loadCustomerData(session.user.email!);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerData = async (email: string) => {
    try {
      // Check if customer exists
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError;
      }

      let finalCustomer = customerData;
      
      if (!customerData) {
        // Create new customer if doesn't exist
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert([
            {
              email: email,
              name: user?.user_metadata?.full_name || 'Usuario',
              total_scans: 0
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        finalCustomer = newCustomer;
        setCustomer(newCustomer);
      } else {
        setCustomer(customerData);
      }

      // Load scan history
      const { data: scanData, error: scanError } = await supabase
        .from('historic_scans')
        .select('*')
        .eq('client_email', email)
        .order('date_scan', { ascending: false });

      if (scanError) throw scanError;
      setScans(scanData || []);

      // Load recommended products based on scan results
      await loadRecommendedProducts(scanData?.[0]);
      
      // Load user's purchased products
      if (finalCustomer?.id) {
        await loadUserProducts(finalCustomer.id);
      }

    } catch (error) {
      console.error('Error loading customer data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de tu cuenta",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-muted";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreText = (score?: number) => {
    if (!score) return "Sin datos";
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bueno";
    if (score >= 40) return "Regular";
    return "Necesita atención";
  };

  const calculateTrend = (current: number, previous: number) => {
    const diff = current - previous;
    return diff > 0 ? "mejora" : diff < 0 ? "deterioro" : "sin cambios";
  };

  const loadRecommendedProducts = async (latestScan: HistoricScan | null) => {
    if (!latestScan) return;

    try {
      let query = supabase.from('inventory').select('*');
      
      // Filter products based on skin issues
      const conditions = [];
      
      if ((latestScan.pigment || 0) > 50) conditions.push('effectiveness_pigment.eq.true');
      if ((latestScan.pore || 0) > 50) conditions.push('effectiveness_pore.eq.true');
      if ((latestScan.large_pore || 0) > 50) conditions.push('effectiveness_large_pore.eq.true');
      if ((latestScan.wrinkle || 0) > 50) conditions.push('effectiveness_wrinkle.eq.true');
      if ((latestScan.sensitivity || 0) > 50) conditions.push('effectiveness_sensitivity.eq.true');
      if ((latestScan.spot || 0) > 50) conditions.push('effectiveness_spot.eq.true');
      if ((latestScan.acne || 0) > 50) conditions.push('effectiveness_acne.eq.true');
      if ((latestScan.blackhead || 0) > 50) conditions.push('effectiveness_blackhead.eq.true');
      if ((latestScan.dark_circles || 0) > 50) conditions.push('effectiveness_dark_circles.eq.true');

      if (conditions.length > 0) {
        // Apply OR logic for effectiveness filters
        query = query.or(conditions.join(','));
      }

      const { data: productData, error: productError } = await query.limit(6);
      
      if (productError) throw productError;
      setProducts(productData || []);

    } catch (error) {
      console.error('Error loading recommended products:', error);
    }
  };

  const loadUserProducts = async (customerId: string) => {
    if (!customerId) return;

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('products, order_date')
        .eq('customer_id', customerId)
        .order('order_date', { ascending: false });

      if (orderError) throw orderError;

      // Flatten products from all orders and remove duplicates
      const allProducts: UserProduct[] = [];
      const productMap = new Map();

      orderData?.forEach(order => {
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach((product: any) => {
            const key = `${product.name}-${product.brand || ''}`;
            if (!productMap.has(key)) {
              productMap.set(key, {
                id: product.id || Date.now().toString(),
                name: product.name,
                brand: product.brand,
                price: product.price || 0,
                image: product.image,
                quantity: product.quantity || 1,
                order_date: order.order_date
              });
            } else {
              // If product exists, increase quantity
              const existing = productMap.get(key);
              existing.quantity += (product.quantity || 1);
            }
          });
        }
      });

      setUserProducts(Array.from(productMap.values()));

    } catch (error) {
      console.error('Error loading user products:', error);
    }
  };

  const prepareChartData = () => {
    return scans.slice(0, 5).reverse().map((scan, index) => ({
      scan: `#${index + 1}`,
      score: Math.round(scan.global_score || 0),
      date: new Date(scan.date_scan || '').toLocaleDateString()
    }));
  };

  const chartConfig = {
    score: {
      label: "Puntuación",
      color: "hsl(var(--primary))",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nuabok-yellow via-nuabok-cream to-nuabok-mint flex items-center justify-center">
        <div className="text-lg text-nuabok-navy">Cargando tu cuenta...</div>
      </div>
    );
  }

  const latestScan = scans[0];
  const previousScan = scans[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-nuabok-yellow via-nuabok-cream to-nuabok-mint">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Profile Header */}
          <Card className="border-nuabok-navy/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-nuabok-navy flex items-center">
                  <Award className="mr-3 h-8 w-8 text-nuabok-navy" />
                  ¡Hola, {customer?.name}!
                </CardTitle>
                <CardDescription>
                  Miembro desde {new Date(customer?.created_at || '').toLocaleDateString()}
                </CardDescription>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </CardHeader>
          </Card>

          {!latestScan ? (
            <Card className="border-nuabok-navy/20">
              <CardContent className="text-center py-12">
                <Camera className="mx-auto h-16 w-16 text-nuabok-navy/60 mb-4" />
                <h3 className="text-xl font-semibold text-nuabok-navy mb-2">
                  Aún no tienes análisis faciales
                </h3>
                <p className="text-muted-foreground mb-6">
                  Visita nuestras tiendas para realizar tu primer análisis facial personalizado
                </p>
                <Button className="bg-nuabok-navy text-white hover:bg-nuabok-navy/90">
                  <Target className="mr-2 h-4 w-4" />
                  Agendar cita
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Main Score Display */}
              <Card className="border-nuabok-navy/20 bg-gradient-to-r from-nuabok-cream to-nuabok-mint">
                <CardHeader>
                  <CardTitle className="text-center text-nuabok-navy text-3xl flex items-center justify-center">
                    <Award className="mr-3 h-10 w-10" />
                    Puntuación Global
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative mx-auto w-48 h-48 mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-nuabok-navy to-nuabok-mint opacity-20"></div>
                    <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-nuabok-navy">
                          {Math.round(latestScan.global_score || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">de 100</div>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
                    {getScoreText(latestScan.global_score)}
                  </Badge>
                  
                  <p className="text-muted-foreground">
                    Último análisis: {new Date(latestScan.date_scan || '').toLocaleDateString()}
                  </p>
                  
                  {previousScan && (
                    <div className="mt-4 flex items-center justify-center text-sm">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Tendencia: {calculateTrend(latestScan.global_score || 0, previousScan.global_score || 0)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Pores Analysis */}
                <Card className="border-nuabok-navy/20">
                  <CardHeader>
                    <CardTitle className="text-nuabok-navy">Análisis de Poros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Poros grandes</span>
                        <span className="font-medium">{Math.round(latestScan.large_pore || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.large_pore || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Poros medianos</span>
                        <span className="font-medium">{Math.round(latestScan.medium_pore || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.medium_pore || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Poros pequeños</span>
                        <span className="font-medium">{Math.round(latestScan.small_pore || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.small_pore || 0} className="h-2" />
                    </div>
                     {latestScan.pore_diagnostic_image && (
                       <div className="mt-4">
                         <Dialog>
                           <DialogTrigger asChild>
                             <div className="relative cursor-pointer group">
                               <img 
                                 src={latestScan.pore_diagnostic_image} 
                                 alt="Análisis de poros"
                                 className="w-full h-32 object-cover rounded-lg transition-opacity group-hover:opacity-75"
                               />
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Expand className="h-8 w-8 text-white bg-black/50 p-1 rounded-full" />
                               </div>
                             </div>
                           </DialogTrigger>
                           <DialogContent className="max-w-2xl">
                             <img 
                               src={latestScan.pore_diagnostic_image} 
                               alt="Análisis de poros - Vista completa"
                               className="w-full h-auto rounded-lg"
                             />
                           </DialogContent>
                         </Dialog>
                       </div>
                     )}
                  </CardContent>
                </Card>

                {/* Wrinkles Analysis */}
                <Card className="border-nuabok-navy/20">
                  <CardHeader>
                    <CardTitle className="text-nuabok-navy">Análisis de Arrugas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Arrugas generales</span>
                        <span className="font-medium">{Math.round(latestScan.wrinkle || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.wrinkle || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Líneas nasolabiales</span>
                        <span className="font-medium">{Math.round(latestScan.nasolabial_folds || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.nasolabial_folds || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Patas de gallo</span>
                        <span className="font-medium">{Math.round(latestScan.crows_feet || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.crows_feet || 0} className="h-2" />
                    </div>
                     {latestScan.wrinkle_diagnostic_image && (
                       <div className="mt-4">
                         <Dialog>
                           <DialogTrigger asChild>
                             <div className="relative cursor-pointer group">
                               <img 
                                 src={latestScan.wrinkle_diagnostic_image} 
                                 alt="Análisis de arrugas"
                                 className="w-full h-32 object-cover rounded-lg transition-opacity group-hover:opacity-75"
                               />
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Expand className="h-8 w-8 text-white bg-black/50 p-1 rounded-full" />
                               </div>
                             </div>
                           </DialogTrigger>
                           <DialogContent className="max-w-2xl">
                             <img 
                               src={latestScan.wrinkle_diagnostic_image} 
                               alt="Análisis de arrugas - Vista completa"
                               className="w-full h-auto rounded-lg"
                             />
                           </DialogContent>
                         </Dialog>
                       </div>
                     )}
                  </CardContent>
                </Card>

                {/* Pigmentation & Spots */}
                <Card className="border-nuabok-navy/20">
                  <CardHeader>
                    <CardTitle className="text-nuabok-navy">Pigmentación y Manchas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Pigmentación</span>
                        <span className="font-medium">{Math.round(latestScan.pigment || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.pigment || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Manchas</span>
                        <span className="font-medium">{Math.round(latestScan.spot || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.spot || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Ojeras</span>
                        <span className="font-medium">{Math.round(latestScan.dark_circles || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.dark_circles || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Skin Condition */}
                <Card className="border-nuabok-navy/20">
                  <CardHeader>
                    <CardTitle className="text-nuabok-navy">Condición de la Piel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Sensibilidad</span>
                        <span className="font-medium">{Math.round(latestScan.sensitivity || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.sensitivity || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Acné</span>
                        <span className="font-medium">{Math.round(latestScan.acne || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.acne || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Puntos negros</span>
                        <span className="font-medium">{Math.round(latestScan.blackhead || 0)}/100</span>
                      </div>
                      <Progress value={latestScan.blackhead || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Historical Trends Chart */}
              {scans.length > 1 && (
                <Card className="border-nuabok-navy/20">
                  <CardHeader>
                    <CardTitle className="text-nuabok-navy flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Progreso de Puntuación Global (Últimos 5 Análisis)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={prepareChartData()} 
                          margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
                        >
                          <XAxis 
                            dataKey="scan" 
                            tick={{ fontSize: 14, fontWeight: 600 }}
                            tickLine={false}
                            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
                          />
                          <ChartTooltip 
                            content={
                              <ChartTooltipContent 
                                formatter={(value, name) => [
                                  `${value}/100`,
                                  "Puntuación Global"
                                ]}
                                labelFormatter={(label, payload) => {
                                  const data = payload?.[0]?.payload;
                                  return data ? `Análisis ${label} - ${data.date}` : label;
                                }}
                              />
                            }
                          />
                          <Bar 
                            dataKey="score" 
                            fill="hsl(var(--primary))"
                            radius={[8, 8, 0, 0]}
                          >
                            <LabelList 
                              dataKey="score" 
                              position="top" 
                              style={{ 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                fill: 'hsl(var(--foreground))' 
                              }} 
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* User's Current Products */}
              {userProducts.length > 0 && (
                <Card className="border-nuabok-navy/20">
                  <CardHeader>
                    <CardTitle className="text-nuabok-navy flex items-center">
                      <Award className="mr-2 h-5 w-5" />
                      Mis Productos Actuales
                    </CardTitle>
                    <CardDescription>
                      Productos que ya tienes en tu rutina de cuidado facial.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userProducts.map((product) => (
                        <div key={`${product.id}-${product.name}`} className="border rounded-lg p-4 space-y-3 bg-nuabok-cream/30">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-nuabok-navy">{product.name}</h4>
                            {product.brand && (
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-lg font-bold text-nuabok-navy">
                                ${product.price.toFixed(2)}
                              </p>
                              <Badge variant="secondary">
                                Cantidad: {product.quantity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Comprado: {new Date(product.order_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommended Products */}
              {products.length > 0 && (
                <Card className="border-nuabok-navy/20">
                  <CardHeader>
                    <CardTitle className="text-nuabok-navy flex items-center">
                      <Target className="mr-2 h-5 w-5" />
                      Productos Recomendados para Ti
                    </CardTitle>
                    <CardDescription>
                      Basado en tu último análisis facial, estos productos pueden ayudarte a mejorar las áreas que necesitan atención.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 space-y-3">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-nuabok-navy">{product.name}</h4>
                            {product.brand && (
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                            )}
                            <p className="text-lg font-bold text-nuabok-navy mt-2">
                              ${product.price.toFixed(2)}
                            </p>
                            {product.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <Button className="w-full bg-nuabok-navy hover:bg-nuabok-navy/90">
                            Ver Producto
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Account;