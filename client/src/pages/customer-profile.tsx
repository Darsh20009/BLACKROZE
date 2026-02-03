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
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";

export default function CustomerProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { customer, logout } = useCustomer();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [cardQrUrl, setCardQrUrl] = useState<string>("");

  const { card: loyaltyCard, isLoading: isLoadingCard } = useLoyaltyCard();

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
    
    // Redirect to /my-card as per unified interface request
    setLocation("/my-card");
    return;
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Coffee className="w-6 h-6" />
              BLACK ROSE
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/20"
            data-testid="button-logout"
          >
            <LogOut className="ml-2 w-4 h-4" />
            تسجيل خروج
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Profile Card */}
        <Card className="mb-6 bg-white border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">مرحباً، {profile.name}</CardTitle>
            <CardDescription className="text-muted-foreground">{profile.phone}</CardDescription>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary border border-border gap-1">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white" data-testid="tab-orders">
              <ShoppingBag className="ml-2 w-4 h-4" />
              طلباتي
            </TabsTrigger>
            <TabsTrigger value="card" className="data-[state=active]:bg-primary data-[state=active]:text-white" data-testid="tab-card">
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
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات سابقة</p>
                </CardContent>
              </Card>
            ) : (
              allOrders.map((order) => (
                <Card key={order.id || order.orderNumber} className="bg-white border-border shadow-sm" data-testid={`order-${order.orderNumber}`}>
                  <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        طلب #{order.orderNumber}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
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
                      <Badge className="bg-primary text-white">
                        {order.totalAmount} ر.س
                      </Badge>
                      {order.status && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-border text-muted-foreground">
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
                        <div key={idx} className="flex justify-between text-sm text-foreground">
                          <span>{item.nameAr || item.coffeeItem?.nameAr || 'منتج'} × {item.quantity}</span>
                          <span className="text-muted-foreground">{(item.price * item.quantity).toFixed(2)} ر.س</span>
                        </div>
                      ))}
                      {order.usedFreeDrink && (
                        <Badge variant="outline" className="border-green-500 text-green-600 mt-2">
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
              <div className="relative h-56 w-full max-w-sm mx-auto rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]" style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)'
              }}>
                {/* Card Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="15" r="1" fill="white"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                
                {/* EMV Chip */}
                <div className="absolute top-8 left-6">
                  <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-md shadow-lg">
                    <div className="absolute inset-1 border border-yellow-600/30 rounded-sm" />
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-yellow-600/40" />
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-yellow-600/40" />
                  </div>
                </div>
                
                {/* Contactless Icon */}
                <div className="absolute top-8 left-20">
                  <svg className="w-6 h-6 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6" />
                    <path d="M11.5 16.5A2.5 2.5 0 0014 14c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6" />
                  </svg>
                </div>
                
                {/* Logo & Brand */}
                <div className="absolute top-6 right-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm p-1.5 border border-white/30">
                      <Coffee className="w-full h-full text-white" />
                    </div>
                  </div>
                </div>

                {/* Card Number */}
                <div className="absolute top-[55%] left-6 right-6 transform -translate-y-1/2">
                  <p className="text-[22px] font-mono tracking-[0.25em] text-white drop-shadow-lg" style={{fontFamily: 'Monaco, monospace'}}>
                    {profile?.cardNumber ? profile.cardNumber.match(/.{1,4}/g)?.join(' ') : '•••• •••• •••• ••••'}
                  </p>
                </div>

                {/* Bottom Info Row */}
                <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[8px] text-white/50 uppercase tracking-[0.15em]">CARD HOLDER</p>
                    <p className="text-sm font-semibold tracking-wider uppercase text-white">{profile?.name || 'Customer'}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[8px] text-white/50 uppercase tracking-[0.15em]">MEMBER SINCE</p>
                    <p className="text-sm font-semibold text-white">2026</p>
                  </div>
                </div>

                {/* Brand Name Bottom */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                  <p className="text-[10px] text-white/70 font-bold tracking-[0.3em]">BLACK ROSE</p>
                </div>

                {/* Shine Effect */}
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-12 translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
              </div>
            </div>
            
            {/* QR Code Section */}
            {cardQrUrl && (
              <div className="mt-6 flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-lg border border-border">
                  <img src={cardQrUrl} alt="QR Code" className="w-32 h-32" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">امسح الكود للحصول على نقاطك</p>
              </div>
            )}

            {/* Loyalty Stats Below Card */}
            <div className="mt-8 space-y-4">
              <Card className="bg-white border-border shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
                  <CardTitle className="text-sm font-medium text-foreground">حالة الولاء</CardTitle>
                  <Coffee className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-primary">{profile.stamps} / 5</p>
                      <p className="text-xs text-muted-foreground">عدد الطوابع الحالية</p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {5 - profile.stamps} طوابع متبقية
                    </Badge>
                  </div>
                  
                  {/* Visual Stamps - Coffee Cup Icons */}
                  <div className="flex justify-center items-center gap-3 py-4">
                    {[1, 2, 3, 4, 5].map((stampNum) => (
                      <div 
                        key={stampNum}
                        className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                          stampNum <= profile.stamps 
                            ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30' 
                            : 'bg-secondary border-2 border-dashed border-border'
                        }`}
                      >
                        <Coffee 
                          className={`w-5 h-5 ${
                            stampNum <= profile.stamps 
                              ? 'text-white' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                        {stampNum <= profile.stamps && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Free Drink Icon */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shadow-accent/30">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center text-xs text-muted-foreground">
                    اجمع 5 طوابع واحصل على مشروب مجاني
                  </div>

                  {profile.freeDrinks > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                      <Gift className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-bold text-green-600">لديك {profile.freeDrinks} مشروب مجاني!</p>
                        <p className="text-[10px] text-green-600/70 text-right">استخدمه عند طلبك القادم</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleDownloadCard}
                  className="bg-accent hover:bg-accent/90 text-white shadow-lg"
                  data-testid="button-download-card"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تحميل البطاقة
                </Button>
                <div className="flex items-center justify-center bg-primary/10 rounded-lg border border-primary/20 px-4">
                  <span className="text-[10px] text-primary text-center font-medium leading-tight">
                    خصم 10% دائم لكافة الطلبات
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={() => setLocation("/menu")}
          variant="outline"
          className="w-full mt-6 border-primary text-primary hover:bg-primary/10"
          data-testid="button-back-menu"
        >
          العودة للقائمة 
        </Button>
      </div>
    </div>
  );
}
