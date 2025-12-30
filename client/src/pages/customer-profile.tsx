import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coffee, LogOut, ShoppingBag, CreditCard, Gift, Download } from "lucide-react";
import { customerStorage, type CustomerProfile, type LocalOrder } from "@/lib/customer-storage";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

export default function CustomerProfile() {
 const [, setLocation] = useLocation();
 const { toast } = useToast();
 const [profile, setProfile] = useState<CustomerProfile | null>(null);
 const [orders, setOrders] = useState<LocalOrder[]>([]);
 const [cardQrUrl, setCardQrUrl] = useState<string>("");

 useEffect(() => {
 const loadedProfile = customerStorage.getProfile();
 if (!loadedProfile) {
 setLocation("/customer-login");
 return;
 }
 setProfile(loadedProfile);
 setOrders(customerStorage.getOrders());

 // Generate QR code for the card
 const cardData = JSON.stringify({
 cardNumber: loadedProfile.cardNumber,
 name: loadedProfile.name,
 phone: loadedProfile.phone
 });
 QRCode.toDataURL(cardData, { width: 200, margin: 1 }).then(setCardQrUrl);
 }, [setLocation]);

 const handleLogout = () => {
 customerStorage.logout();
 toast({
 title: "تم تسجيل الخروج",
 description: "نراك قريباً!"
 });
 setLocation("/customer-login");
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

 return (
 <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background pb-20" dir="rtl">
 {/* Header */}
 <div className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 backdrop-blur border-b border-primary/30 p-4">
 <div className="container mx-auto flex justify-between items-center">
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
 <TabsList className="grid w-full grid-cols-2 bg-primary/20 border border-primary/30">
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
 {orders.length === 0 ? (
 <Card className="bg-primary/20 border-primary/30 backdrop-blur">
 <CardContent className="p-8 text-center text-accent/70">
 <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>لا توجد طلبات سابقة</p>
 </CardContent>
 </Card>
 ) : (
 orders.map((order) => (
 <Card key={order.id} className="bg-primary/20 border-primary/30 backdrop-blur" data-testid={`order-${order.id}`}>
 <CardHeader>
 <div className="flex justify-between items-start">
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
 <Badge className="bg-primary">
 {order.totalAmount} ر.س
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {order.items.map((item, idx) => (
 <div key={idx} className="flex justify-between text-sm text-accent">
 <span>{item.nameAr} × {item.quantity}</span>
 <span className="text-accent">{(item.price * item.quantity).toFixed(2)} ر.س</span>
 </div>
 ))}
 {order.usedFreeDrink && (
 <Badge variant="outline" className="border-green-500 text-green-400">
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
 <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-primary/30 backdrop-blur overflow-hidden">
 <CardContent className="p-6">
 {/* Card Design - Like the attached image */}
 <div className="text-center space-y-4">
 {/* Logo & Title */}
 <div className="flex flex-col items-center gap-2">
 <Coffee className="w-16 h-16 text-accent" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}} />
 <div>
 <h2 className="text-3xl font-bold text-accent" style={{fontFamily: 'serif'}}>CLUNY CAFE</h2>
 <p className="text-lg text-accent">CLUNY CAFE</p>
 </div>
 </div>

 {/* Customer Name */}
 <div className="py-3 border-y border-primary/30">
 <p className="text-xl font-bold text-accent">{profile.name}</p>
 <p className="text-sm text-accent">صاحب المشروع</p>
 </div>

 {/* QR Code */}
 {cardQrUrl && (
 <div className="flex justify-center py-4">
 <div className="bg-white p-3 rounded-lg">
 <img src={cardQrUrl} alt="QR Code" className="w-48 h-48" />
 </div>
 </div>
 )}

 {/* Card Number */}
 <div className="space-y-1">
 <p className="text-sm text-accent">رقم البطاقة </p>
 <p className="text-2xl font-mono font-bold text-accent">{profile.cardNumber}</p>
 <p className="text-xs text-accent">خصم 10% عند إبرازها للكاشير</p>
 </div>

 {/* Stamps Progress */}
 <div className="bg-primary/30 rounded-lg p-4 space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-accent">الطوابع</span>
 <span className="text-accent font-bold">{profile.stamps} / 5</span>
 </div>
 <div className="w-full bg-primary/50 rounded-full h-3 overflow-hidden">
 <div 
 className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all duration-500 rounded-full"
 style={{ width: `${nextFreeDrinkProgress}%` }}
 />
 </div>
 <p className="text-xs text-accent">
 {5 - profile.stamps} طابع متبقي للحصول على مشروب مجاني
 </p>
 </div>

 {/* Free Drinks */}
 {profile.freeDrinks > 0 && (
 <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4">
 <div className="flex items-center justify-center gap-2 text-green-400">
 <Gift className="w-5 h-5" />
 <span className="font-bold">
 لديك {profile.freeDrinks} مشروب مجاني!
 </span>
 </div>
 <p className="text-xs text-green-300/70 mt-2">
 استخدمها عند الدفع
 </p>
 </div>
 )}

 {/* Download Button */}
 <Button
 onClick={handleDownloadCard}
 className="w-full bg-primary hover:bg-primary"
 data-testid="button-download-card"
 >
 <Download className="ml-2 w-4 h-4" />
 تحميل البطاقة 
 </Button>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>

 {/* Back to Menu Button */}
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
