import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PaymentMethods from "@/components/payment-methods";
import { customerStorage } from "@/lib/customer-storage";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { ErrorBoundary } from "@/components/error-boundary";
import { User, Gift, CheckCircle, Sparkles, Loader2, Ticket, Tag, Wrench, Coffee, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";

const TIER_STYLES: Record<string, { gradient: string; badge: string; name: string }> = {
  bronze:   { gradient: 'from-amber-600 via-amber-700 to-amber-800',      badge: 'bg-amber-600',  name: 'برونزي' },
  silver:   { gradient: 'from-slate-400 via-slate-500 to-slate-600',      badge: 'bg-slate-500',  name: 'فضي' },
  gold:     { gradient: 'from-yellow-500 via-amber-500 to-yellow-600',    badge: 'bg-yellow-500', name: 'ذهبي' },
  platinum: { gradient: 'from-gray-400 via-gray-300 to-gray-400',        badge: 'bg-gray-400',   name: 'بلاتيني' },
};

function LoyaltyCheckoutCard({
  loyaltyCard,
  loyaltyPoints,
  pointsForFreeDrink,
  hasEnoughForFreeDrink,
  freeDrinkClaimed,
  onClaimFreeDrink,
  onCancelFreeDrink,
}: {
  loyaltyCard: any;
  loyaltyPoints: number;
  pointsForFreeDrink: number;
  hasEnoughForFreeDrink: boolean;
  freeDrinkClaimed: boolean;
  onClaimFreeDrink: () => void;
  onCancelFreeDrink: () => void;
}) {
  const tier = loyaltyCard?.tier || 'bronze';
  const tierStyle = TIER_STYLES[tier] || TIER_STYLES.bronze;
  const progress = Math.min(100, Math.round((loyaltyPoints / pointsForFreeDrink) * 100));

  return (
    <div className="space-y-2" data-testid="loyalty-checkout-section">
      <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${tierStyle.gradient} text-white shadow-lg`}>
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="p-3 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm">بطاقة كوبي</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierStyle.badge} bg-opacity-80`}>
                <Award className="w-3 h-3 inline ml-1" />{tierStyle.name}
              </span>
            </div>
            <p className="text-xs opacity-80 truncate">{loyaltyCard?.customerName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black leading-none" data-testid="text-loyalty-points">{loyaltyPoints}</p>
            <p className="text-[10px] opacity-70">نقطة</p>
          </div>
        </div>
      </div>

      {freeDrinkClaimed ? (
        <div className="flex items-center justify-between gap-3 bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-xl p-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-bold">🎁 طلبك مجاني! سيتم خصم {loyaltyPoints} نقطة</span>
          </div>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-7 px-2 text-xs" onClick={onCancelFreeDrink} data-testid="button-cancel-free-drink">
            إلغاء
          </Button>
        </div>
      ) : hasEnoughForFreeDrink ? (
        <Button
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold h-11"
          onClick={onClaimFreeDrink}
          data-testid="button-claim-free-drink"
        >
          <Gift className="w-5 h-5 ml-2" />
          احصل على مشروبك المجاني الآن ({loyaltyPoints} نقطة)
        </Button>
      ) : (
        <div className="space-y-1.5 px-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> نقاطك نحو مشروب مجاني</span>
            <span className="font-semibold">{loyaltyPoints} / {pointsForFreeDrink}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            تحتاج {pointsForFreeDrink - loyaltyPoints} نقطة إضافية للحصول على مشروب مجاني
          </p>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { cartItems, clearCart, getFinalTotal, deliveryInfo } = useCartStore();
  const { toast } = useToast();
  const isAr = i18n.language === 'ar';

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cashDistanceError, setCashDistanceError] = useState<string | null>(null);
  const [cashDistanceChecking, setCashDistanceChecking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [wantToRegister, setWantToRegister] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percentage: number, isOffer?: boolean} | null>(null);
  const [showCouponSuggestions, setShowCouponSuggestions] = useState(false);
  const [freeDrinkClaimed, setFreeDrinkClaimed] = useState(false);
  const { card: loyaltyCard, refetch: refetchLoyaltyCard } = useLoyaltyCard();

  const { data: loyaltySettings } = useQuery<any>({
    queryKey: ["/api/public/loyalty-settings"],
    staleTime: 60000,
  });

  const pointsForFreeDrink: number = loyaltySettings?.pointsForFreeDrink ?? 500;
  const loyaltyPoints: number = loyaltyCard?.points || 0;
  const hasEnoughForFreeDrink = loyaltyPoints >= pointsForFreeDrink;

  const getFinalTotalWithPoints = () => {
    let total = getFinalTotal();
    if (appliedDiscount) {
      total = total * (1 - appliedDiscount.percentage / 100);
    }
    if (freeDrinkClaimed) {
      return 0;
    }
    return total;
  };
  const [isRegistering, setIsRegistering] = useState(false);
  const { customer, setCustomer } = useCustomer();

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
      if (customer.email) setCustomerEmail(customer.email);
    }
  }, [customer]);

  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentParam = urlParams.get('payment');
    const isPaymentCallback = paymentParam === 'callback';

    // Also detect Geidea's own callback params (they redirect directly with these params)
    const geideaResponseCode = urlParams.get('responseCode') || urlParams.get('Response') || urlParams.get('response_code');
    const geideaOrderId = urlParams.get('orderId') || urlParams.get('order_id');
    const geideaStatus = urlParams.get('status') || urlParams.get('Status');
    const geideaSignature = urlParams.get('signature') || urlParams.get('Signature');
    const geideaAmount = urlParams.get('amount') || urlParams.get('Amount') || urlParams.get('orderAmount');
    const geideaCurrency = urlParams.get('currency') || urlParams.get('Currency');
    const geideaMerchantRefId = urlParams.get('merchantReferenceId') || urlParams.get('MerchantReferenceId');

    const hasGeideaParams = !!(geideaResponseCode || geideaOrderId || geideaStatus);

    // Detect Paymob callback params (from both direct redirect and our server-side callback handler)
    const paymobProvider = urlParams.get('provider');
    const paymobSuccess = urlParams.get('success');
    const paymobTransactionId = urlParams.get('id') || urlParams.get('txId');
    const paymobPending = urlParams.get('pending');
    const isPaymobServerCallback = (paymentParam === 'success' || paymentParam === 'failed') && paymobProvider === 'paymob';
    const hasPaymobParams = (paymobProvider === 'paymob' && paymobSuccess !== null) || isPaymobServerCallback;

    // Handle Paymob payment failure redirect
    if (paymentParam === 'failed' && paymobProvider === 'paymob') {
      sessionStorage.removeItem('pendingOrderData');
      sessionStorage.removeItem('paymentSessionId');
      sessionStorage.removeItem('paymentProvider');
      window.history.replaceState({}, '', '/checkout');
      setTimeout(() => toast({ variant: "destructive", title: "فشل الدفع", description: "لم تتم عملية الدفع بنجاح. يرجى المحاولة مجدداً." }), 100);
      return;
    }

    if (isPaymentCallback || hasGeideaParams || hasPaymobParams) {
      const storedOrderData = sessionStorage.getItem('pendingOrderData');
      const storedSessionId = sessionStorage.getItem('paymentSessionId');
      const storedProvider = sessionStorage.getItem('paymentProvider');

      if (storedOrderData && (storedSessionId || hasGeideaParams || hasPaymobParams)) {
        setIsVerifyingPayment(true);
        (async () => {
          try {
            const verifyPayload: Record<string, any> = {
              sessionId: storedSessionId,
              provider: storedProvider || paymobProvider,
            };

            // Pass Geidea's callback parameters for faster/more accurate verification
            if (hasGeideaParams) {
              if (geideaResponseCode) verifyPayload.geideaResponseCode = geideaResponseCode;
              if (geideaOrderId) verifyPayload.geideaOrderId = geideaOrderId;
              if (geideaStatus) verifyPayload.geideaStatus = geideaStatus;
              if (geideaSignature) verifyPayload.geideaSignature = geideaSignature;
              if (geideaAmount) verifyPayload.geideaAmount = geideaAmount;
              if (geideaCurrency) verifyPayload.geideaCurrency = geideaCurrency;
              if (geideaMerchantRefId) verifyPayload.geideaMerchantRefId = geideaMerchantRefId;
            }

            // Pass Paymob callback parameters
            if (hasPaymobParams) {
              if (paymobSuccess) verifyPayload.paymobSuccess = paymobSuccess;
              if (paymobTransactionId) {
                verifyPayload.paymobTransactionId = paymobTransactionId;
                verifyPayload.transactionId = paymobTransactionId;
              }
              if (paymobPending) verifyPayload.paymobPending = paymobPending;
              // If server-side callback already verified HMAC, trust the result
              if (isPaymobServerCallback && paymentParam === 'success') {
                verifyPayload.paymobSuccess = 'true';
              }
            }

            const verifyRes = await apiRequest("POST", "/api/payments/verify", verifyPayload);
            const verifyData = await verifyRes.json();

            sessionStorage.removeItem('pendingOrderData');
            sessionStorage.removeItem('paymentSessionId');
            sessionStorage.removeItem('paymentProvider');

            if (verifyData.verified) {
              const orderData = JSON.parse(storedOrderData);
              orderData.paymentStatus = 'paid';
              orderData.transactionId = verifyData.transactionId || geideaOrderId || paymobTransactionId;
              createOrderMutation.mutate(orderData);
            } else {
              toast({
                variant: "destructive",
                title: t("checkout.payment_failed"),
                description: verifyData.error || t("checkout.payment_verification_failed"),
              });
            }
          } catch {
            sessionStorage.removeItem('pendingOrderData');
            sessionStorage.removeItem('paymentSessionId');
            sessionStorage.removeItem('paymentProvider');
            toast({ variant: "destructive", title: t("checkout.error"), description: t("checkout.payment_status_check_failed") });
          } finally {
            setIsVerifyingPayment(false);
          }
        })();
      }
      window.history.replaceState({}, '', '/checkout');
    }
  }, []);

  useEffect(() => {
    const activeOffer = customerStorage.getActiveOffer();
    if (activeOffer && activeOffer.discount > 0 && !appliedDiscount) {
      const discountPercentage = activeOffer.type === 'loyalty' 
        ? 0 
        : activeOffer.discount;
      
      if (discountPercentage > 0) {
        setAppliedDiscount({
          code: activeOffer.title,
          percentage: discountPercentage,
          isOffer: true
        });
        toast({
          title: t("points.offer_applied"),
          description: `${activeOffer.title} - ${t("points.discount")} ${discountPercentage}%`,
        });
      }
    }
  }, []);

  const { data: paymentMethods = [] } = useQuery<PaymentMethodInfo[]>({
    queryKey: ["/api/payment-methods"],
    queryFn: async () => {
      const res = await fetch(`/api/payment-methods`);
      return res.json();
    }
  });

  const cashMethod = paymentMethods.find(m => m.id === 'cash');

  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (selectedPaymentMethod !== 'cash') {
      setCashDistanceError(null);
      return;
    }
    const maxDist = cashMethod?.cashMaxDistance || 0;
    const storeLoc = cashMethod?.storeLocation;
    if (!maxDist || maxDist <= 0 || !storeLoc?.lat || !storeLoc?.lng) {
      setCashDistanceError(null);
      return;
    }
    if (!navigator.geolocation) {
      setCashDistanceError('متصفحك لا يدعم تحديد الموقع، لا يمكن التحقق من المسافة للدفع نقداً');
      return;
    }
    setCashDistanceChecking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversineDistance(pos.coords.latitude, pos.coords.longitude, storeLoc.lat!, storeLoc.lng!);
        setCashDistanceChecking(false);
        if (dist > maxDist) {
          setCashDistanceError(`أنت بعيد عن المتجر (${Math.round(dist)} متر). الدفع نقداً متاح فقط ضمن ${maxDist} متر من المتجر.`);
        } else {
          setCashDistanceError(null);
        }
      },
      () => {
        setCashDistanceChecking(false);
        setCashDistanceError('تعذّر تحديد موقعك. الرجاء السماح بالوصول للموقع للدفع نقداً.');
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [selectedPaymentMethod, cashMethod]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Order failed");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      if (freeDrinkClaimed && loyaltyCard?.phoneNumber) {
        try {
          await fetch('/api/loyalty/claim-free-drink', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: loyaltyCard.phoneNumber }),
          });
        } catch {}
      }
      setOrderDetails(data);
      clearCart();
      customerStorage.clearActiveOffer();
      setShowSuccessPage(true);
      setFreeDrinkClaimed(false);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/cards/phone"] });
      refetchLoyaltyCard();
      const displayNum = data.orderNumber;
      toast({ title: t("checkout.order_success"), description: `${t("tracking.order_number")}: ${displayNum}` });
    },
    onError: (error) => toast({ variant: "destructive", title: t("checkout.order_error"), description: error.message }),
  });

  const { data: coupons = [] } = useQuery<any[]>({
    queryKey: ["/api/discount-codes"],
  });

  const safeCoupons = Array.isArray(coupons) ? coupons.filter(c => c && c.code && typeof c.code === 'string') : [];

  const handleValidateDiscount = async (codeOverride?: string) => {
    const codeToUse = codeOverride || discountCode.trim();
    if (!codeToUse) return;
    
    setIsValidatingDiscount(true);
    try {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: codeToUse, 
          customerId: customer?.id,
          amount: getFinalTotal()
        }),
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setAppliedDiscount({ code: data.code, percentage: data.discountPercentage });
        setDiscountCode(data.code);
        setShowCouponSuggestions(false);
        toast({
          title: t("checkout.coupon_applied"),
          description: `${t("checkout.discount")}: ${data.discountPercentage}%`,
        });
      } else {
        setAppliedDiscount(null);
        toast({ 
          variant: "destructive", 
          title: t("checkout.invalid_discount"),
          description: data.error || data.message
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: t("checkout.error") });
    } finally { setIsValidatingDiscount(false); }
  };

  const handleProceedPayment = () => {
    if (!selectedPaymentMethod) {
      toast({ variant: "destructive", title: t("checkout.select_payment") });
      return;
    }
    if (selectedPaymentMethod === 'cash' && cashDistanceError) {
      toast({ variant: "destructive", title: 'الدفع نقداً غير متاح', description: cashDistanceError });
      return;
    }
    if (selectedPaymentMethod === 'cash' && cashDistanceChecking) {
      toast({ variant: "destructive", title: 'جاري التحقق من موقعك...', description: 'الرجاء الانتظار' });
      return;
    }
    if (!customerName.trim()) {
      toast({ variant: "destructive", title: t("checkout.enter_customer_name") });
      return;
    }
    setShowConfirmation(true);
  };

  const isOnlinePaymentMethod = (method: string | null) => {
    if (!method) return false;
    const onlineMethods = ['neoleap', 'geidea', 'apple_pay', 'neoleap-apple-pay', 'bank_card', 'paymob-card', 'paymob-wallet'];
    return onlineMethods.includes(method);
  };

  const confirmAndCreateOrder = async () => {
    let finalTotal = getFinalTotalWithPoints();

    if (selectedPaymentMethod === ('wallet' as any) && (customer?.walletBalance || 0) < finalTotal) {
      toast({ variant: "destructive", title: t("points.insufficient_wallet") });
      return;
    }

    let activeCustomerId = customer?.id;
    if (!activeCustomerId && wantToRegister) {
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
      }
      setIsRegistering(false);
    }

    const orderData = {
      customerId: activeCustomerId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      items: cartItems.map(i => {
        const inlineAddons = (i as any).selectedItemAddons || [];
        const addonsExtra = inlineAddons.reduce((s: number, a: any) => s + (Number(a.price) || 0), 0);
        return {
          coffeeItemId: i.coffeeItemId,
          quantity: i.quantity,
          price: (i.coffeeItem?.price || 0) + addonsExtra,
          nameAr: i.coffeeItem?.nameAr || "",
          nameEn: i.coffeeItem?.nameEn || "",
          customization: inlineAddons.length > 0 ? { selectedItemAddons: inlineAddons } : undefined,
        };
      }),
      totalAmount: finalTotal,
      paymentMethod: selectedPaymentMethod as PaymentMethod,
      status: "pending",
      branchId: deliveryInfo?.branchId || "default",
      orderType: deliveryInfo?.type === 'car-pickup' ? 'car_pickup' : deliveryInfo?.type === 'scheduled-pickup' ? 'pickup' : (deliveryInfo?.type === 'pickup' && deliveryInfo?.dineIn ? 'dine-in' : 'regular'),
      deliveryType: deliveryInfo?.type === 'car-pickup' ? 'car_pickup' : deliveryInfo?.type === 'scheduled-pickup' ? 'pickup' : deliveryInfo?.type || 'pickup',
      customerNotes: customerNotes,
      discountCode: appliedDiscount?.code,
      pointsRedeemed: freeDrinkClaimed ? loyaltyPoints : 0,
      pointsValue: freeDrinkClaimed ? getFinalTotal() : 0,
      freeDrinkRedeemed: freeDrinkClaimed,
      bypassPointsVerification: true,
      ...(deliveryInfo?.type === 'car-pickup' && deliveryInfo?.carInfo ? {
        carType: deliveryInfo.carInfo.carType,
        carColor: deliveryInfo.carInfo.carColor,
        plateNumber: deliveryInfo.carInfo.plateNumber,
      } : {}),
      ...(deliveryInfo?.scheduledPickupTime ? {
        scheduledPickupTime: deliveryInfo.scheduledPickupTime,
        arrivalTime: deliveryInfo.scheduledPickupTime,
      } : {}),
      channel: "online",
    };

    if (isOnlinePaymentMethod(selectedPaymentMethod)) {
      try {
        const initRes = await apiRequest("POST", "/api/payments/init", {
          amount: finalTotal,
          currency: "SAR",
          orderId: `temp-${Date.now()}`,
          customerName: customerName,
          customerEmail: customerEmail || undefined,
          customerPhone: customerPhone || undefined,
          paymentMethod: selectedPaymentMethod,
          returnUrl: `${window.location.origin}/checkout?payment=callback`,
        });
        const initData = await initRes.json();
        if (initData.redirectUrl) {
          sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));
          // For Paymob, store the Paymob order ID (externalId) as sessionId for verification
          const sessionIdToStore = (initData.provider === 'paymob' && initData.externalId)
            ? initData.externalId
            : (initData.sessionId || '');
          sessionStorage.setItem('paymentSessionId', sessionIdToStore);
          sessionStorage.setItem('paymentProvider', initData.provider || '');
          window.location.href = initData.redirectUrl;
          return;
        } else {
          toast({ variant: "destructive", title: t("checkout.error"), description: initData.error || t("checkout.payment_init_failed") });
          return;
        }
      } catch (err: any) {
        toast({ variant: "destructive", title: t("checkout.payment_error"), description: err.message || t("checkout.payment_gateway_failed") });
        return;
      }
    }

    createOrderMutation.mutate(orderData);
  };

  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#21302f]" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-sm w-full bg-white rounded-3xl p-10 shadow-2xl text-center space-y-6">
          <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
          <h2 className="text-2xl font-bold">{t("checkout.verifying_payment")}</h2>
          <p className="text-muted-foreground text-sm">{t("checkout.verifying_payment_desc")}</p>
        </div>
      </div>
    );
  }

  if (showSuccessPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#533d2d]" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          <h2 className="text-3xl font-bold text-accent">{t("nav.thank_you")}</h2>
          <p>{t("checkout.order_desc")} <span className="font-bold text-primary">{orderDetails?.orderNumber}</span></p>
          <Button onClick={() => setLocation("/menu")} className="w-full h-12 bg-primary" data-testid="button-back-to-menu">{t("cart.continue_shopping")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-[#21302f]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white text-center mb-8">{t("nav.checkout")}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle>{t("checkout.order_summary")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center gap-2 text-sm" data-testid={`cart-item-${index}`}>
                    <span>{isAr ? item.coffeeItem?.nameAr : item.coffeeItem?.nameEn} × {item.quantity}</span>
                    <span className="font-bold">{((item.coffeeItem?.price || 0) * item.quantity).toFixed(2)} {t("currency")}</span>
                  </div>
                ))}
                {appliedDiscount && (
                  <div className="flex justify-between items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                    <span>{t("points.discount")} ({appliedDiscount.percentage}%)</span>
                    <span>-{(getFinalTotal() * appliedDiscount.percentage / 100).toFixed(2)} {t("currency")}</span>
                  </div>
                )}
                {freeDrinkClaimed && (
                  <div className="flex justify-between items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                    <span className="flex items-center gap-1.5">🎁 مشروب مجاني</span>
                    <span>-{getFinalTotal().toFixed(2)} {t("currency")}</span>
                  </div>
                )}
                <div className="pt-4 border-t font-bold text-xl flex justify-between gap-2">
                  <span>{t("cart.total")}:</span>
                  <span className="text-primary">
                    {getFinalTotalWithPoints().toFixed(2)} {t("currency")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {customer ? (
                  <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t("checkout.full_name")} data-testid="input-customer-name" />
                    <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder={t("checkout.phone")} data-testid="input-customer-phone" />
                    <div className="flex items-center gap-2">
                      <Checkbox id="register" checked={wantToRegister} onCheckedChange={checked => setWantToRegister(!!checked)} data-testid="checkbox-register" />
                      <Label htmlFor="register">{t("checkout.want_to_register")}</Label>
                    </div>
                  </div>
                )}

                <PaymentMethods
                  paymentMethods={paymentMethods}
                  selectedMethod={selectedPaymentMethod}
                  onSelectMethod={setSelectedPaymentMethod}
                />

                {selectedPaymentMethod === 'cash' && cashDistanceChecking && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm" data-testid="status-cash-distance-checking">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span>{t("checkout.cash_checking")}</span>
                  </div>
                )}

                {selectedPaymentMethod === 'cash' && !cashDistanceChecking && cashDistanceError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm" data-testid="status-cash-distance-error">
                    <span className="text-base flex-shrink-0">⚠️</span>
                    <span>{cashDistanceError}</span>
                  </div>
                )}

                {appliedDiscount?.isOffer && (
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-300">{appliedDiscount.code}</p>
                          <p className="text-sm text-green-600">{t("points.discount")} {appliedDiscount.percentage}% {t("points.applied")}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setAppliedDiscount(null);
                          customerStorage.clearActiveOffer();
                        }}
                        className="text-red-500"
                        data-testid="button-remove-offer"
                      >
                        {t("points.remove")}
                      </Button>
                    </div>
                  </div>
                )}

                <ErrorBoundary fallback={
                  <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-orange-400" />
                      <Label className="font-semibold text-muted-foreground">{t("checkout.have_discount")}</Label>
                    </div>
                    <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5">
                      <Wrench className="w-3 h-3" />
                      {t("checkout.under_dev")}
                    </Badge>
                  </div>
                }>
                <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-orange-600" />
                    <Label className="font-semibold">{t("checkout.have_discount")}</Label>
                  </div>
                  {safeCoupons.length > 0 && !appliedDiscount && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5" />
                        {t("checkout.available_coupons")}
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {safeCoupons.map((coupon) => (
                          <button
                            key={coupon.id || coupon._id || coupon.code}
                            onClick={() => {
                              setDiscountCode(coupon.code);
                              handleValidateDiscount(coupon.code);
                            }}
                            data-testid={`button-coupon-${coupon.code}`}
                            className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all group min-w-[100px]"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Tag className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-mono font-black text-xs tracking-wider text-foreground">{coupon.code}</span>
                            <Badge className="bg-primary text-white border-0 font-black text-[10px] px-1.5 py-0">
                              -{coupon.discountPercentage}%
                            </Badge>
                            {coupon.reason && (
                              <span className="text-[9px] text-muted-foreground text-center line-clamp-1 max-w-[90px]">{coupon.reason}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={discountCode}
                      onChange={e => setDiscountCode(e.target.value)}
                      placeholder={t("checkout.enter_discount")}
                      disabled={!!appliedDiscount}
                      className="bg-white dark:bg-background"
                      data-testid="input-discount-code"
                    />
                    <Button
                      onClick={() => handleValidateDiscount()}
                      disabled={!!appliedDiscount || isValidatingDiscount}
                      data-testid="button-apply-discount"
                    >
                      {isValidatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : t("checkout.apply")}
                    </Button>
                  </div>
                  {appliedDiscount && !appliedDiscount.isOffer && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-green-600">{t("points.applied")}: {appliedDiscount.code} ({appliedDiscount.percentage}%)</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-red-500 hover:text-red-700 p-0"
                        onClick={() => {
                          setAppliedDiscount(null);
                          setDiscountCode("");
                        }}
                      >
                        {t("checkout.remove")}
                      </Button>
                    </div>
                  )}
                </div>
                </ErrorBoundary>

                {customer && loyaltyCard && loyaltyPoints > 0 && (
                  <LoyaltyCheckoutCard
                    loyaltyCard={loyaltyCard}
                    loyaltyPoints={loyaltyPoints}
                    pointsForFreeDrink={pointsForFreeDrink}
                    hasEnoughForFreeDrink={hasEnoughForFreeDrink}
                    freeDrinkClaimed={freeDrinkClaimed}
                    onClaimFreeDrink={() => setFreeDrinkClaimed(true)}
                    onCancelFreeDrink={() => setFreeDrinkClaimed(false)}
                  />
                )}

                <Button
                  onClick={handleProceedPayment}
                  className="w-full h-14 text-lg"
                  data-testid="button-proceed-payment"
                  disabled={
                    (selectedPaymentMethod === 'cash' && !!cashDistanceError) ||
                    (selectedPaymentMethod === 'cash' && cashDistanceChecking)
                  }
                >
                  {selectedPaymentMethod === 'cash' && cashDistanceChecking ? (
                    <><Loader2 className="w-5 h-5 animate-spin ml-2" />{t("checkout.verifying_location")}</>
                  ) : t("checkout.confirm_order")}
                </Button>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent dir={isAr ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t("checkout.confirm_title")}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg">{t("checkout.confirm_question")}</p>
            <p className="text-2xl font-bold text-primary mt-2">{getFinalTotalWithPoints().toFixed(2)} {t("currency")}</p>
            {freeDrinkClaimed && (
              <p className="text-sm text-green-600 mt-1">🎁 {t("checkout.free_drink_claimed")}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1" data-testid="button-cancel-order">{t("points.cancel")}</Button>
            <Button onClick={confirmAndCreateOrder} className="flex-1 bg-green-600" data-testid="button-confirm-order">{t("checkout.confirm_pay")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
