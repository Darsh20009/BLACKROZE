import { useState, memo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PaymentMethods from "./payment-methods";
import { generatePDF } from "@/lib/pdf-generator";
import { saveOrderLocally } from "@/lib/local-orders";
import { CreditCard, FileText, MessageCircle, Check, ArrowRight, Coffee, ShoppingCart, Wallet, Star, Phone, Truck, Store, MapPin, Upload, User } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod, Branch } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

type CheckoutStep = 'review' | 'delivery' | 'payment' | 'confirmation' | 'success';
type DeliveryType = 'pickup' | 'delivery' | 'curbside' | 'car-pickup' | null;

const CheckoutModal = memo(() => {
 const [, navigate] = useLocation();
 const {
 cartItems,
 isCheckoutOpen,
 hideCheckout,
 clearCart,
 getTotalPrice
 } = useCartStore();
 const { customer } = useCustomer();
 const { t, i18n } = useTranslation();
 const isAr = i18n.language === 'ar';
 const dir = isAr ? 'rtl' : 'ltr';

 const { toast } = useToast();
 const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
 const [currentStep, setCurrentStep] = useState<CheckoutStep>('review');
 const [orderDetails, setOrderDetails] = useState<any>(null);

 const [customerName, setCustomerName] = useState(customer?.name || "");
 const [customerPhone, setCustomerPhone] = useState(customer?.phone || "");

 const [carType, setCarType] = useState(customer?.carType || "");
 const [carColor, setCarColor] = useState(customer?.carColor || "");
 const [carPlate, setCarPlate] = useState("");

 const [deliveryType, setDeliveryType] = useState<DeliveryType>(null);
 const [selectedBranch, setSelectedBranch] = useState<string>("");
 const [deliveryAddress, setDeliveryAddress] = useState("");
 const [deliveryNotes, setDeliveryNotes] = useState("");
 
 const [receiptFile, setReceiptFile] = useState<File | null>(null);
 const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

 const { data: paymentMethods = [] } = useQuery<PaymentMethodInfo[]>({
 queryKey: ["/api/payment-methods"],
 enabled: isCheckoutOpen,
 });

 const { data: branches = [] } = useQuery<Branch[]>({
 queryKey: ["/api/branches"],
 enabled: isCheckoutOpen && deliveryType === 'pickup',
 });

 const createOrderMutation = useMutation({
 mutationFn: async (orderData: any) => {
 const response = await apiRequest("POST", "/api/orders", orderData);
 return response.json();
 },
 onSuccess: (order) => {
 setOrderDetails(order);
 if (!customer) saveOrderLocally(order.orderNumber);
 if (selectedPaymentMethod === 'cash') handlePaymentConfirmed(order);
 else setCurrentStep('confirmation');
 },
 onError: (error) => {
 toast({
 variant: "destructive",
 title: t('checkout.order_error_create'),
 description: error.message,
 });
 },
 });

 const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 if (file.size > 5 * 1024 * 1024) {
 toast({ variant: "destructive", title: t('checkout.file_too_large'), description: t('checkout.file_size_msg') });
 return;
 }
 setReceiptFile(file);
 const reader = new FileReader();
 reader.onloadend = () => setReceiptPreview(reader.result as string);
 reader.readAsDataURL(file);
 }
 };

 const handleProceedDelivery = () => {
 if (!deliveryType) {
 toast({ variant: "destructive", title: t('checkout.select_pickup') });
 return;
 }
 if (deliveryType === 'pickup' && !selectedBranch) {
 toast({ variant: "destructive", title: t('checkout.select_branch_req') });
 return;
 }
 if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
 toast({ variant: "destructive", title: t('checkout.enter_address_req') });
 return;
 }
 if (deliveryType === 'curbside' && (!carType.trim() || !carColor.trim() || !carPlate.trim())) {
   toast({ variant: "destructive", title: t('checkout.enter_car_info') });
   return;
 }
 setCurrentStep('payment');
 };

 const handleProceedPayment = () => {
 if (!selectedPaymentMethod) {
 toast({ variant: "destructive", title: t('checkout.select_payment') });
 return;
 }
 const selectedMethodInfo = paymentMethods.find(m => m.id === selectedPaymentMethod);
 if (selectedMethodInfo?.requiresReceipt && !receiptFile) {
 toast({ variant: "destructive", title: t('checkout.receipt_required') });
 return;
 }
 if (!customerName || !customerPhone) {
 toast({ variant: "destructive", title: t('checkout.name_phone_req') });
 return;
 }

    const orderData = {
      items: cartItems.map(item => ({
        coffeeItemId: item.coffeeItemId,
        quantity: item.quantity,
        price: item.coffeeItem?.price || "0",
        name: item.coffeeItem?.nameAr || "",
      })),
      totalAmount: getTotalPrice().toString(),
      paymentMethod: selectedPaymentMethod,
      status: "pending",
      customerId: customer?.id || null,
      customerInfo: { name: customerName, phone: customerPhone },
      deliveryType: deliveryType,
      carPickup: deliveryType === 'curbside' || deliveryType === 'car-pickup',
      carInfo: (deliveryType === 'curbside' || deliveryType === 'car-pickup') ? {
        carType: carType,
        carColor: carColor,
        plateNumber: carPlate
      } : null,
      carType: (deliveryType === 'curbside' || deliveryType === 'car-pickup') ? carType : null,
      carColor: (deliveryType === 'curbside' || deliveryType === 'car-pickup') ? carColor : null,
      carPlate: (deliveryType === 'curbside' || deliveryType === 'car-pickup') ? carPlate : null,
      plateNumber: (deliveryType === 'curbside' || deliveryType === 'car-pickup') ? carPlate : null,
      branchId: (deliveryType === 'pickup' || deliveryType === 'curbside' || deliveryType === 'car-pickup') ? selectedBranch : null,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
      deliveryNotes: deliveryNotes || null,
      paymentReceiptUrl: receiptPreview || null,
      customerPhone: customerPhone,
    };
 createOrderMutation.mutate(orderData);
 };

  const handlePaymentConfirmed = async (order: any) => {
   try {
     const configRes = await fetch("/api/business-config");
     const config = configRes.ok ? await configRes.json() : null;
     
     if (config?.employeeInvoiceEnabled) {
       const { printAllReceipts } = await import("@/lib/print-utils");
       await printAllReceipts(order);
     } else {
       const pdfBlob = await generatePDF(order, cartItems as any, selectedPaymentMethod as any);
       const url = URL.createObjectURL(pdfBlob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `invoice-${order.orderNumber}.pdf`;
       link.click();
       URL.revokeObjectURL(url);
     }
     
     setCurrentStep('success');
     toast({ title: t('checkout.order_created') });
     setTimeout(() => {
       clearCart();
       hideCheckout();
       navigate(customer ? "/my-orders" : `/tracking?order=${order.orderNumber}`);
     }, 2000);
   } catch (error) {
     toast({ variant: "destructive", title: t('checkout.invoice_error') });
   }
  };

 const handleClose = () => {
 hideCheckout();
 setCurrentStep('review');
 setOrderDetails(null);
 setSelectedPaymentMethod(null);
 setDeliveryType(null);
 setReceiptFile(null);
 setReceiptPreview(null);
 };

 const steps = [
 { id: 'review', title: t('checkout.step_review'), icon: ShoppingCart },
 { id: 'delivery', title: t('checkout.step_delivery'), icon: Truck },
 { id: 'payment', title: t('checkout.step_payment'), icon: Wallet },
 { id: 'confirmation', title: t('checkout.step_confirmation'), icon: Check },
 { id: 'success', title: t('checkout.step_success'), icon: Star },
 ];

 const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

 const getItemName = (item: any) =>
   isAr ? (item.coffeeItem?.nameAr || item.name) : (item.coffeeItem?.nameEn || item.coffeeItem?.nameAr || item.name);

 return (
 <Dialog open={isCheckoutOpen} onOpenChange={handleClose} data-testid="modal-checkout">
 <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-card to-background border-primary/30" dir={dir}>
 <DialogHeader className="text-center pb-6">
 <DialogTitle className="flex items-center justify-center text-3xl font-bold text-primary font-amiri" data-testid="text-checkout-modal-title">
 <Coffee className={`w-8 h-8 ${isAr ? 'ml-3' : 'mr-3'}`} />
 {t('checkout.title')}
 </DialogTitle>
 <p className="text-muted-foreground mt-2">"{t('checkout.tagline')}"</p>
 </DialogHeader>

 <div className="flex items-center justify-center mb-8">
 <div className="flex items-center space-x-4 space-x-reverse">
 {steps.map((step, index) => {
 const isActive = step.id === currentStep;
 const isCompleted = index < getCurrentStepIndex();
 const StepIcon = step.icon;
 return (
 <div key={step.id} className="flex items-center">
 <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isActive ? 'bg-primary border-primary text-primary-foreground' : (isCompleted ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-muted-foreground/30 text-muted-foreground')}`}>
 {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
 </div>
 {index < steps.length - 1 && <div className={`w-12 h-1 mx-2 rounded-full ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />}
 </div>
 );
 })}
 </div>
 </div>

 <div className="space-y-6">
 {currentStep === 'review' && (
 <div className="space-y-6 animate-in fade-in duration-500">
 {!customer && (
 <Card>
 <CardHeader>
   <CardTitle className={`flex items-center gap-2 ${isAr ? 'text-right' : 'text-left'}`}>
     <User className="w-5 h-5" /> {t('checkout.customer_info_title')}
   </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div><Label>{t('checkout.name_label')}</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} dir={dir} /></div>
 <div><Label>{t('checkout.phone_label')}</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} dir="ltr" /></div>
 </CardContent>
 </Card>
 )}
 <div className="bg-card/50 rounded-xl p-6 border border-primary/20">
 <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2`}>
   <ShoppingCart className="w-5 h-5" /> {t('checkout.order_summary_label')}
 </h3>
 <div className="space-y-3 mb-4">
 {cartItems.map((item) => (
 <div key={item.coffeeItemId} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
 <span>{getItemName(item)} × {item.quantity}</span>
 <span className="font-semibold text-primary">{(Number(item.coffeeItem?.price || 0) * item.quantity).toFixed(2)} {t('currency')}</span>
 </div>
 ))}
 </div>
 <div className="border-t border-primary/30 pt-4">
   <div className="flex justify-between items-center bg-primary/10 p-4 rounded-lg">
     <span className="text-lg font-semibold">{t('checkout.total_grand')}</span>
     <span className="text-2xl font-bold text-primary">{getTotalPrice().toFixed(2)} {t('currency')}</span>
   </div>
 </div>
 </div>
 <Button onClick={() => setCurrentStep('delivery')} size="lg" className="w-full">{t('checkout.continue_btn')}</Button>
 </div>
 )}

 {currentStep === 'delivery' && (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="bg-card/50 rounded-xl p-6 border border-primary/20">
 <RadioGroup value={deliveryType || ""} onValueChange={(v) => setDeliveryType(v as DeliveryType)}>
 <div className="space-y-4">
 <div className={`p-4 rounded-lg border-2 ${deliveryType === 'pickup' ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setDeliveryType('pickup')}>
 <div className="flex items-center gap-3"><RadioGroupItem value="pickup" id="pickup" /><Label htmlFor="pickup" className="font-semibold">{t('checkout.pickup_branch')}</Label></div>
 {deliveryType === 'pickup' && (
 <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full mt-2 p-2 rounded border bg-background" dir={dir}>
 <option value="">{t('checkout.branch_placeholder')}</option>
 {(branches as Branch[]).map((b) => <option key={b.id} value={b.id}>{isAr ? b.nameAr : (b.nameEn || b.nameAr)}</option>)}
 </select>
 )}
 </div>
 <div className={`p-4 rounded-lg border-2 ${deliveryType === 'delivery' ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setDeliveryType('delivery')}>
 <div className="flex items-center gap-3"><RadioGroupItem value="delivery" id="delivery" /><Label htmlFor="delivery" className="font-semibold">{t('checkout.home_delivery_opt')}</Label></div>
 {deliveryType === 'delivery' && (
 <div className="mt-2 space-y-2">
 <Textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder={t('checkout.delivery_addr_placeholder')} dir={dir} />
 <Input value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder={t('checkout.notes_placeholder')} dir={dir} />
 </div>
 )}
 </div>
                   <div className={`p-4 rounded-lg border-2 ${deliveryType === 'curbside' ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setDeliveryType('curbside')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="curbside" id="curbside" />
                      <Label htmlFor="curbside" className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        {t('checkout.curbside_opt')}
                      </Label>
                    </div>
                    {deliveryType === 'curbside' && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('checkout.car_type_label')}</Label>
                            <Input 
                              value={carType} 
                              onChange={(e) => setCarType(e.target.value)} 
                              placeholder={t('checkout.car_type_placeholder')} 
                              dir={dir} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('checkout.car_color_label')}</Label>
                            <Input 
                              value={carColor} 
                              onChange={(e) => setCarColor(e.target.value)} 
                              placeholder={t('checkout.car_color_placeholder')} 
                              dir={dir} 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('checkout.plate_label')}</Label>
                          <Input 
                            value={carPlate} 
                            onChange={(e) => setCarPlate(e.target.value)} 
                            placeholder={t('checkout.plate_placeholder')} 
                            dir={dir} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
 </div>
 <div className="flex gap-3">
   <Button variant="outline" onClick={() => setCurrentStep('review')} className="flex-1">{t('checkout.back_btn')}</Button>
   <Button onClick={handleProceedDelivery} className="flex-1">{t('checkout.continue_btn')}</Button>
 </div>
 </div>
 )}

 {currentStep === 'payment' && (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="bg-card/50 rounded-xl p-6 border border-primary/20">
 <PaymentMethods paymentMethods={paymentMethods} selectedMethod={selectedPaymentMethod} onSelectMethod={setSelectedPaymentMethod} />
 {selectedPaymentMethod && paymentMethods.find(m => m.id === selectedPaymentMethod)?.requiresReceipt && (
 <div className="mt-4 p-4 border-2 border-dashed rounded-lg text-center">
 <Label htmlFor="receipt-upload" className="cursor-pointer">
 {receiptPreview ? <img src={receiptPreview} className="max-h-32 mx-auto" alt="receipt" /> : <div><Upload className="mx-auto mb-2" /> {t('checkout.upload_receipt_btn')}</div>}
 </Label>
 <input id="receipt-upload" type="file" onChange={handleReceiptUpload} className="hidden" />
 </div>
 )}
 </div>
 <div className="flex gap-3">
   <Button variant="outline" onClick={() => setCurrentStep('delivery')} className="flex-1">{t('checkout.back_btn')}</Button>
   <Button onClick={handleProceedPayment} disabled={createOrderMutation.isPending} className="flex-1">{t('checkout.confirm_order')}</Button>
 </div>
 </div>
 )}
 </div>
 </DialogContent>
 </Dialog>
 );
});

export default CheckoutModal;
