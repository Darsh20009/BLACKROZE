import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coffee, LogOut, ShoppingBag, CreditCard, Gift, Download, Loader2, ArrowRight } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { customerStorage, type CustomerProfile } from "@/lib/customer-storage";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { useQuery } from "@tanstack/react-query";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function MyCardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { customer, logout } = useCustomer();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [cardQrUrl, setCardQrUrl] = useState<string>("");
  const { t, i18n } = useTranslation();

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
    
    const baseProfile = loadedProfile || (customer as unknown as CustomerProfile);
    const activeProfile = {
      ...baseProfile,
      cardNumber: loyaltyCard?.cardNumber || baseProfile.cardNumber,
      stamps: loyaltyCard?.stamps ?? baseProfile.stamps ?? 0,
      freeDrinks: loyaltyCard ? Math.max(0, (loyaltyCard.freeCupsEarned || 0) - (loyaltyCard.freeCupsRedeemed || 0)) : (baseProfile.freeDrinks ?? 0),
    };
    setProfile(activeProfile);

    const cardData = loyaltyCard?.qrToken || JSON.stringify({
      cardNumber: activeProfile.cardNumber,
      name: activeProfile.name,
      phone: activeProfile.phone
    });
    QRCode.toDataURL(cardData, { 
      width: 200, 
      margin: 1,
      color: {
        dark: "#2D9B6E",
        light: "#FFFFFF",
      }
    }).then(setCardQrUrl);
  }, [setLocation, customer, loyaltyCard]);

  const handleLogout = () => {
    logout();
    toast({
      title: t("auth.logged_out"),
      description: t("auth.see_you_soon")
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
      title: t("card.downloaded"),
      description: t("card.download_success")
    });
  };

  if (!profile) return null;

  const localOrders = customerStorage.getOrders();
  const allOrders = [...serverOrders];
  localOrders.forEach(local => {
    if (!allOrders.find(s => s.orderNumber === local.orderNumber)) {
      allOrders.push(local);
    }
  });
  allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-primary p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/menu")}
              className="text-white hover:bg-white/20"
            >
              <ArrowRight className={`h-5 w-5 ${isRtl ? "" : "rotate-180"}`} />
            </Button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Coffee className="w-5 h-5" />
              {t("app.name")}
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <LogOut className={`${isRtl ? "ml-2" : "mr-2"} w-4 h-4`} />
            {t("nav.logout") || "تسجيل خروج"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Profile Card Summary */}
        <Card className="mb-6 bg-white border-border shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-lg text-foreground">{t("profile.welcome", { name: profile.name }) || `مرحباً، ${profile.name}`}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{profile.phone}</CardDescription>
          </CardHeader>
        </Card>

        {/* Unified Interface Tabs */}
        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary border border-border p-1 h-12">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full">
              <ShoppingBag className={`${isRtl ? "ml-2" : "mr-2"} w-4 h-4`} />
              {t("profile.my_orders") || "طلباتي"}
            </TabsTrigger>
            <TabsTrigger value="card" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full">
              <CreditCard className={`${isRtl ? "ml-2" : "mr-2"} w-4 h-4`} />
              {t("nav.my_card") || "بطاقاتي"}
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab Content */}
          <TabsContent value="orders" className="mt-4 space-y-4">
            {isLoadingOrders ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : allOrders.length === 0 ? (
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>{t("profile.no_orders") || "لا توجد طلبات سابقة"}</p>
                </CardContent>
              </Card>
            ) : (
              allOrders.map((order) => (
                <Card key={order.id || order.orderNumber} className="bg-white border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base text-foreground">
                        {t("order.number", { id: order.orderNumber }) || `طلب #${order.orderNumber}`}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString(isRtl ? 'ar-SA' : 'en-US')}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-primary text-white">
                        {order.totalAmount} {t("currency")}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0 h-5">
                        {order.status === 'completed' ? (t("status.completed") || 'مكتمل') : 
                         order.status === 'pending' ? (t("status.pending") || 'قيد الانتظار') :
                         (t(`status.${order.status}`) || order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs text-foreground">
                          <span>{item.nameAr || item.coffeeItem?.nameAr} × {item.quantity}</span>
                          <span className="text-muted-foreground">{(item.price * item.quantity).toFixed(2)} {t("currency")}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Card Tab Content - The Professional Loyalty Card UI */}
          <TabsContent value="card" className="mt-4 space-y-6">
            <div className="perspective-1000">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative h-56 w-full max-w-sm mx-auto rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #2D9B6E 0%, #1e6b4c 100%)'
                }}
              >
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
                  <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-md shadow-lg border border-yellow-600/30" />
                </div>
                
                {/* Brand Logo */}
                <div className="absolute top-6 right-6">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm p-1.5 border border-white/30">
                    <Coffee className="w-full h-full text-white" />
                  </div>
                </div>

                {/* Card Number */}
                <div className="absolute top-[55%] left-6 right-6">
                  <p className="text-[20px] font-mono tracking-[0.2em] text-white text-center">
                    {profile?.cardNumber ? profile.cardNumber.match(/.{1,4}/g)?.join(' ') : '•••• •••• •••• ••••'}
                  </p>
                </div>

                {/* Card Details */}
                <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[8px] text-white/50 uppercase tracking-widest">{t("card.holder") || "CARD HOLDER"}</p>
                    <p className="text-sm font-semibold text-white uppercase">{profile?.name || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-white/50 uppercase tracking-widest">{t("card.member_since") || "MEMBER SINCE"}</p>
                    <p className="text-sm font-semibold text-white">2026</p>
                  </div>
                </div>

                {/* Brand Name Center Bottom */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                  <p className="text-[10px] text-white/70 font-bold tracking-[0.3em]">{t("app.name").toUpperCase()}</p>
                </div>
              </motion.div>
            </div>
            
            {/* QR Code Section */}
            {cardQrUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="bg-white p-3 rounded-2xl shadow-md border border-border">
                  <img src={cardQrUrl} alt="QR Code" className="w-32 h-32" />
                </div>
                <p className="text-xs text-muted-foreground">{t("card.scan_message") || "امسح الكود للحصول على نقاطك"}</p>
              </motion.div>
            )}

            {/* Loyalty Progress */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("card.loyalty_status") || "حالة الولاء"}</CardTitle>
                <Coffee className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-primary">{profile.stamps} / 5</p>
                    <p className="text-xs text-muted-foreground">{t("card.current_stamps") || "عدد الطوابع الحالية"}</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {t("card.stamps_remaining", { count: 5 - profile.stamps }) || `${5 - profile.stamps} طوابع متبقية`}
                  </Badge>
                </div>
                
                {/* Stamp Visualization */}
                <div className="flex justify-center items-center gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div 
                      key={s}
                      className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${
                        s <= profile.stamps 
                          ? 'bg-primary border-primary text-white shadow-md' 
                          : 'bg-secondary border-dashed border-border text-muted-foreground'
                      }`}
                    >
                      <Coffee className="w-5 h-5" />
                    </div>
                  ))}
                  <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-white shadow-md">
                    <Gift className="w-5 h-5" />
                  </div>
                </div>
                
                <p className="text-center text-xs text-muted-foreground">
                  {t("card.loyalty_goal") || "اجمع 5 طوابع واحصل على مشروب مجاني"}
                </p>

                {profile.freeDrinks > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Gift className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-600">
                        {t("card.free_drinks_count", { count: profile.freeDrinks }) || `لديك ${profile.freeDrinks} مشروب مجاني!`}
                      </p>
                      <p className="text-[10px] text-green-600/70">
                        {t("card.use_next_order") || "استخدمه عند طلبك القادم"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleDownloadCard}
                className="bg-accent hover:bg-accent/90 text-white h-12 rounded-xl shadow-md"
              >
                <Download className={`${isRtl ? "ml-2" : "mr-2"} w-4 h-4`} />
                {t("card.download") || "تحميل البطاقة"}
              </Button>
              <div className="flex items-center justify-center bg-primary/5 rounded-xl border border-primary/20 px-3 text-center">
                <span className="text-[10px] text-primary font-bold leading-tight">
                  {t("card.perks_discount") || "خصم 10% دائم لكافة الطلبات"}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={() => setLocation("/menu")}
          variant="outline"
          className="w-full mt-8 h-12 border-primary text-primary hover:bg-primary/5 rounded-xl font-bold"
        >
          {t("menu.back") || "العودة للقائمة"}
        </Button>
      </div>
    </div>
  );
}
