import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coffee, LogOut, ShoppingBag, CreditCard, Gift, Download, Loader2 } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { customerStorage, type CustomerProfile, type LocalOrder } from "@/lib/customer-storage";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { useQuery } from "@tanstack/react-query";

export default function CustomerProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { customer, logout } = useCustomer();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [cardQrUrl, setCardQrUrl] = useState<string>("");

  const { data: serverOrders = [], isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ["/api/orders/customer", customer?.phone],
    enabled: !!customer?.phone,
    queryFn: async () => {
      const res = await fetch(`/api/orders/customer/${customer?.phone}`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  useEffect(() => {
    const loadedProfile = customerStorage.getProfile();
    if (!loadedProfile && !customer) {
      setLocation("/auth");
      return;
    }
    
    const activeProfile = loadedProfile || (customer as unknown as CustomerProfile);
    setProfile(activeProfile);

    // Generate QR code for the card
    const cardData = JSON.stringify({
      cardNumber: activeProfile.cardNumber,
      name: activeProfile.name,
      phone: activeProfile.phone
    });
    QRCode.toDataURL(cardData, { width: 200, margin: 1 }).then(setCardQrUrl);
  }, [setLocation, customer]);

  const handleLogout = () => {
    logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "نراك قريباً!"
    });
    setLocation("/auth");
  };

  const handleDownloadCard = () => {
    if (!cardQrUrl) return;

    const link = document.createElement('a');
    link.download = `qahwa-card-${profile?.cardNumber}.png`;
    link.href = cardQrUrl;
    link.click();

    toast({
      title: "تم التنزيل",
      description: "تم تنزيل بطاقتك بنجاح"
    });
  };

  if (!profile) return null;

  const nextFreeDrinkProgress = (profile.stamps / 5) * 100;

  // Combine local and server orders, avoiding duplicates by orderNumber
  const localOrders = customerStorage.getOrders();
  const allOrders = [...serverOrders];
  
  localOrders.forEach(local => {
    if (!allOrders.find(s => s.orderNumber === local.orderNumber)) {
      allOrders.push(local);
    }
  });

  // Sort by date descending
  allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 backdrop-blur border-b border-primary/30 p-4">
        <div className="container mx-auto flex justify-between items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-accent flex items-center gap-2">
              <Coffee className="w-6 h-6" />
              CLUNY CAFE
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-accent hover:text-accent"
            data-testid="button-logout"
          >
            <LogOut className="ml-2 w-4 h-4" />
            تسجيل خروج
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Profile Card */}
        <Card className="mb-6 bg-primary/20 border-primary/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-accent">مرحباً، {profile.name}</CardTitle>
            <CardDescription className="text-accent/70">{profile.phone}</CardDescription>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-primary/20 border border-primary/30 gap-1">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary" data-testid="tab-orders">
              <ShoppingBag className="ml-2 w-4 h-4" />
              طلباتي
            </TabsTrigger>
            <TabsTrigger value="card" className="data-[state=active]:bg-primary" data-testid="tab-card">
              <CreditCard className="ml-2 w-4 h-4" />
              بطاقاتي
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4 space-y-4">
            {isLoadingOrders ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : allOrders.length === 0 ? (
              <Card className="bg-primary/20 border-primary/30 backdrop-blur">
                <CardContent className="p-8 text-center text-accent/70">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات سابقة</p>
                </CardContent>
              </Card>
            ) : (
              allOrders.map((order) => (
                <Card key={order.id || order.orderNumber} className="bg-primary/20 border-primary/30 backdrop-blur" data-testid={`order-${order.orderNumber}`}>
                  <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-lg text-accent">
                        طلب #{order.orderNumber}
                      </CardTitle>
                      <CardDescription className="text-accent/70">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-primary">
                        {order.totalAmount} ر.س
                      </Badge>
                      {order.status && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-primary/30 text-accent/70">
                          {order.status === 'completed' ? 'مكتمل' : 
                           order.status === 'pending' ? 'قيد الانتظار' :
                           order.status === 'preparing' ? 'جاري التحضير' : order.status}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm text-accent">
                          <span>{item.nameAr || item.coffeeItem?.nameAr || 'منتج'} × {item.quantity}</span>
                          <span className="text-accent">{(item.price * item.quantity).toFixed(2)} ر.س</span>
                        </div>
                      ))}
                      {order.usedFreeDrink && (
                        <Badge variant="outline" className="border-green-500 text-green-400 mt-2">
                          <Gift className="ml-1 w-3 h-3" />
                          استخدمت مشروب مجاني
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Card Tab */}
          <TabsContent value="card" className="mt-4">
            <div className="perspective-1000">
              <Card className="relative h-64 w-full max-w-md mx-auto bg-gradient-to-br from-[#1a1a1a] via-[#2d1e12] to-[#1a1a1a] text-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 transform transition-all duration-500">
                {/* Visual Texture */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                
                {/* Chip & NFC */}
                <div className="absolute top-10 left-8 w-12 h-9 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-200 rounded-md shadow-inner flex flex-col justify-around p-1 overflow-hidden">
                   <div className="h-px bg-black/20 w-full" />
                   <div className="h-px bg-black/20 w-full" />
                   <div className="h-px bg-black/20 w-full" />
                </div>
                
                {/* Logo & Title */}
                <div className="absolute top-6 right-8 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Coffee className="w-8 h-8 text-amber-500" />
                    <h2 className="text-xl font-bold tracking-tighter text-amber-500" style={{fontFamily: 'serif'}}>CLUNY CAFE</h2>
                  </div>
                  <p className="text-[9px] tracking-[0.3em] text-amber-500/60 uppercase mt-0.5 font-medium">PREMIUM LOYALTY</p>
                </div>

                {/* Card Number */}
                <div className="absolute top-[45%] left-8 transform -translate-y-1/2 w-full">
                  <p className="text-2xl font-mono tracking-[0.25em] text-white/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {profile?.cardNumber ? profile.cardNumber.match(/.{1,4}/g)?.join(' ') : '**** **** **** ****'}
                  </p>
                </div>

                {/* Card Holder & QR */}
                <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[8px] text-white/40 uppercase tracking-[0.2em]">Card Holder</p>
                    <p className="text-base font-bold tracking-wider uppercase text-white/90">{profile?.name || 'Customer'}</p>
                  </div>
                  
                  {cardQrUrl && (
                    <div className="bg-white p-1 rounded-md shadow-lg border border-white/20">
                      <img src={cardQrUrl} alt="QR Code" className="w-16 h-16" />
                    </div>
                  )}
                </div>

                {/* Corner Accents */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
              </Card>
            </div>

            {/* Loyalty Stats - High Contrast Section */}
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      i <= profile.stamps 
                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg scale-110' 
                        : 'bg-primary/10 border-primary/20 text-accent/20'
                    }`}
                  >
                    <Coffee className={`w-5 h-5 ${i <= profile.stamps ? 'opacity-100' : 'opacity-20'}`} />
                  </div>
                ))}
              </div>

              <Card className="bg-primary/20 border-primary/30 backdrop-blur overflow-hidden">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Gift className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-accent">المشروبات المجانية</p>
                      <p className="text-xs text-accent/60">يمكن استبدالها عند الدفع</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500 text-white text-lg px-3 py-1 h-auto">
                    {profile.freeDrinks}
                  </Badge>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  onClick={handleDownloadCard}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-11"
                  data-testid="button-download-card"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تحميل البطاقة
                </Button>
                <div className="flex items-center justify-center bg-primary/20 rounded-lg border border-primary/30 px-4 h-11">
                  <span className="text-xs text-accent/70 font-bold">
                    خصم 10%
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={() => setLocation("/menu")}
          variant="outline"
          className="w-full mt-6 border-primary/50 text-accent hover:bg-primary/30"
          data-testid="button-back-menu"
        >
          العودةللقائمة 
        </Button>
      </div>
    </div>
  );
}
