import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PaymentMethods from "@/components/payment-methods";
import FileUpload from "@/components/file-upload";
import { generatePDF } from "@/lib/pdf-generator";
import { customerStorage } from "@/lib/customer-storage";
import { useCustomer } from "@/contexts/CustomerContext";
import { CreditCard, FileText, MessageCircle, CheckCircle, Coffee, Clock, Star, User, Gift, Sparkles, Award, Copy, Check, Store, Truck, MapPin, Edit, ShoppingBag, Eye, EyeOff } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod, Order } from "@shared/schema";

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { cartItems, clearCart, getTotalPrice, deliveryInfo, getFinalTotal } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `${t("nav.checkout")} - CLUNY CAFE`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t("delivery.subtitle"));
  }, [t]);

 const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
 const [secondaryPaymentMethod, setSecondaryPaymentMethod] = useState<PaymentMethod | null>(null);
 const [paymentReceiptUrl, setPaymentReceiptUrl] = useState("");
 const [secondaryPaymentReceiptUrl, setSecondaryPaymentReceiptUrl] = useState("");
 const [showConfirmation, setShowConfirmation] = useState(false);
 const [orderDetails, setOrderDetails] = useState<any>(null);
 const [showSuccessPage, setShowSuccessPage] = useState(false);
 const [customerName, setCustomerName] = useState("");
 const [transferOwnerName, setTransferOwnerName] = useState("");
 const [isSameAsCustomer, setIsSameAsCustomer] = useState(true);
 const [customerPhone, setCustomerPhone] = useState("");
 const [customerEmail, setCustomerEmail] = useState("");
 const [customerPassword, setCustomerPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [wantToRegister, setWantToRegister] = useState(false);
 const [loyaltyCodes, setLoyaltyCodes] = useState<any[]>([]);
 const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
 const [useFreeDrink, setUseFreeDrink] = useState(false);
 const [isRegisteredCustomer, setIsRegisteredCustomer] = useState(false);
 const [selectedFreeItems, setSelectedFreeItems] = useState<{[key: string]: number}>({});
 const [customerNotes, setCustomerNotes] = useState("");
 const [discountCode, setDiscountCode] = useState("");
 const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percentage: number} | null>(null);
 const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
 const [isRegistering, setIsRegistering] = useState(false);
 const { customer, setCustomer } = useCustomer();

 const { data: customerOrders = [] } = useQuery<Order[]>({
   queryKey: ["/api/customers", customer?.id, "orders"],
   enabled: !!customer?.id,
 });

 const { data: loyaltyCard, refetch: refetchLoyaltyCard } = useQuery({
   queryKey: ["/api/loyalty/cards/phone", customer?.phone],
   queryFn: async () => {
     if (!customer?.phone) return null;
     const res = await fetch(`/api/loyalty/cards/phone/${customer.phone}`);
     if (!res.ok) return null;
     return res.json();
   },
   enabled: !!customer?.phone,
   staleTime: 0,
   refetchInterval: 5000,
 });

 const calculateFreeDrinks = () => {
   if (!loyaltyCard) return 0;
   const freeCupsEarned = loyaltyCard.freeCupsEarned || Math.floor((loyaltyCard.stamps || 0) / 6) || 0;
   const freeCupsRedeemed = loyaltyCard.freeCupsRedeemed || 0;
   return Math.max(0, freeCupsEarned - freeCupsRedeemed);
 };

 const availableFreeDrinks = calculateFreeDrinks();

 const getAutoSelectedFreeItems = () => {
   if (availableFreeDrinks === 0 || cartItems.length === 0) return {};
   const sortedItems = [...cartItems].sort((a, b) => {
     const priceA = parseFloat(String(a.coffeeItem?.price || 0));
     const priceB = parseFloat(String(b.coffeeItem?.price || 0));
     return priceA - priceB;
   });
   const selected: {[key: string]: number} = {};
   let remaining = availableFreeDrinks;
   for (const item of sortedItems) {
     if (remaining <= 0) break;
     const freeQty = Math.min(item.quantity, remaining);
     if (freeQty > 0) {
       selected[item.coffeeItemId] = freeQty;
       remaining -= freeQty;
     }
   }
   return selected;
 };

 useEffect(() => {
   if (selectedPaymentMethod === 'qahwa-card' && availableFreeDrinks > 0) {
     setSelectedFreeItems(getAutoSelectedFreeItems());
   }
 }, [selectedPaymentMethod, availableFreeDrinks, cartItems]);

 useEffect(() => {
   if (!deliveryInfo && !showSuccessPage && cartItems.length > 0) {
     setLocation("/delivery");
   }
 }, [deliveryInfo, setLocation, showSuccessPage, cartItems.length]);

  useEffect(() => {
    if (customer?.name && customer?.phone) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
      if (customer?.email) setCustomerEmail(customer.email);
      setIsRegisteredCustomer(true);
      console.log("Customer data set from context:", customer.name);
    } else {
      const profile = customerStorage.getProfile();
      if (profile && !customerStorage.isGuestMode()) {
        setCustomerName(profile.name);
        setCustomerPhone(profile.phone);
        if (profile.email) setCustomerEmail(profile.email);
        setIsRegisteredCustomer(true);
        console.log("Customer data set from storage:", profile.name);
      }
    }
  }, [customer]);

 const { data: paymentMethods = [] } = useQuery<PaymentMethodInfo[]>({
   queryKey: ["/api/payment-methods"],
   queryFn: async () => {
     const res = await fetch(`/api/payment-methods`);
     if (!res.ok) throw new Error('Failed to fetch payment methods');
     return res.json();
   }
 });

 useEffect(() => {
   if (selectedPaymentMethod !== 'qahwa-card' && appliedDiscount?.code === 'qahwa-card') {
     setAppliedDiscount(null);
   }
 }, [selectedPaymentMethod]);

 const generateCodesMutation = useMutation({
   mutationFn: async (orderId: number) => {
     const response = await apiRequest("POST", `/api/orders/${orderId}/generate-codes`, {});
     return response.json();
   },
   onSuccess: (codes) => setLoyaltyCodes(codes),
 });

 const createOrderMutation = useMutation({
   mutationFn: async (orderData: any) => {
     const response = await apiRequest("POST", "/api/orders", orderData);
     if (!response.ok) {
       const error = await response.json();
       throw new Error(error.error || t("checkout.order_failed") || "فشل في إنشاء الطلب");
     }
     return response.json();
   },
   onSuccess: (data) => {
     setOrderDetails(data);
     clearCart();
     setShowSuccessPage(true);
     queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
     if (data.id) generateCodesMutation.mutate(data.id);
     if (customerPhone) {
       localStorage.setItem("customer-phone", customerPhone);
       if (data.customerId) {
         localStorage.setItem("customer-id", data.customerId);
         fetch(`/api/customers/${data.customerId}`)
           .then(res => res.json())
           .then(customerData => {
             if (customerData && !customerData.error) setCustomer(customerData);
           });
       }
     }
     toast({ title: t("checkout.order_success") || "تم إنشاء الطلب بنجاح", description: `${t("tracking.order_number")}: ${data.orderNumber}` });
   },
   onError: (error) => toast({ variant: "destructive", title: t("checkout.order_error") || "خطأ في إنشاء الطلب", description: error.message }),
 });

 const handleValidateDiscount = async () => {
   if (!discountCode.trim()) return;
   setIsValidatingDiscount(true);
   try {
     const response = await fetch('/api/discount-codes/validate', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ code: discountCode.trim() }),
     });
     const data = await response.json();
     if (response.ok && data.valid) {
       setAppliedDiscount({ code: discountCode.trim(), percentage: data.discountPercentage });
       toast({ title: t("checkout.discount_applied") || "تم تطبيق الخصم بنجاح", description: `${t("checkout.discount_desc", { percentage: data.discountPercentage })}` });
     } else {
       setAppliedDiscount(null);
       toast({ variant: "destructive", title: t("checkout.invalid_discount") || "كود خصم غير صحيح" });
     }
   } finally {
     setIsValidatingDiscount(false);
   }
 };

  const handleProceedPayment = () => {
    console.log("Proceeding to payment debug:", { 
      customerName, 
      selectedPaymentMethod,
      isRegisteredCustomer,
      customer: !!customer 
    });
    
    if (!selectedPaymentMethod) {
      toast({ variant: "destructive", title: "يرجى اختيار طريقة الدفع" });
      return;
    }

    // Force name from context/storage if it's missing but we're "registered"
    let finalName = customerName;
    if (!finalName || !finalName.trim()) {
      const profile = customerStorage.getProfile();
      finalName = customer?.name || profile?.name || "";
      if (finalName) {
        setCustomerName(finalName);
      }
    }

    if (!finalName || !finalName.trim()) {
      toast({ variant: "destructive", title: "يرجى إدخال اسم العميل" });
      return;
    }
    setShowConfirmation(true);
  };

 const confirmAndCreateOrder = async () => {
   let customerLocation = null;
   try {
     const position = await new Promise<GeolocationPosition>((resolve, reject) => {
       navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
     });
     customerLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
   } catch (err) {
     if (selectedPaymentMethod === 'cash') {
       toast({ variant: "destructive", title: "فشل الوصول للموقع", description: "يرجى السماح بالوصول للموقع لتفعيل الدفع كاش" });
       return;
     }
   }

   if (selectedPaymentMethod === 'cash' && customerLocation) {
     const branchId = deliveryInfo?.branchId;
     if (branchId) {
       const res = await fetch(`/api/branches/${branchId}/check-location`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ latitude: customerLocation.lat, longitude: customerLocation.lng })
       });
       const locationData = await res.json();
       if (!locationData.withinRange) {
         toast({ variant: "destructive", title: "عذراً، أنت بعيد جداً", description: `الدفع كاش متاح فقط ضمن 500 متر.` });
         return;
       }
     }
   }

   if (!isRegisteredCustomer) {
     if (!customerPhone.trim() || !/^5\d{8}$/.test(customerPhone.trim())) {
       toast({ variant: "destructive", title: "رقم الجوال مطلوب بشكل صحيح" });
       return;
     }
     if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
       toast({ variant: "destructive", title: "البريد الإلكتروني مطلوب بشكل صحيح" });
       return;
     }
     if (wantToRegister && (!customerPassword.trim() || customerPassword.length < 6)) {
       toast({ variant: "destructive", title: "كلمة السر مطلوبة وتكون 6 أحرف على الأقل" });
       return;
     }
   }

   if (selectedPaymentMethod !== 'cash' && selectedPaymentMethod !== 'qahwa-card' && !isSameAsCustomer && !transferOwnerName.trim()) {
     toast({ variant: "destructive", title: "يرجى إدخال اسم صاحب التحويل" });
     return;
   }

   const electronicPayments = ['alinma', 'ur', 'barq', 'rajhi'];
   if (electronicPayments.includes(selectedPaymentMethod!) && !paymentReceiptUrl) {
     toast({ variant: "destructive", title: "إيصال الدفع مطلوب" });
     return;
   }

   const isQahwaCardPayment = selectedPaymentMethod === 'qahwa-card';
   if (isQahwaCardPayment && availableFreeDrinks <= 0) {
     toast({ variant: "destructive", title: "ليس لديك مشروبات مجانية" });
     return;
   }

   if (isQahwaCardPayment && availableFreeDrinks > 0) {
     const totalSelectedFreeItems = Object.values(selectedFreeItems).reduce((sum, val) => sum + val, 0);
     const totalDrinks = cartItems.reduce((sum, item) => sum + item.quantity, 0);
     if (totalDrinks > totalSelectedFreeItems && !secondaryPaymentMethod) {
       toast({ variant: "destructive", title: "اختر طريقة دفع للمشروبات المتبقية" });
       return;
     }
   }

   let totalAmount = getTotalPrice();
   let freeItemsDiscount = 0;
   const usedFreeDrinksCount = isQahwaCardPayment ? Object.values(selectedFreeItems).reduce((sum, val) => sum + val, 0) : 0;

   if (isQahwaCardPayment) {
     Object.entries(selectedFreeItems).forEach(([itemId, quantity]) => {
       const item = cartItems.find(ci => ci.coffeeItemId === itemId);
       if (item) {
         const price = typeof item.coffeeItem?.price === 'number' ? item.coffeeItem.price : parseFloat(String(item.coffeeItem?.price || 0));
         freeItemsDiscount += price * quantity;
       }
     });
     totalAmount = Math.max(0, totalAmount - freeItemsDiscount);
   } else if (useFreeDrink && availableFreeDrinks > 0) {
     totalAmount = 0;
   } else if (appliedDiscount) {
     totalAmount = Math.max(0, totalAmount - (totalAmount * (appliedDiscount.percentage / 100)));
   }

   let activeCustomerId = (customer as any)?.id || (customer as any)?._id;
   if (!activeCustomerId && wantToRegister) {
     try {
       setIsRegistering(true);
       const regRes = await fetch("/api/customers/register", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ name: customerName, phone: customerPhone, email: customerEmail, password: customerPassword })
       });
       if (regRes.ok) {
         const newC = await regRes.json();
         activeCustomerId = newC.id;
         setCustomer(newC);
       } else {
         toast({ variant: "destructive", title: "خطأ في التسجيل" });
         setIsRegistering(false);
         return;
       }
     } finally { setIsRegistering(false); }
   }

    const finalCustomerName = (customerName || "").trim() || (customer?.name || "").trim() || customerStorage.getProfile()?.name || "عميل";
    const finalCustomerPhone = (customerPhone || "").trim() || (customer?.phone || "").trim() || customerStorage.getProfile()?.phone || "";
    const finalCustomerEmail = (customerEmail || "").trim() || (customer?.email || "").trim() || customerStorage.getProfile()?.email || "";

    const orderData = {
      customerId: activeCustomerId || null,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerEmail: finalCustomerEmail,
      customerInfo: {
        customerName: finalCustomerName,
        phoneNumber: finalCustomerPhone,
        customerEmail: finalCustomerEmail,
        carType: "",
        carColor: "",
        saveCarInfo: 0
      },
      items: cartItems.map(i => ({
        coffeeItemId: i.coffeeItemId,
        quantity: Number(i.quantity),
        price: typeof i.coffeeItem?.price === 'number' ? i.coffeeItem.price : parseFloat(String(i.coffeeItem?.price || 0)),
        nameAr: i.coffeeItem?.nameAr || ""
      })),
      totalAmount: Number(totalAmount),
      paymentMethod: selectedPaymentMethod,
      secondaryPaymentMethod: isQahwaCardPayment ? secondaryPaymentMethod : null,
      paymentReceiptUrl: paymentReceiptUrl || null,
      secondaryPaymentReceiptUrl: secondaryPaymentReceiptUrl || null,
      status: "pending",
      branchId: String(deliveryInfo?.branchId || "default-branch"),
      tenantId: String((customer as any)?.tenantId || "demo-tenant"),
      orderType: deliveryInfo?.type === 'pickup' && deliveryInfo?.dineIn ? 'dine-in' : 'regular',
      customerNotes: customerNotes || "",
      discountCode: appliedDiscount?.code || null,
      discountPercentage: appliedDiscount ? Number(appliedDiscount.percentage) : null,
      usedFreeDrink: !!(useFreeDrink || isQahwaCardPayment),
      freeDrinksUsed: Number(usedFreeDrinksCount || 0),
      deliveryAddress: {
        fullAddress: typeof deliveryInfo?.address === 'string' ? deliveryInfo.address : (deliveryInfo?.address as any)?.fullAddress || "",
        lat: Number(customerLocation?.lat || (deliveryInfo as any)?.latitude || (deliveryInfo?.address as any)?.lat || 0),
        lng: Number(customerLocation?.lng || (deliveryInfo as any)?.longitude || (deliveryInfo?.address as any)?.lng || 0),
      },
      transferOwnerName: (selectedPaymentMethod !== 'cash' && selectedPaymentMethod !== 'qahwa-card' && !isSameAsCustomer) ? (transferOwnerName || "") : null,
    };

    console.log("Submitting order data final deep check:", JSON.stringify(orderData, null, 2));
    createOrderMutation.mutate(orderData);
 };

 if (showSuccessPage) {
   return (
     <div className="min-h-screen flex items-center justify-center p-8 bg-[#533d2d]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
       <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6">
         <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
         <h2 className="text-3xl font-bold text-accent">{t("nav.thank_you")}</h2>
         <p>{t("checkout.order_desc")} <span className="font-bold text-primary">#{orderDetails?.orderNumber}</span> {t("status.in_progress")}</p>
         <Button onClick={() => setLocation("/menu")} className="w-full h-12 bg-primary">{t("cart.continue_shopping")}</Button>
       </div>
     </div>
   );
 }

 return (
   <div className="min-h-screen py-12 bg-[#21302f]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
     <div className="max-w-6xl mx-auto px-4">
       <h1 className="text-3xl font-bold text-center mb-8">{t("nav.checkout")}</h1>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-6">
           <Card>
             <CardHeader><CardTitle>{t("checkout.order_summary")}</CardTitle></CardHeader>
             <CardContent className="space-y-4">
               {cartItems.map(item => (
                 <div key={item.coffeeItemId} className="flex justify-between items-center">
                   <span>{i18n.language === 'ar' ? item.coffeeItem?.nameAr : item.coffeeItem?.nameEn || item.coffeeItem?.nameAr} × {item.quantity}</span>
                   <span className="font-bold">{((typeof item.coffeeItem?.price === 'number' ? item.coffeeItem.price : parseFloat(String(item.coffeeItem?.price || 0))) * item.quantity).toFixed(2)} {t("currency")}</span>
                 </div>
               ))}
               <div className="pt-4 border-t font-bold text-xl flex justify-between">
                 <span>{t("cart.total")}:</span>
                 <span className="text-primary">{getFinalTotal().toFixed(2)} {t("currency")}</span>
               </div>
             </CardContent>
           </Card>
         </div>
         <div className="lg:col-span-2 space-y-6">
           <Card>
             <CardContent className="pt-6">
               <div className="space-y-4">
                 {!isRegisteredCustomer && (
                   <div className="space-y-2">
                     <Label>{t("checkout.full_name")}</Label>
                     <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("checkout.enter_name")} />
                   </div>
                 )}
                 {isRegisteredCustomer && (
                   <div className="bg-muted/30 p-4 rounded-lg flex items-center gap-3">
                     <User className="w-5 h-5 text-accent" />
                     <div>
                       <p className="font-semibold text-foreground">{customerName}</p>
                       <p className="text-sm text-muted-foreground">{customerPhone}</p>
                     </div>
                   </div>
                 )}
                 <PaymentMethods
                   paymentMethods={paymentMethods}
                   selectedMethod={selectedPaymentMethod}
                   onSelectMethod={setSelectedPaymentMethod}
                   customerPhone={customerPhone}
                   loyaltyCard={loyaltyCard}
                 />
                 
                 {/* قسم كود الخصم */}
                 <div className="border rounded-lg p-4 bg-gradient-to-r from-amber-50 to-orange-50">
                   <div className="flex items-center gap-2 mb-3">
                     <Gift className="w-5 h-5 text-amber-600" />
                     <Label className="font-semibold text-amber-800">{t("checkout.have_discount")}</Label>
                   </div>
                   <div className="flex gap-2">
                     <Input
                       value={discountCode}
                       onChange={(e) => setDiscountCode(e.target.value)}
                       placeholder={t("checkout.enter_discount")}
                       className="flex-1"
                       disabled={!!appliedDiscount}
                       data-testid="input-discount-code"
                     />
                     {appliedDiscount ? (
                       <Button
                         variant="outline"
                         onClick={() => {
                           setAppliedDiscount(null);
                           setDiscountCode("");
                         }}
                         className="text-red-600 border-red-300"
                         data-testid="button-remove-discount"
                       >
                         {t("checkout.remove")}
                       </Button>
                     ) : (
                       <Button
                         onClick={handleValidateDiscount}
                         disabled={!discountCode.trim() || isValidatingDiscount}
                         className="bg-amber-600 hover:bg-amber-700"
                         data-testid="button-apply-discount"
                       >
                         {isValidatingDiscount ? t("checkout.validating") : t("checkout.apply")}
                       </Button>
                     )}
                   </div>
                   {appliedDiscount && (
                     <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-lg">
                       <Sparkles className="w-4 h-4" />
                       <span className="font-medium">{t("checkout.discount_applied_success", { percentage: appliedDiscount.percentage })}</span>
                     </div>
                   )}
                 </div>

                 <Button onClick={handleProceedPayment} className="w-full h-14 text-lg" data-testid="button-confirm-order">{t("checkout.confirm_order")}</Button>
               </div>
             </CardContent>
           </Card>
         </div>
       </div>
     </div>

     {/* نافذة تأكيد الدفع */}
     <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
       <DialogContent className="max-w-md" dir="rtl">
         <DialogHeader>
           <DialogTitle className="text-xl font-bold text-center">تأكيد الطلب</DialogTitle>
           <DialogDescription className="text-center">
             يرجى مراجعة تفاصيل طلبك قبل التأكيد
           </DialogDescription>
         </DialogHeader>
         
         <div className="space-y-4 py-4">
           <div className="bg-muted/50 rounded-lg p-4 space-y-2">
             <div className="flex justify-between">
               <span className="text-muted-foreground">عدد المنتجات:</span>
               <span className="font-medium">{cartItems.reduce((sum, i) => sum + i.quantity, 0)} منتج</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">طريقة الدفع:</span>
               <span className="font-medium">
                 {selectedPaymentMethod === 'cash' && 'كاش عند الاستلام'}
                 {selectedPaymentMethod === 'qahwa-card' && 'بطاقة قهوة'}
                 {selectedPaymentMethod === 'loyalty-card' && 'بطاقة الولاء'}
                 {selectedPaymentMethod === 'pos' && 'نقاط البيع'}
                 {selectedPaymentMethod === 'geidea' && 'Geidea'}
                 {selectedPaymentMethod === 'apple-pay' && 'Apple Pay'}
                 {selectedPaymentMethod === 'mada' && 'مدى'}
               </span>
             </div>
             {selectedPaymentMethod === 'qahwa-card' && secondaryPaymentMethod && (
               <div className="flex justify-between text-muted-foreground">
                 <span>الدفع الإضافي:</span>
                 <span className="font-medium">
                   {secondaryPaymentMethod === 'cash' && 'كاش'}
                   {secondaryPaymentMethod === 'mada' && 'مدى'}
                   {secondaryPaymentMethod === 'apple-pay' && 'Apple Pay'}
                 </span>
               </div>
             )}
             {selectedPaymentMethod === 'qahwa-card' && Object.values(selectedFreeItems).reduce((s, v) => s + v, 0) > 0 && (
               <div className="flex justify-between text-amber-600">
                 <span>مشروبات مجانية:</span>
                 <span className="font-medium">{Object.values(selectedFreeItems).reduce((s, v) => s + v, 0)} مشروب</span>
               </div>
             )}
             {appliedDiscount && (
               <div className="flex justify-between text-green-600">
                 <span>خصم:</span>
                 <span className="font-medium">{appliedDiscount.percentage}%</span>
               </div>
             )}
             <div className="flex justify-between text-lg font-bold pt-2 border-t">
               <span>الإجمالي:</span>
               <span className="text-primary">
                 {(() => {
                   let total = getTotalPrice();
                   if (selectedPaymentMethod === 'qahwa-card') {
                     Object.entries(selectedFreeItems).forEach(([itemId, quantity]) => {
                       const item = cartItems.find(ci => ci.coffeeItemId === itemId);
                       if (item) {
                         const price = typeof item.coffeeItem?.price === 'number' ? item.coffeeItem.price : parseFloat(String(item.coffeeItem?.price || 0));
                         total -= price * quantity;
                       }
                     });
                   } else if (appliedDiscount) {
                     total = total * (1 - appliedDiscount.percentage / 100);
                   }
                   return Math.max(0, total).toFixed(2);
                 })()} ريال
               </span>
             </div>
           </div>
         </div>

         <DialogFooter className="flex gap-2 sm:gap-0">
           <Button
             variant="outline"
             onClick={() => setShowConfirmation(false)}
             className="flex-1"
             data-testid="button-cancel-confirmation"
           >
             رجوع
           </Button>
           <Button
             onClick={() => {
               setShowConfirmation(false);
               confirmAndCreateOrder();
             }}
             disabled={createOrderMutation.isPending || isRegistering}
             className="flex-1 bg-green-600 hover:bg-green-700"
             data-testid="button-final-confirm"
           >
             {createOrderMutation.isPending || isRegistering ? "جاري الإرسال..." : "تأكيد ودفع"}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </div>
 );
}
