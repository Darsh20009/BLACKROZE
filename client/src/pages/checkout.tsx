import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PaymentMethods from "@/components/payment-methods";
import { customerStorage } from "@/lib/customer-storage";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { User, Gift, CheckCircle, Sparkles, Loader2, Ticket, Tag, Star, CreditCard, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { cartItems, clearCart, getFinalTotal, deliveryInfo } = useCartStore();
  const { toast } = useToast();
  const isAr = i18n.language === 'ar';

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
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
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const { card: loyaltyCard, refetch: refetchLoyaltyCard } = useLoyaltyCard();

  const { data: businessConfig } = useQuery<any>({ queryKey: ["/api/business-config"] });
  const pointsPerSar: number = businessConfig?.loyaltyConfig?.pointsPerSar ?? 20;
  const pointsToSar = (pts: number) => pts / pointsPerSar;

  const getFinalTotalWithPoints = () => {
    let total = getFinalTotal();
    if (appliedDiscount) {
      total = total * (1 - appliedDiscount.percentage / 100);
    }
    if (usePoints && pointsRedeemed > 0) {
      total = Math.max(0, total - pointsToSar(pointsRedeemed));
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
    const isPaymentCallback = urlParams.get('payment') === 'callback';
    const isPaymentSuccess = urlParams.get('payment') === 'success';
    const isPaymentFailed = urlParams.get('payment') === 'failed';
    const urlProvider = urlParams.get('provider');
    const urlTxId = urlParams.get('txId');

    const geideaResponseCode = urlParams.get('responseCode') || urlParams.get('Response') || urlParams.get('response_code');
    const geideaOrderId = urlParams.get('orderId') || urlParams.get('order_id');
    const geideaStatus = urlParams.get('status') || urlParams.get('Status');
    const geideaSignature = urlParams.get('signature') || urlParams.get('Signature');
    const geideaAmount = urlParams.get('amount') || urlParams.get('Amount') || urlParams.get('orderAmount');
    const geideaCurrency = urlParams.get('currency') || urlParams.get('Currency');
    const geideaMerchantRefId = urlParams.get('merchantReferenceId') || urlParams.get('MerchantReferenceId');
    const hasGeideaParams = !!(geideaResponseCode || geideaOrderId || geideaStatus);

    // Paymob: server already verified HMAC and redirected with ?payment=success&provider=paymob&txId=xxx
    if ((isPaymentSuccess || isPaymentFailed) && urlProvider === 'paymob') {
      const storedOrderData = sessionStorage.getItem('pendingOrderData');
      window.history.replaceState({}, '', '/checkout');
      if (isPaymentFailed) {
        sessionStorage.removeItem('pendingOrderData');
        sessionStorage.removeItem('paymentSessionId');
        sessionStorage.removeItem('paymentProvider');
        toast({ variant: "destructive", title: t("checkout.payment_failed"), description: t("checkout.payment_verification_failed") });
        return;
      }
      if (storedOrderData) {
        const orderData = JSON.parse(storedOrderData);
        orderData.paymentStatus = 'paid';
        orderData.transactionId = urlTxId || undefined;
        sessionStorage.removeItem('pendingOrderData');
        sessionStorage.removeItem('paymentSessionId');
        sessionStorage.removeItem('paymentProvider');
        createOrderMutation.mutate(orderData);
      }
      return;
    }

    if (isPaymentCallback || hasGeideaParams) {
      const storedOrderData = sessionStorage.getItem('pendingOrderData');
      const storedSessionId = sessionStorage.getItem('paymentSessionId');
      const storedProvider = sessionStorage.getItem('paymentProvider');

      if (storedOrderData && (storedSessionId || hasGeideaParams)) {
        setIsVerifyingPayment(true);
        (async () => {
          try {
            const verifyPayload: Record<string, any> = {
              sessionId: storedSessionId,
              provider: storedProvider,
            };

            if (hasGeideaParams) {
              if (geideaResponseCode) verifyPayload.geideaResponseCode = geideaResponseCode;
              if (geideaOrderId) verifyPayload.geideaOrderId = geideaOrderId;
              if (geideaStatus) verifyPayload.geideaStatus = geideaStatus;
              if (geideaSignature) verifyPayload.geideaSignature = geideaSignature;
              if (geideaAmount) verifyPayload.geideaAmount = geideaAmount;
              if (geideaCurrency) verifyPayload.geideaCurrency = geideaCurrency;
              if (geideaMerchantRefId) verifyPayload.geideaMerchantRefId = geideaMerchantRefId;
            }

            const verifyRes = await apiRequest("POST", "/api/payments/verify", verifyPayload);
            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              const orderData = JSON.parse(storedOrderData);
              orderData.paymentStatus = 'paid';
              orderData.transactionId = verifyData.transactionId || geideaOrderId;
              sessionStorage.removeItem('pendingOrderData');
              sessionStorage.removeItem('paymentSessionId');
              sessionStorage.removeItem('paymentProvider');
              createOrderMutation.mutate(orderData);
            } else {
              sessionStorage.removeItem('pendingOrderData');
              sessionStorage.removeItem('paymentSessionId');
              sessionStorage.removeItem('paymentProvider');
              toast({ variant: "destructive", title: t("checkout.payment_failed"), description: verifyData.error || t("checkout.payment_verification_failed") });
            }
          } catch {
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

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Order failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setOrderDetails(data);
      clearCart();
      customerStorage.clearActiveOffer();
      setShowSuccessPage(true);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/cards/phone"] });
      refetchLoyaltyCard();
      const displayNum = data.dailyNumber ? `ORD#${String(data.dailyNumber).padStart(4,'0')}` : (data.orderNumber.includes('-') ? `ORD#${data.orderNumber.split('-').pop()}` : `ORD#${data.orderNumber.slice(-4)}`);
      toast({ title: t("checkout.order_success"), description: `${t("tracking.order_number")}: ${displayNum}` });
    },
    onError: (error) => toast({ variant: "destructive", title: t("checkout.order_error"), description: error.message }),
  });

  const isEmployee = !!localStorage.getItem('currentEmployee');

  const { data: coupons = [] } = useQuery<any[]>({
    queryKey: ["/api/discount-codes"],
    enabled: isEmployee,
  });

  const [showCouponSuggestions, setShowCouponSuggestions] = useState(false);

  const safeCoupons = Array.isArray(coupons) ? coupons : [];
  const filteredCoupons = safeCoupons.filter(c => {
    try {
      return c && c.isActive && c.code && typeof c.code === 'string' &&
        c.code.toLowerCase().includes(discountCode.toLowerCase());
    } catch {
      return false;
    }
  });

  const handleValidateDiscount = async (codeOverride?: string) => {
    const codeToUse = (codeOverride || discountCode.trim()).toUpperCase();
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

  const handleApplyPoints = () => {
    if (!pointsRedeemed || pointsRedeemed <= 0) {
      toast({ variant: "destructive", title: t("points.enter_points_amount") });
      return;
    }
    const maxPoints = loyaltyCard?.points || 0;
    if (pointsRedeemed > maxPoints) {
      toast({ variant: "destructive", title: `لا يمكن استخدام أكثر من ${maxPoints} نقطة` });
      return;
    }
    setUsePoints(true);
    toast({ title: t("points.verified_success"), description: `تم تطبيق خصم ${pointsToSar(pointsRedeemed).toFixed(2)} ر.س` });
  };

  const handleCancelPoints = () => {
    setUsePoints(false);
    setPointsRedeemed(0);
  };

  const handleProceedPayment = () => {
    if (!selectedPaymentMethod) {
      toast({ variant: "destructive", title: t("checkout.select_payment") });
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
    const onlineMethods = ['neoleap', 'geidea', 'apple_pay', 'neoleap-apple-pay', 'bank_card', 'paymob', 'paymob-card', 'paymob-wallet'];
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
      items: cartItems.map(i => ({
        coffeeItemId: i.coffeeItemId,
        quantity: i.quantity,
        price: i.coffeeItem?.price || 0,
        nameAr: i.coffeeItem?.nameAr || ""
      })),
      totalAmount: finalTotal,
      paymentMethod: selectedPaymentMethod as PaymentMethod,
      status: "pending",
      orderSource: "website",
      branchId: deliveryInfo?.branchId || "default",
      orderType: deliveryInfo?.type === 'car-pickup' ? 'car_pickup' : (deliveryInfo?.type === 'pickup' && deliveryInfo?.dineIn ? 'dine-in' : 'regular'),
      deliveryType: deliveryInfo?.type === 'car-pickup' ? 'car_pickup' : deliveryInfo?.type || 'pickup',
      customerNotes: customerNotes,
      discountCode: appliedDiscount?.code,
      pointsRedeemed: (usePoints && pointsRedeemed > 0) ? pointsRedeemed : 0,
      pointsValue: (usePoints && pointsRedeemed > 0) ? pointsToSar(pointsRedeemed) : 0,
      ...(deliveryInfo?.type === 'car-pickup' && deliveryInfo?.carInfo ? {
        carType: deliveryInfo.carInfo.carType,
        carColor: deliveryInfo.carInfo.carColor,
        plateNumber: deliveryInfo.carInfo.plateNumber,
      } : {}),
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
          sessionStorage.setItem('paymentSessionId', initData.sessionId || '');
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

  if (showSuccessPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#533d2d]" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          <h2 className="text-3xl font-bold text-accent">{t("nav.thank_you")}</h2>
          <p>{t("checkout.order_desc")} <span className="font-bold text-primary">{orderDetails?.dailyNumber ? `ORD#${String(orderDetails.dailyNumber).padStart(4,'0')}` : (orderDetails?.orderNumber?.includes('-') ? `ORD#${orderDetails.orderNumber.split('-').pop()}` : `ORD#${orderDetails?.orderNumber?.slice(-4)}`)}</span></p>
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
                {usePoints && pointsRedeemed > 0 && (
                  <div className="flex justify-between items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                    <span>{t("points.points_discount")}</span>
                    <span>-{pointsToSar(pointsRedeemed).toFixed(2)} {t("currency")}</span>
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

                <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-orange-600" />
                    <Label className="font-semibold">{t("checkout.have_discount")}</Label>
                  </div>
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          value={discountCode} 
                          onChange={e => {
                            setDiscountCode(e.target.value.toUpperCase());
                            if (isEmployee) setShowCouponSuggestions(true);
                          }}
                          onFocus={() => { if (isEmployee) setShowCouponSuggestions(true); }}
                          placeholder={t("checkout.enter_discount")}
                          disabled={!!appliedDiscount}
                          className="bg-white dark:bg-background"
                          data-testid="input-discount-code"
                        />
                        {isEmployee && showCouponSuggestions && filteredCoupons.length > 0 && !appliedDiscount && (
                          <div className="absolute z-50 bottom-full mb-2 left-0 right-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 zoom-in-95" style={{filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))'}}>
                            <div className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-2xl overflow-hidden">
                              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <Zap className="w-3.5 h-3.5 text-primary" />
                                  </div>
                                  <span className="text-xs font-bold text-white/80 tracking-wider uppercase">كوبونات متاحة</span>
                                  <Badge className="bg-primary/20 text-primary border-0 text-[9px] font-bold px-1.5 py-0">{filteredCoupons.length}</Badge>
                                </div>
                                <button onClick={() => setShowCouponSuggestions(false)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                  <span className="text-white/60 text-xs leading-none">✕</span>
                                </button>
                              </div>
                              <div className="max-h-56 overflow-y-auto">
                                {filteredCoupons.map((coupon, idx) => (
                                  <button
                                    key={coupon.id}
                                    onClick={() => {
                                      setDiscountCode(coupon.code);
                                      handleValidateDiscount(coupon.code);
                                    }}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-right group border-b border-white/5 last:border-0"
                                    data-testid={`coupon-suggestion-${idx}`}
                                  >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-primary/20">
                                      <Tag className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-right">
                                      <p className="font-mono font-bold text-sm text-white tracking-widest">{coupon.code}</p>
                                      <p className="text-[10px] text-white/40 truncate">{coupon.reason || 'خصم حصري'}</p>
                                    </div>
                                    <div className="shrink-0">
                                      <span className="inline-flex items-center justify-center w-12 h-6 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-black">{coupon.discountPercentage}%</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleValidateDiscount()} 
                        disabled={!!appliedDiscount || isValidatingDiscount} 
                        data-testid="button-apply-discount"
                      >
                        {isValidatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : t("checkout.apply")}
                      </Button>
                    </div>
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
                        {t("common.remove") || "إزالة"}
                      </Button>
                    </div>
                  )}
                </div>

                {customer && loyaltyCard && (loyaltyCard.points || 0) > 0 && (
                  <div className="space-y-3">
                    {/* بطاقة الولاء - نفس تصميم my-card */}
                    <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-5 overflow-hidden shadow-xl" data-testid="loyalty-card-checkout">
                      {/* خلفية زخرفية */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full -ml-14 -mb-14 blur-xl pointer-events-none" />
                      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}} />

                      {/* رأس البطاقة */}
                      <div className="relative z-10 flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white/60 text-[10px] uppercase tracking-widest font-medium mb-0.5">بطاقة بلاك روز</p>
                          <p className="text-white font-bold text-sm font-ibm-arabic">{customer?.name}</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white/80" />
                        </div>
                      </div>

                      {/* الرصيد */}
                      <div className="relative z-10 flex items-end justify-between">
                        <div>
                          <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">{t("points.your_balance") || "رصيد النقاط"}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white font-ibm-arabic" data-testid="text-loyalty-points">{loyaltyCard.points}</span>
                            <span className="text-white/60 text-sm font-medium">{t("points.points_unit") || "نقطة"}</span>
                          </div>
                          <p className="text-yellow-200/90 text-sm font-semibold mt-0.5 font-ibm-arabic">≈ {pointsToSar(loyaltyCard.points || 0).toFixed(2)} {t("currency") || "ر.س"}</p>
                        </div>
                        <div className="text-right">
                          {loyaltyCard.cardNumber && (
                            <p className="text-white/40 text-[10px] font-mono tracking-widest">{loyaltyCard.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</p>
                          )}
                          <Badge className="bg-white/20 text-white border-0 text-[9px] font-bold mt-1">نشطة</Badge>
                        </div>
                      </div>
                    </div>

                    {/* قسم استخدام النقاط */}
                    {usePoints && pointsRedeemed > 0 ? (
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <div>
                              <p className="text-sm font-semibold">تم تطبيق {pointsRedeemed} نقطة</p>
                              <p className="text-xs text-green-600 dark:text-green-500">خصم {pointsToSar(pointsRedeemed).toFixed(2)} {t("currency") || "ر.س"}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleCancelPoints}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            data-testid="button-cancel-points"
                          >
                            {t("points.cancel_use") || "إلغاء"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" />
                          <p className="text-sm font-semibold">{t("points.use_points") || "استخدم نقاطك"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={loyaltyCard.points}
                            value={pointsRedeemed || ''}
                            onChange={(e) => {
                              const val = Math.min(Math.max(0, Number(e.target.value)), loyaltyCard.points || 0);
                              setPointsRedeemed(val);
                            }}
                            placeholder={t("points.enter_points") || "أدخل عدد النقاط"}
                            className="bg-white dark:bg-background"
                            data-testid="input-points-redeem"
                          />
                          <Button 
                            onClick={handleApplyPoints}
                            disabled={!pointsRedeemed || pointsRedeemed <= 0}
                            className="shrink-0"
                            data-testid="button-apply-points"
                          >
                            <Sparkles className="w-4 h-4 ml-1" />
                            {t("checkout.apply") || "تطبيق"}
                          </Button>
                        </div>
                        {pointsRedeemed > 0 && (
                          <p className="text-xs text-primary font-medium">
                            خصم {pointsToSar(pointsRedeemed).toFixed(2)} {t("currency") || "ر.س"} من الإجمالي
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={handleProceedPayment} className="w-full h-14 text-lg" data-testid="button-proceed-payment">{t("checkout.confirm_order")}</Button>
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
            {usePoints && pointsRedeemed > 0 && (
              <p className="text-sm text-blue-600 mt-1">يشمل خصم {pointsRedeemed} نقطة = {pointsToSar(pointsRedeemed).toFixed(2)} ر.س</p>
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
