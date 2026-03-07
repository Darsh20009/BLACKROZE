import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, CreditCard, University, Zap, Building, Banknote, Gift, Truck, Plus, Phone, Search, Coffee, Check, Wallet, Star } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { useQuery } from "@tanstack/react-query";

interface PaymentMethodsProps {
 paymentMethods: PaymentMethodInfo[];
 selectedMethod: PaymentMethod | null;
 onSelectMethod: (method: PaymentMethod) => void;
 customerPhone?: string;
 loyaltyCard?: any;
}

export default function PaymentMethods({
 paymentMethods,
 selectedMethod,
 onSelectMethod,
 customerPhone: propCustomerPhone,
 loyaltyCard: initialLoyaltyCard,
}: PaymentMethodsProps) {
 const { toast } = useToast();
  const [cardMode, setCardMode] = useState<'use' | 'add' | null>(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchCardNumber, setSearchCardNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const { card: autoCard, updateCardInCache } = useLoyaltyCard(propCustomerPhone);
  const { data: businessConfig } = useQuery<any>({ queryKey: ["/api/business-config"] });
  
  const foundCard = autoCard || initialLoyaltyCard;
  const pointsForFreeDrink: number = businessConfig?.loyaltyConfig?.pointsForFreeDrink ?? 100;
  const currentPoints: number = Number(foundCard?.points) || 0;
  const freeCupsAvailable: number = (Number(foundCard?.freeCupsEarned) || 0) - (Number(foundCard?.freeCupsRedeemed) || 0);
  const progressPercent: number = Math.min(100, Math.round((currentPoints / pointsForFreeDrink) * 100));
  const pointsNeeded: number = Math.max(0, pointsForFreeDrink - currentPoints);

  useEffect(() => {
    if (foundCard && cardMode === null) {
      setCardMode('use');
    }
  }, [foundCard, cardMode]);

 const getIcon = (iconName: string) => {
  switch (iconName) {
  case 'fas fa-gift':
  return <Gift className="w-6 h-6 text-primary" />;
  case 'fas fa-money-bill-wave':
  return <Banknote className="w-6 h-6 text-primary" />;
  case 'fas fa-truck':
  return <Truck className="w-6 h-6 text-primary" />;
  case 'fas fa-mobile-alt':
  return <Smartphone className="w-6 h-6 text-primary" />;
  case 'fas fa-credit-card':
  return <CreditCard className="w-6 h-6 text-primary" />;
  case 'fas fa-university':
  return <University className="w-6 h-6 text-primary" />;
  case 'fas fa-bolt':
  return <Zap className="w-6 h-6 text-primary" />;
  case 'fas fa-building-columns':
  return <Building className="w-6 h-6 text-primary" />;
  default:
  return <CreditCard className="w-6 h-6 text-primary" />;
  }
 };

 const handleSearchCard = async () => {
  if (!searchPhone && !searchCardNumber) {
   toast({
    variant: "destructive",
    title: "خطأ",
    description: "يرجى إدخال رقم الجوال أو رقم البطاقة",
   });
   return;
  }

  setIsSearching(true);
  try {
   let url = "";
   if (searchPhone) {
    url = `/api/loyalty/cards/phone/${searchPhone}`;
   } else {
    url = `/api/loyalty/cards/number/${searchCardNumber}`;
   }

   const res = await fetch(url);
   if (!res.ok) throw new Error("البطاقة غير موجودة");
   const cardData = await res.json();
   updateCardInCache(cardData);
   setIsAddingCard(false);
   setCardMode('use');
   toast({
    title: "تم العثور على البطاقة",
    description: `أهلاً ${cardData.customerName || 'عميلنا العزيز'}`,
   });
  } catch (error) {
   toast({
    variant: "destructive",
    title: "خطأ",
    description: "لم يتم العثور على بطاقة مرتبطة بهذه البيانات",
   });
  } finally {
   setIsSearching(false);
  }
 };

 return (
   <div className="space-y-4" data-testid="section-payment-methods">
     <h3 className="text-lg font-semibold text-foreground mb-4">اختر طريقة الدفع</h3>
     <div className="space-y-4">
     {paymentMethods.map((method) => {
    const isQahwaCard = (method.id as string) === 'qahwa-card';
    const isNeoLeap = (method.id as string) === 'neoleap' || (method.id as string) === 'neoleap-apple-pay' || (method.id as string) === 'apple_pay';
    const isApplePay = (method.id as string) === 'apple_pay' || (method.id as string) === 'neoleap-apple-pay';
    const isLoyaltyCard = (method.id as string) === 'loyalty-card';
    const isSelected = selectedMethod === method.id;

    // Filter for POS: Only Cash, Network (pos), and BLACK ROSE Card (qahwa-card)
    const allowedPosMethods = ['cash', 'pos', 'qahwa-card'];
    const isPosRoute = window.location.pathname.includes('/employee/pos');
    if (isPosRoute && !allowedPosMethods.includes(method.id as string)) {
      return null;
    }

    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
    const iosDevices = ['iphone', 'ipad', 'ipod'];
    const isIOS = iosDevices.some(device => userAgent.includes(device));

    if (isApplePay && !isIOS) return null;
    if (isLoyaltyCard) return null; // Always hide loyalty card from customer checkout

    return (
      <div key={method.id} className="relative group">
        {(isQahwaCard || isNeoLeap) && (
         <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-yellow-500/30 to-orange-500/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
        )}
        <Card
         className={`cursor-pointer transition-all duration-500 relative overflow-hidden rounded-2xl ${
          isApplePay
          ? 'bg-black border-0 text-white shadow-xl hover:scale-[1.01]'
          : (isQahwaCard || isNeoLeap)
          ? isSelected
           ? 'border-2 border-amber-400 shadow-2xl scale-[1.02] bg-white'
           : 'border-2 border-amber-200/50 hover:border-amber-400/80 shadow-lg hover:scale-[1.01] bg-white/80'
          : isSelected
           ? 'border-primary bg-primary/5 shadow-md'
           : 'border-border/50 hover:border-primary/30 hover:bg-primary/5 bg-white/50'
         }`}
         onClick={() => onSelectMethod(method.id)}
         data-testid={`payment-method-${method.id}`}
        >
         <CardContent className="p-0">
           {isApplePay ? (
             <div className="p-5 flex items-center justify-center gap-2 bg-black h-16">
               <span className="text-white font-bold text-lg">Pay with</span>
               <Smartphone className="w-6 h-6 text-white" />
               <span className="text-white font-black text-xl tracking-tighter"> Pay</span>
             </div>
           ) : (isQahwaCard || isNeoLeap) && isSelected ? (
             <div className="space-y-0">
               {isNeoLeap ? (
                 <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 50%, #000000 100%)'}}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />
                   <div className="p-5 relative z-10 text-white">
                     <div className="flex justify-between items-start mb-6">
                       <div className="space-y-1">
                         <p className="text-xs uppercase tracking-widest opacity-75">BLACK ROSE CAFE</p>
                         <h4 className="text-xl font-black">{method.id === 'neoleap-apple-pay' ? 'Apple Pay' : 'بطاقة بنكية'}</h4>
                       </div>
                       <CreditCard className="w-7 h-7 opacity-50" />
                     </div>
                     <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
                       <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                         <Zap className="w-7 h-7 text-amber-400 animate-pulse" />
                       </div>
                       <p className="font-bold">{method.id === 'neoleap-apple-pay' ? 'دفع سريع عبر Apple Pay' : 'دفع آمن عبر NeoLeap'}</p>
                       <p className="text-sm opacity-70">مدى، فيزا، ماستر كارد</p>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-3 p-1">
                   {/* البطاقة - نفس تصميم my-card.tsx */}
                   <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-xl overflow-hidden relative" data-testid="qahwa-card-display">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                     <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />
                     <CardHeader className="relative z-10 pb-2">
                       <div className="flex justify-between items-start">
                         <div className="space-y-1">
                           <CardTitle className="text-lg opacity-90 font-amiri">بطاقة بلاك روز</CardTitle>
                           <p className="text-sm opacity-75 font-ibm-arabic">{foundCard?.customerName || 'عميل بلاك روز'}</p>
                         </div>
                         <Wallet className="w-7 h-7 opacity-50" />
                       </div>
                     </CardHeader>
                     <CardContent className="space-y-4 relative z-10 pb-4">
                       {/* مشروبات مجانية متاحة */}
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <p className="text-xs opacity-75 font-medium font-ibm-arabic">مشروبات مجانية</p>
                           <h2 className="text-3xl font-bold font-ibm-arabic" data-testid="text-free-cups">
                             {freeCupsAvailable}
                           </h2>
                           <p className="text-sm opacity-75 font-ibm-arabic">
                             {freeCupsAvailable > 0 ? "مشروب متاح" : "لا يوجد حالياً"}
                           </p>
                         </div>
                         <div className="space-y-1 text-left">
                           <p className="text-xs opacity-75 font-medium font-ibm-arabic">رصيد النقاط</p>
                           <h2 className="text-2xl font-bold font-ibm-arabic text-yellow-200" data-testid="text-points-balance-card">
                             {currentPoints}
                           </h2>
                           <p className="text-xs opacity-60 font-ibm-arabic">من {pointsForFreeDrink} نقطة</p>
                         </div>
                       </div>

                       {/* شريط التقدم نحو المشروب المجاني */}
                       <div className="space-y-1.5">
                         <div className="flex justify-between items-center">
                           <p className="text-[10px] opacity-70 font-ibm-arabic flex items-center gap-1">
                             <Coffee className="w-3 h-3" />
                             التقدم نحو مشروب مجاني
                           </p>
                           <p className="text-[10px] font-bold opacity-80">{progressPercent}%</p>
                         </div>
                         <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                           <div
                             className="h-full bg-yellow-300 rounded-full transition-all duration-500"
                             style={{ width: `${progressPercent}%` }}
                             data-testid="progress-free-drink"
                           />
                         </div>
                         <p className="text-[10px] opacity-60 font-ibm-arabic text-center">
                           {pointsNeeded > 0
                             ? `تحتاج ${pointsNeeded} نقطة أخرى للحصول على مشروب مجاني`
                             : "🎉 مبروك! حصلت على مشروب مجاني"}
                         </p>
                       </div>

                       <div className="flex justify-between items-end">
                         <div className="space-y-1">
                           <p className="text-[10px] opacity-75 uppercase tracking-wider">رقم البطاقة</p>
                           <p className="font-mono text-base tracking-widest" data-testid="text-card-number-payment">
                             {foundCard?.cardNumber?.replace(/(.{4})/g, '$1 ') || '**** **** ****'}
                           </p>
                         </div>
                         <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px]">
                           نشطة
                         </Badge>
                       </div>
                     </CardContent>
                   </Card>

                   {/* تنبيه: لا يوجد مشروبات مجانية */}
                   {freeCupsAvailable === 0 && (
                     <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2">
                       <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                       <div>
                         <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">لا تملك مشروبات مجانية بعد</p>
                         <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                           اجمع {pointsNeeded} نقطة إضافية للحصول على مشروبك المجاني الأول
                         </p>
                       </div>
                     </div>
                   )}

                   {/* زر تغيير البطاقة */}
                   <Button
                     variant="outline"
                     size="sm"
                     className="w-full"
                     onClick={(e) => { e.stopPropagation(); setCardMode('add'); }}
                     data-testid="button-change-card"
                   >
                     <Search className="w-4 h-4 ml-2" />
                     تغيير البطاقة
                   </Button>

                   {/* نموذج البحث عن بطاقة */}
                   {cardMode === 'add' && (
                     <div className="space-y-3 pt-1 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <div className="space-y-1.5">
                           <Label className="text-xs">رقم الجوال</Label>
                           <div className="relative">
                             <Phone className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                             <Input
                               placeholder="5XXXXXXXX"
                               className="pr-9"
                               value={searchPhone}
                               onChange={(e) => setSearchPhone(e.target.value)}
                               data-testid="input-search-phone"
                             />
                           </div>
                         </div>
                         <div className="space-y-1.5">
                           <Label className="text-xs">رقم البطاقة</Label>
                           <div className="relative">
                             <CreditCard className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                             <Input
                               placeholder="رقم البطاقة"
                               className="pr-9"
                               value={searchCardNumber}
                               onChange={(e) => setSearchCardNumber(e.target.value)}
                               data-testid="input-search-card"
                             />
                           </div>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <Button
                           className="flex-1"
                           onClick={handleSearchCard}
                           disabled={isSearching}
                           data-testid="button-confirm-card-search"
                         >
                           {isSearching ? "جاري البحث..." : "بحث وتأكيد"}
                         </Button>
                         <Button
                           variant="ghost"
                           onClick={() => setCardMode(foundCard ? 'use' : null)}
                           data-testid="button-cancel-card-search"
                         >
                           إلغاء
                         </Button>
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    isQahwaCard 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg group-hover:scale-110' 
                      : 'bg-muted text-primary'
                  }`}>
                    {getIcon(method.icon)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold transition-colors ${
                        isQahwaCard 
                          ? 'font-amiri text-xl text-amber-900' 
                          : 'text-foreground group-hover:text-primary'
                      }`}>
                        {method.nameAr}
                      </h4>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-300">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm mt-0.5 line-clamp-1 text-[#222429]">
                      {method.details}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
         </Card>
       </div>
    );
     })}
     </div>
   </div>
 );
}
