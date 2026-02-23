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
import { User, Gift, CheckCircle, Sparkles, Loader2 } from "lucide-react";
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
  const [pointsVerified, setPointsVerified] = useState(false);
  const { card: loyaltyCard, refetch: refetchLoyaltyCard } = useLoyaltyCard();

  const pointsToSar = (pts: number) => (pts / 100) * 5;

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'callback') {
      const storedOrderData = sessionStorage.getItem('pendingOrderData');
      const storedSessionId = sessionStorage.getItem('paymentSessionId');
      const storedProvider = sessionStorage.getItem('paymentProvider');

      if (storedOrderData && storedSessionId) {
        (async () => {
          try {
            const verifyRes = await apiRequest("POST", "/api/payments/verify", {
              sessionId: storedSessionId,
              provider: storedProvider,
            });
            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              const orderData = JSON.parse(storedOrderData);
              orderData.paymentStatus = 'paid';
              orderData.transactionId = verifyData.transactionId;
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
      const displayNum = data.orderNumber.includes('-') ? data.orderNumber.split('-').pop() : data.orderNumber;
      toast({ title: t("checkout.order_success"), description: `${t("tracking.order_number")}: ${displayNum}` });
    },
    onError: (error) => toast({ variant: "destructive", title: t("checkout.order_error"), description: error.message }),
  });

  const { data: coupons = [] } = useQuery<any[]>({
    queryKey: ["/api/discount-codes"],
  });

  const [showCouponSuggestions, setShowCouponSuggestions] = useState(false);

  const filteredCoupons = coupons.filter(c => 
    c.isActive && 
    c.code.toLowerCase().includes(discountCode.toLowerCase())
  );

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
    setPointsVerified(true);
    toast({ title: t("points.verified_success"), description: `تم تطبيق خصم ${pointsToSar(pointsRedeemed).toFixed(2)} ر.س` });
  };

  const handleCancelPoints = () => {
    setUsePoints(false);
    setPointsVerified(false);
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
    const onlineMethods = ['neoleap', 'geidea', 'apple_pay', 'neoleap-apple-pay', 'bank_card'];
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
          <p>{t("checkout.order_desc")} <span className="font-bold text-primary">#{orderDetails?.orderNumber?.includes('-') ? orderDetails.orderNumber.split('-').pop() : orderDetails?.orderNumber}</span></p>
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
                {usePoints && pointsVerified && (
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
                            setDiscountCode(e.target.value);
                            setShowCouponSuggestions(true);
                          }}
                          onFocus={() => setShowCouponSuggestions(true)}
                          placeholder={t("checkout.enter_discount")}
                          disabled={!!appliedDiscount}
                          className="bg-white dark:bg-background"
                          data-testid="input-discount-code"
                        />
                        {showCouponSuggestions && filteredCoupons.length > 0 && !appliedDiscount && (
                          <div className="absolute z-50 bottom-full mb-2 left-0 right-0 bg-popover border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 zoom-in-95">
                            <div className="p-3 border-b bg-primary/5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-primary" />
                                <span className="text-xs font-black uppercase tracking-wider text-primary">{t("checkout.available_coupons")}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold hover:bg-primary/10" onClick={() => setShowCouponSuggestions(false)}>{t("common.close")}</Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1">
                              {filteredCoupons.map((coupon) => (
                                <button
                                  key={coupon.id}
                                  onClick={() => {
                                    setDiscountCode(coupon.code);
                                    handleValidateDiscount(coupon.code);
                                  }}
                                  className="w-full p-4 flex items-center justify-between hover:bg-primary/10 rounded-xl transition-all group text-right mb-1 last:mb-0"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Tag className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-black text-sm uppercase tracking-wider">{coupon.code}</p>
                                      <p className="text-[10px] font-medium text-muted-foreground line-clamp-1">{coupon.reason || t("checkout.exclusive_discount")}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge className="bg-primary text-white border-0 font-black px-2 py-0.5">
                                      {coupon.discountPercentage}%
                                    </Badge>
                                    <span className="text-[8px] font-bold text-primary/60 uppercase">{t("checkout.discount")}</span>
                                  </div>
                                </button>
                              ))}
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
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <Label className="font-semibold text-blue-800 dark:text-blue-300">{t("points.cluny_points")}</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <span className="text-sm text-blue-700 dark:text-blue-400">{t("points.your_balance")}: {loyaltyCard.points} {t("points.points_unit")}</span>
                        <span className="text-sm font-bold text-blue-800 dark:text-blue-300">≈ {pointsToSar(loyaltyCard.points || 0).toFixed(2)} {t("currency")}</span>
                      </div>

                      {usePoints && pointsRedeemed > 0 ? (
                        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">تم تطبيق النقاط</span>
                          </div>
                          <div className="flex justify-between items-center gap-2 flex-wrap">
                            <span className="text-sm">{pointsRedeemed} {t("points.points_unit")} = {pointsToSar(pointsRedeemed).toFixed(2)} {t("currency")}</span>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={handleCancelPoints}
                              data-testid="button-cancel-points"
                            >
                              {t("points.cancel_use")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              min={0}
                              max={loyaltyCard.points}
                              value={pointsRedeemed || ''}
                              onChange={(e) => {
                                const val = Math.min(Math.max(0, Number(e.target.value)), loyaltyCard.points || 0);
                                setPointsRedeemed(val);
                              }}
                              placeholder={t("points.enter_points")}
                              className="bg-white dark:bg-background"
                              data-testid="input-points-redeem"
                            />
                            <Button 
                              onClick={handleApplyPoints}
                              disabled={!pointsRedeemed || pointsRedeemed <= 0}
                              data-testid="button-apply-points"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span className="mr-1">استخدام</span>
                            </Button>
                          </div>
                          {pointsRedeemed > 0 && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              ستحصل على خصم {pointsToSar(pointsRedeemed).toFixed(2)} {t("currency")}
                            </p>
                          )}
                        </>
                      )}
                    </div>
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
