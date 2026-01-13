import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
 const [, setLocation] = useLocation();
 const { cartItems, clearCart, getTotalPrice, deliveryInfo, getFinalTotal } = useCartStore();
 const { toast } = useToast();

 // Set SEO metadata
 useEffect(() => {
   document.title = "إتمام الشراء - CLUNY CAFE | سهل وآمن";
   const metaDesc = document.querySelector('meta[name="description"]');
   if (metaDesc) metaDesc.setAttribute('content', 'إتمام عملية الشراء بأمان وسهولة في CLUNY CAFE - خيارات دفع متعددة وتوصيل سريع');
 }, []);
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

 // Calculate total drinks from all orders
 const { data: customerOrders = [] } = useQuery<Order[]>({
 queryKey: ["/api/customers", customer?.id, "orders"],
 enabled: !!customer?.id,
 staleTime: 0,
 refetchOnWindowFocus: true,
 });

 // Get loyalty card data
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
 refetchOnWindowFocus: true,
 refetchInterval: 5000, // Refetch every 5 seconds to get updated stamp data
 });

 // Calculate free drinks available from loyalty card
 const calculateFreeDrinks = () => {
 if (!loyaltyCard) return 0;

 // Get free cups from loyalty card, or calculate from stamps if not available
 const freeCupsEarned = loyaltyCard.freeCupsEarned || Math.floor((loyaltyCard.stamps || 0) / 6) || 0;
 const freeCupsRedeemed = loyaltyCard.freeCupsRedeemed || 0;
 // المشروبات المجانية المتاحة= المكتسبة- المستخدمة
 const available = freeCupsEarned - freeCupsRedeemed;
 return Math.max(0, available);
 };

 const availableFreeDrinks = calculateFreeDrinks();
 
 // Get detailed free drinks data for display
 const totalFreeCupsEarned = loyaltyCard?.freeCupsEarned || Math.floor((loyaltyCard?.stamps || 0) / 6) || 0;
 const totalFreeCupsRedeemed = loyaltyCard?.freeCupsRedeemed || 0;

 // Auto-select cheapest drinks for free
 const getAutoSelectedFreeItems = () => {
 if (availableFreeDrinks === 0 || cartItems.length === 0) {
 return {};
 }

 // Sort cart items by price (cheapest first)
 const sortedItems = [...cartItems].sort((a, b) => {
 const priceA = parseFloat(String(a.coffeeItem?.price || 0));
 const priceB = parseFloat(String(b.coffeeItem?.price || 0));
 return priceA - priceB;
 });

 const selected: {[key: string]: number} = {};
 let remaining = availableFreeDrinks;

 // Allocate free drinks to cheapest items first
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

 // Auto-apply free items when selecting qahwa-card payment
 useEffect(() => {
 if (selectedPaymentMethod === 'qahwa-card' && availableFreeDrinks > 0) {
 const autoSelected = getAutoSelectedFreeItems();
 setSelectedFreeItems(autoSelected);
 }
 }, [selectedPaymentMethod, availableFreeDrinks, cartItems]);

 // Redirect to delivery selection if no delivery info (but not after successful order)
 useEffect(() => {
 if (!deliveryInfo && !showSuccessPage && cartItems.length > 0) {
 setLocation("/delivery");
 }
 }, [deliveryInfo, setLocation, showSuccessPage, cartItems.length]);

 // Load customer data if registered
 useEffect(() => {
 // First check CustomerContext (database registered users)
 if (customer?.name && customer?.phone) {
 setCustomerName(customer.name);
 setCustomerPhone(customer.phone);
 if (customer?.email) {
 setCustomerEmail(customer.email);
 }
 setIsRegisteredCustomer(true);
 return;
 }

 // Then check customerStorage (local storage users)
 const profile = customerStorage.getProfile();
 if (profile && !customerStorage.isGuestMode()) {
 setCustomerName(profile.name);
 setCustomerPhone(profile.phone);
 setIsRegisteredCustomer(true);
 }
 }, [customer]);

 const profile = customerStorage.getProfile();
 const localFreeDrinks = profile && profile.freeDrinks > 0;
 const hasFreeDrinks = localFreeDrinks || availableFreeDrinks > 0;

  const { data: paymentMethods = [], isLoading: loadingPaymentMethods } = useQuery<PaymentMethodInfo[]>({
    queryKey: ["/api/payment-methods"],
    queryFn: async () => {
      const res = await fetch(`/api/payment-methods`);
      if (!res.ok) throw new Error('Failed to fetch payment methods');
      const data = await res.json();
      return data;
    }
  });

 // Don't auto-apply discount for qahwa-card - it uses free items selection instead
 useEffect(() => {
 if (selectedPaymentMethod !== 'qahwa-card' && appliedDiscount?.code === 'qahwa-card') {
 // Remove qahwa-card discount if switching away from qahwa-card
 setAppliedDiscount(null);
 }
 }, [selectedPaymentMethod]);

 const generateCodesMutation = useMutation({
 mutationFn: async (orderId: number) => {
 const response = await apiRequest("POST", `/api/orders/${orderId}/generate-codes`, {});
 return response.json();
 },
 onSuccess: (codes) => {
 setLoyaltyCodes(codes);
 },
 onError: (error) => {
 console.error("Failed to generate loyalty codes:", error);
 },
 });

 const createOrderMutation = useMutation({
 mutationFn: async (orderData: any) => {
 const response = await apiRequest("POST", "/api/orders", orderData);
 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || "فشل في إنشاء الطلب");
 }
 return response.json();
 },
 onSuccess: (data) => {
 setOrderDetails(data);
 clearCart();
 setShowSuccessPage(true);

 // تحديث قائمة الطلبات في لوحة المدير
 queryClient.invalidateQueries({ queryKey: ["/api/orders"] });

 // Generate loyalty codes for the order
 if (data.id) {
 generateCodesMutation.mutate(data.id);
 }

 // Save customer data and sync with CustomerContext
 if (customerPhone) {
 localStorage.setItem("customer-phone", customerPhone);
 if (data.customerId) {
 localStorage.setItem("customer-id", data.customerId);

 // Update CustomerContext if available
 if (customer?.id !== data.customerId) {
 // Fetch and update customer in context
 fetch(`/api/customers/${data.customerId}`)
 .then(res => res.json())
 .then(customerData => {
 if (customerData && !customerData.error) {
 // تحديث بيانات العميل
 setCustomer(customerData);
 }
 })
 .catch(err => console.error("Failed to sync customer:", err));
 }
 }
 }

 toast({
 title: "تم إنشاء الطلب بنجاح",
 description: `رقم الطلب: ${data.orderNumber}`,
 });
 },
 onError: (error) => {
 toast({
 variant: "destructive",
 title: "خطأ في إنشاء الطلب",
 description: error.message,
 });
 },
 });

 const handleValidateDiscount = async () => {
 if (!discountCode.trim()) {
 toast({
 variant: "destructive",
 title: "يرجى إدخال كود الخصم",
 });
 return;
 }

 setIsValidatingDiscount(true);
 try {
 const response = await fetch('/api/discount-codes/validate', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ code: discountCode.trim() }),
 });
 const data = await response.json();
 
 if (response.ok && data.valid) {
 setAppliedDiscount({
 code: discountCode.trim(),
 percentage: data.discountPercentage
 });
 toast({
 title: "تم تطبيق الخصم بنجاح",
 description: `خصم ${data.discountPercentage}% على إجمالي الطلب`,
 });
 } else {
 setAppliedDiscount(null);
 toast({
 variant: "destructive",
 title: "كود خصم غير صحيح",
 description: data.error || "الكود غير موجود أو منتهي الصلاحية",
 });
 }
 } catch (error) {
 setAppliedDiscount(null);
 toast({
 variant: "destructive",
 title: "خطأ في التحقق من الكود",
 description: "حاول مرة أخرى لاحقاً",
 });
 } finally {
 setIsValidatingDiscount(false);
 }
 };

  const handleProceedPayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        variant: "destructive",
        title: "يرجى اختيار طريقة الدفع",
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        variant: "destructive",
        title: "يرجى إدخال اسم العميل",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmAndCreateOrder = async () => {
    // For non-registered customers, phone and email are mandatory
    if (!isRegisteredCustomer) {
      if (!customerPhone.trim()) {
        toast({
          variant: "destructive",
          title: "رقم الجوال مطلوب",
          description: "الرجاء إدخال رقم جوالك (9 أرقام تبدأ بـ 5)",
        });
        return;
      }

      // Validate phone format
      if (!/^5\d{8}$/.test(customerPhone.trim())) {
        toast({
          variant: "destructive",
          title: "رقم جوال غير صحيح",
          description: "الرجاء إدخال 9 أرقام تبدأ بـ 5",
        });
        return;
      }

      if (!customerEmail.trim()) {
        toast({
          variant: "destructive",
          title: "البريد الإلكتروني مطلوب",
          description: "الرجاء إدخال بريدك الإلكتروني",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        toast({
          variant: "destructive",
          title: "البريد الإلكتروني غير صحيح",
          description: "الرجاء إدخال بريد إلكتروني صحيح",
        });
        return;
      }

      // If customer wants to register, validate password
      if (wantToRegister) {
        if (!customerPassword.trim()) {
          toast({
            variant: "destructive",
            title: "كلمة السر مطلوبة",
            description: "الرجاء إدخال كلمة سر قوية",
          });
          return;
        }

        if (customerPassword.length < 6) {
          toast({
            variant: "destructive",
            title: "كلمة السر ضعيفة",
            description: "كلمة السر يجب أن تكون 6 أحرف على الأقل",
          });
          return;
        }
      }
    }

    // Validate transfer owner name for non-cash payments
    if (selectedPaymentMethod !== 'cash' && selectedPaymentMethod !== 'qahwa-card' && !isSameAsCustomer && !transferOwnerName.trim()) {
      toast({
        variant: "destructive",
        title: "يرجى إدخال اسم صاحب التحويل",
      });
      return;
    }

    // Validate payment receipt for electronic payments
    const electronicPayments = ['alinma', 'ur', 'barq', 'rajhi'];
    if (electronicPayments.includes(selectedPaymentMethod!) && !paymentReceiptUrl) {
      toast({
        variant: "destructive",
        title: "إيصال الدفع مطلوب",
        description: "يرجى رفع صورة إيصال الدفع",
      });
      return;
    }

    // Check if using qahwa-card payment method (free drink)
    const isQahwaCardPayment = selectedPaymentMethod === 'qahwa-card';

    // Validate qahwa-card usage
    if (isQahwaCardPayment && availableFreeDrinks <= 0) {
      toast({
        variant: "destructive",
        title: "ليس لديك مشروبات مجانية ",
        description: "اطلب المزيد للحصول على مشروب مجاني!"
      });
      return;
    }

    // For qahwa-card payment, validate secondary payment for remaining drinks
    if (isQahwaCardPayment && availableFreeDrinks > 0) {
      const totalSelectedFreeItems = Object.values(selectedFreeItems).reduce((sum, val) => sum + val, 0);
      const totalDrinks = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const remainingDrinks = totalDrinks - totalSelectedFreeItems;
      
      // If there are remaining drinks, require secondary payment method
      if (remainingDrinks > 0) {
        if (!secondaryPaymentMethod) {
          toast({
            variant: "destructive",
            title: "اختر طريقة دفع للمشروبات المتبقية",
            description: `يتبقى ${remainingDrinks} مشروب يحتاج طريقة دفع إضافية`
          });
          return;
        }
        
        // Validate secondary payment receipt if needed
        const secondaryElectronicPayments = ['alinma', 'ur', 'barq', 'rajhi'];
        if (secondaryElectronicPayments.includes(secondaryPaymentMethod) && !secondaryPaymentReceiptUrl) {
          toast({
            variant: "destructive",
            title: "إيصال الدفع مطلوب للطريقة الثانية",
            description: "يرجى رفع صورة إيصال الدفع"
          });
          return;
        }
      }
    }

    // Check if using free drink checkbox (for local storage users)
    const profile = customerStorage.getProfile();
    const hasFreeDrinks = customer?.id ? false : (profile && profile.freeDrinks > 0);

    if (useFreeDrink && !hasFreeDrinks) {
      toast({
        variant: "destructive",
        title: "ليس لديك مشروبات مجانية ",
        description: "يرجى إلغاء تفعيل استخدام بطاقةتي"
      });
      return;
    }

    // Calculate total amount considering free drinks and discount codes
    let totalAmount = getTotalPrice();
    let freeItemsDiscount = 0; // Initialize freeItemsDiscount
    
    // If using qahwa-card, calculate based on selected free items (no discount code applies)
    if (isQahwaCardPayment) {
      // Calculate total discount from selected free items
      Object.entries(selectedFreeItems).forEach(([itemId, quantity]) => {
        const item = cartItems.find(ci => ci.coffeeItemId === itemId);
        if (item && quantity > 0) {
          const itemPrice = typeof item.coffeeItem?.price === 'number'
            ? item.coffeeItem.price
            : parseFloat(String(item.coffeeItem?.price || 0));
          freeItemsDiscount += itemPrice * quantity;
        }
      });
      totalAmount = Math.max(0, totalAmount - freeItemsDiscount);
    } else if (useFreeDrink && hasFreeDrinks) {
      totalAmount = 0; // Local storage free drink = full order free
    } else if (appliedDiscount && !useFreeDrink) {
      // Apply discount code if available (and not using other discount methods)
      const discountAmount = totalAmount * (appliedDiscount.percentage / 100);
      totalAmount = Math.max(0, totalAmount - discountAmount);
    }

    // Final validation - ensure total amount is a valid number
    if (isNaN(totalAmount) || totalAmount === null || totalAmount === undefined) {
      toast({
        variant: "destructive",
        title: "خطأ في حساب المبلغ",
        description: "حدث خطأ في حساب إجمالي الطلب، يرجى المحاولة مرة أخرى"
      });
      return;
    }

    // Prepare order items
    const orderItems = cartItems.map(item => ({
      coffeeItemId: item.coffeeItemId,
      quantity: item.quantity,
      price: typeof item.coffeeItem?.price === 'number' 
        ? item.coffeeItem.price 
        : parseFloat(String(item.coffeeItem?.price || "0")),
      name: item.coffeeItem?.nameAr || "",
    }));

    // Get or create customer ID
    let activeCustomerId = customer?.id;

    // If customer wants to register, register first
    if (!activeCustomerId && wantToRegister && customerPhone && customerEmail && customerPassword) {
      try {
        setIsRegistering(true);
        const registerResponse = await fetch("/api/customers/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim(),
            password: customerPassword
          })
        });

        if (registerResponse.ok) {
          const newCustomer = await registerResponse.json();
          activeCustomerId = newCustomer.id;
          
          // تسجيل الدخول التلقائي بحفظ بيانات المستخدم في CustomerContext
          setCustomer({
            id: newCustomer.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email
          } as any);
          
          toast({
            title: "تم التسجيل بنجاح!",
            description: "أهلاً وسهلاً بك في CLUNY CAFE!",
          });
        } else {
          const errorData = await registerResponse.json();
          toast({
            variant: "destructive",
            title: "خطأ في التسجيل",
            description: errorData.error || "حدث خطأ أثناء التسجيل",
          });
          setIsRegistering(false);
          return;
        }
      } catch (error) {
        console.error("Registration error:", error);
        toast({
          variant: "destructive",
          title: "خطأ في التسجيل",
          description: "حدث خطأ أثناء التسجيل",
        });
        setIsRegistering(false);
        return;
      }
    }

    // If user is authenticated but we need to ensure customer exists in backend
    if (customerPhone && !activeCustomerId && !wantToRegister) {
      try {
        const authResponse = await fetch("/api/customers/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: customerPhone,
            name: customerName.trim()
          })
        });

        if (authResponse.ok) {
          const customerData = await authResponse.json();
          activeCustomerId = customerData.id;
        }
      } catch (error) {
        console.error("Authentication error:", error);
      }
    }
    setIsRegistering(false);

    // Calculate number of free drinks used
    const usedFreeDrinks = isQahwaCardPayment ? Object.values(selectedFreeItems).reduce((sum, val) => sum + val, 0) : 0;
    // Determine the correct order type based on delivery info
    const isDineIn = deliveryInfo?.type === 'pickup' && deliveryInfo?.dineIn;
    const finalOrderType = isDineIn ? 'dine-in' : 'regular';

    const orderData = {
      items: orderItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod: selectedPaymentMethod,
      secondaryPaymentMethod: secondaryPaymentMethod || undefined,
      paymentDetails: isSameAsCustomer ? customerName.trim() : transferOwnerName.trim(),
      paymentReceiptUrl: paymentReceiptUrl || undefined,
      secondaryPaymentReceiptUrl: secondaryPaymentReceiptUrl || undefined,
      discountCode: appliedDiscount?.code || null,
      discountPercentage: appliedDiscount?.percentage || null,
      orderType: finalOrderType,
      deliveryType: deliveryInfo?.type || null,
      deliveryAddress: deliveryInfo?.type === 'delivery' ? deliveryInfo.address : null,
      deliveryFee: Number(deliveryInfo?.deliveryFee || 0),
      branchId: deliveryInfo?.branchId || null,
      customerInfo: {
        customerName: customerName.trim(),
        transferOwnerName: isSameAsCustomer ? customerName.trim() : transferOwnerName.trim(),
        phoneNumber: customerPhone.trim() || null,
      },
      customerId: activeCustomerId || null,
      usedFreeDrinks: usedFreeDrinks,
      freeItemsDiscount: isQahwaCardPayment ? Number(freeItemsDiscount.toFixed(2)) : 0,
      customerNotes: customerNotes.trim() || null
    };

    console.log("Submitting order data:", JSON.stringify(orderData, null, 2));
    createOrderMutation.mutate(orderData);
  };

  const handlePaymentConfirmed = async (order: any) => {
    try {
      // Save order to localStorage if customer is registered
      if (isRegisteredCustomer && !customerStorage.isGuestMode()) {
        customerStorage.addOrder({
          orderNumber: order.orderNumber,
          items: cartItems.map(item => {
            const priceValue = typeof item.coffeeItem?.price === 'number' 
              ? item.coffeeItem.price 
              : parseFloat(String(item.coffeeItem?.price || "0"));
            return {
              id: item.coffeeItemId,
              nameAr: item.coffeeItem?.nameAr || "",
              quantity: item.quantity,
              price: priceValue
            };
          }),
          totalAmount: parseFloat(order.totalAmount),
          paymentMethod: selectedPaymentMethod!,
          transferOwnerName: isSameAsCustomer ? customerName : transferOwnerName,
          usedFreeDrink: useFreeDrink
        });

        // Use free drink if selected
        if (useFreeDrink) {
          customerStorage.useFreeDrink();
          toast({
            title: "تم استخدام المشروب المجاني!",
            description: "استمتع بقهوتك",
          });
        }
      }

      // Generate PDF invoice
      const pdfCartItems = cartItems.map(item => ({
        coffeeItemId: item.coffeeItemId,
        quantity: item.quantity,
        coffeeItem: item.coffeeItem ? {
          nameAr: item.coffeeItem.nameAr,
          nameEn: item.coffeeItem.nameEn ?? null,
          price: typeof item.coffeeItem.price === 'number' 
            ? String(item.coffeeItem.price) 
            : String(item.coffeeItem.price || "0")
        } : undefined
      }));
      const pdfBlob = await generatePDF(order, pdfCartItems, selectedPaymentMethod!);

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Generate loyalty codes
      if (order.id) {
        generateCodesMutation.mutate(order.id);
      }

      // Clear cart
      clearCart();

      // Show success page
      setShowSuccessPage(true);
      setShowConfirmation(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في توليد الفاتورة ",
        description: "حدث خطأ أثناء إنشاء الفاتورة ",
      });
    }
  };

 const handleCopyCode = async (code: string, codeId: string) => {
 try {
 await navigator.clipboard.writeText(code);
 setCopiedCodeId(codeId);
 setTimeout(() => setCopiedCodeId(null), 2000);
 toast({
 title: "تم نسخ الكود",
 description: "الكود جاهز للاستخدام في صفحة بطاقتي",
 });
 } catch (error) {
 toast({
 variant: "destructive",
 title: "خطأ في النسخ",
 description: "حدث خطأ أثناء نسخ الكود",
 });
 }
 };

 const handleShareWhatsApp = () => {
 if (orderDetails) {
 const totalAmount = parseFloat(orderDetails.totalAmount).toFixed(2);

 // Use orderDetails.items if available (after cart cleared), otherwise use cartItems
 const itemsSource = orderDetails.items && orderDetails.items.length > 0 ? orderDetails.items : cartItems;
 const itemsWithPrices = itemsSource.map((item: any) => {
 if (orderDetails.items && orderDetails.items.length > 0) {
 // Using orderDetails.items format
 const itemTotal = (parseFloat(item.price || "0") * item.quantity).toFixed(2);
 return `• ${item.name} × ${item.quantity} = ${itemTotal} ريال`;
 } else {
 // Using cartItems format
 const itemPrice = parseFloat(item.coffeeItem?.price || "0");
 const itemTotal = (itemPrice * item.quantity).toFixed(2);
 return `• ${item.coffeeItem?.nameAr} × ${item.quantity} = ${itemTotal} ريال`;
 }
 }).join('\n');

 const customerName = orderDetails.customerInfo?.customerName || 'غير محدد';
 const transferName = orderDetails.customerInfo?.transferOwnerName || 'غير محدد';

 const message = `طلب جديد للتجهيز - CLUNY CAFE

تفاصيل الطلب:
رقم الطلب: ${orderDetails.orderNumber}
اسم العميل: ${customerName}
اسم صاحب التحويل: ${transferName}
طريقة الدفع: ${getPaymentMethodName(selectedPaymentMethod!)}

المنتجات المطلوبة :
${itemsWithPrices}

إجمالي المبلغ: ${totalAmount} ريال

يرجى تجهيز الطلب وإشعار العميل عند الانتهاء.
شكراً لكم`;

 const encodedMessage = encodeURIComponent(message);
 window.open(`https://wa.me/966532441566?text=${encodedMessage}`, '_blank');
 }
 };

 const getPaymentMethodName = (method: PaymentMethod) => {
 const methodInfo = paymentMethods.find(m => m.id === method);
 return methodInfo?.nameAr || method;
 };

 const getPaymentMethodDetails = (method: PaymentMethod) => {
 const methodInfo = paymentMethods.find(m => m.id === method);
 return methodInfo?.details || '';
 };

 // Calculate final price considering discounts and free items
 const calculateFinalPrice = () => {
 let finalPrice = getTotalPrice();

 if (selectedPaymentMethod === 'qahwa-card' && availableFreeDrinks > 0) {
 // Deduct free items from total
 let freeItemsTotal = 0;
 Object.entries(selectedFreeItems).forEach(([itemId, quantity]) => {
 const item = cartItems.find(ci => ci.coffeeItemId === itemId);
 if (item && quantity > 0) {
 const itemPrice = typeof item.coffeeItem?.price === 'number'
 ? item.coffeeItem.price
 : parseFloat(String(item.coffeeItem?.price || 0));
 freeItemsTotal += itemPrice * quantity;
 }
 });
 finalPrice = Math.max(0, finalPrice - freeItemsTotal);
 } else if (useFreeDrink && !isRegisteredCustomer) {
 // Local storage free drink = full order free
 finalPrice = 0;
 } else if (appliedDiscount && !useFreeDrink) {
 // Apply discount code
 const discountAmount = finalPrice * (appliedDiscount.percentage / 100);
 finalPrice = Math.max(0, finalPrice - discountAmount);
 }

 return finalPrice;
 };

 // Success Page
 if (showSuccessPage) {
 return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-primary/5 to-background dark:from-slate-950 dark:via-amber-950 dark:to-slate-900 relative overflow-hidden">
   {/* Floating Coffee Elements */}
   <div className="absolute inset-0 pointer-events-none">
   <div className="absolute top-20 left-20 w-16 h-16 bg-accent/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s'}}></div>
   <div className="absolute top-40 right-20 w-12 h-12 bg-primary/15 rounded-full blur-lg animate-bounce" style={{animationDelay: '1s'}}></div>
   <div className="absolute bottom-40 left-16 w-20 h-20 bg-accent/10 rounded-full blur-2xl animate-bounce" style={{animationDelay: '2s'}}></div>
   <div className="absolute bottom-20 right-32 w-14 h-14 bg-primary/12 rounded-full blur-xl animate-bounce" style={{animationDelay: '1.5s'}}></div>
   </div>
   <div className="relative z-10 flex items-center justify-center min-h-screen p-8 bg-[#533d2d]">
   <div className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-primary/20 text-center space-y-6">
   <div className="relative">
   <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
   <CheckCircle className="w-12 h-12 text-green-600 animate-in zoom-in duration-500" />
   </div>
   <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-pulse" />
   <Sparkles className="absolute bottom-0 left-1/4 w-4 h-4 text-yellow-400 animate-pulse" style={{animationDelay: '1s'}} />
   </div>

   <div className="space-y-2">
   <h2 className="text-3xl font-playfair font-bold text-accent dark:text-accent">شكراً لطلبك!</h2>
   <p className="text-slate-600 dark:text-slate-400">طلبك رقم <span className="font-bold text-primary">#{orderDetails?.orderNumber}</span> قيد التحضير الآن بكل حب</p>
   </div>

   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
   <div className="flex justify-between items-center text-sm">
   <span className="text-slate-500">حالة الطلب:</span>
   <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">بانتظار التأكيد</span>
   </div>
   <div className="flex justify-between items-center text-sm">
   <span className="text-slate-500">طريقة الدفع:</span>
   <span className="font-bold">{getPaymentMethodName(selectedPaymentMethod!)}</span>
   </div>
   <div className="flex justify-between items-center text-sm">
   <span className="text-slate-500">المبلغ الإجمالي:</span>
   <span className="font-bold text-lg text-primary">{parseFloat(orderDetails?.totalAmount || 0).toFixed(2)} ريال</span>
   </div>
   </div>

   {loyaltyCodes.length > 0 && (
   <div className="space-y-4">
   <div className="flex items-center justify-center gap-2 text-accent dark:text-accent">
   <Award className="w-5 h-5" />
   <h3 className="font-bold">أكواد الختم الخاصة بك</h3>
   </div>
   <p className="text-xs text-slate-500">استخدم هذه الأكواد في صفحة "بطاقتي" للحصول على أختام</p>
   <div className="space-y-2">
   {loyaltyCodes.map((code) => (
   <div key={code.id} className="flex items-center justify-between bg-white dark:bg-slate-800 border-2 border-dashed border-primary/30 p-3 rounded-xl">
   <span className="font-mono font-bold tracking-wider">{code.code}</span>
   <Button
   variant="ghost"
   size="sm"
   onClick={() => handleCopyCode(code.code, code.id)}
   className="text-primary hover:bg-primary/10"
   >
   {copiedCodeId === code.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
   </Button>
   </div>
   ))}
   </div>
   </div>
   )}

   <div className="grid grid-cols-1 gap-3 pt-4">
   <Button
   onClick={handleShareWhatsApp}
   className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg"
   >
   <MessageCircle className="w-5 h-5" />
   إرسال الطلب عبر الواتساب
   </Button>
   <div className="grid grid-cols-2 gap-3">
   <Button
   variant="outline"
   onClick={() => setLocation("/tracking")}
   className="h-12 border-2 border-primary/20 hover:bg-primary/5 rounded-xl flex items-center justify-center gap-2"
   >
   <Clock className="w-5 h-5" />
   تتبع الطلب
   </Button>
   <Button
   onClick={() => setLocation("/menu")}
   className="h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-md"
   >
   العودة للقائمة
   </Button>
   </div>
   </div>
   </div>
   </div>
  </div>
 );
 }

 return (
  <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#1a1410] relative overflow-hidden font-ibm-arabic" dir="rtl">
   {/* Creative Background Decorations */}
   <div className="absolute inset-0 pointer-events-none opacity-20">
   <div className="absolute top-20 left-20 w-32 h-32 bg-accent/15 dark:bg-accent/20 rounded-full blur-2xl animate-pulse"></div>
   <div className="absolute bottom-32 right-16 w-24 h-24 bg-primary/10 dark:bg-primary/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
   <div className="absolute top-1/2 left-10 w-20 h-20 bg-accent/8 dark:bg-accent/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
   </div>
   <div className="relative z-10 py-6 md:py-12">
   <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
   {/* Clean Header */}
   <div className="text-center mb-6 md:mb-12">
   <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-accent dark:text-accent mb-2 md:mb-4">
   إتمام عملية الدفع
   </h1>
   <p className="text-accent dark:text-accent/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
   اختر طريقة الدفع المفضلة لديك واستمتع بتجربة قهوة لا تُنسى
   </p>
   <div className="mt-4 md:mt-6 flex items-center justify-center space-x-2">
   <div className="w-6 md:w-8 h-1 bg-primary/50 rounded-full animate-pulse"></div>
   <Coffee className="w-5 md:w-6 h-5 md:h-6 text-primary animate-bounce" />
   <div className="w-6 md:w-8 h-1 bg-primary/50 rounded-full animate-pulse"></div>
   </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
   {/* Modern Order Summary Card */}
   <div className="lg:col-span-1 order-2 lg:order-1">
   <Card className="bg-white border-slate-200 shadow-lg">
   <CardHeader className="bg-slate-100 rounded-t-lg p-4 md:p-6">
   <CardTitle className="font-playfair text-lg md:text-xl font-bold flex items-center text-slate-700">
   <Coffee className="w-4 md:w-5 h-4 md:h-5 ml-2" />
   ملخص طلبك
   </CardTitle>
   </CardHeader>
   <CardContent className="p-4 md:p-6" data-testid="section-order-summary">
   <div className="space-y-4 mb-6">
   {cartItems.map((item, index) => (
   <div
   key={item.coffeeItemId}
   className="flex justify-between items-center py-3 px-4 bg-violet-50 rounded-xl border border-violet-100 animate-in fade-in-0 slide-in-from-left-5 duration-500"
   style={{animationDelay: `${index * 0.1}s`}}
   >
   <div className="flex items-center space-x-3 space-x-reverse">
   <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
   <Coffee className="w-6 h-6 text-violet-600" />
   </div>
   <div>
   <p className="font-bold text-violet-800" data-testid={`text-summary-item-${item.coffeeItemId}`}>
   {item.coffeeItem?.nameAr}
   </p>
   <p className="text-sm text-violet-600">الكمية : {item.quantity}</p>
   </div>
   </div>
   <span className="font-bold text-violet-700 text-lg" data-testid={`text-summary-price-${item.coffeeItemId}`}>
   {((typeof item.coffeeItem?.price === 'number' ? item.coffeeItem.price : parseFloat(String(item.coffeeItem?.price || "0"))) * item.quantity).toFixed(2)} ريال
   </span>
   </div>
   ))}
   </div>

   {/* Discount Code Section */}
   {!useFreeDrink && selectedPaymentMethod !== 'qahwa-card' && (
   <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gradient-to-r from-amber-50 to-background dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg md:rounded-xl border-2 border-primary dark:border-primary">
   <div className="flex items-center gap-2 mb-2">
   <Gift className="w-4 md:w-5 h-4 md:h-5 text-accent" />
   <h3 className="font-bold text-sm md:text-base text-accent dark:text-accent">كود الخصم</h3>
   </div>
   {appliedDiscount ? (
   <div className="flex items-center justify-between bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
   <div className="flex items-center gap-2">
   <CheckCircle className="w-5 h-5 text-green-600" />
   <span className="font-bold text-green-800 dark:text-green-200">
   {appliedDiscount.code} - خصم {appliedDiscount.percentage}%
   </span>
   </div>
   <Button
   variant="ghost"
   size="sm"
   onClick={() => {
   setAppliedDiscount(null);
   setDiscountCode("");
   }}
   className="text-red-600 hover:text-red-700 hover:bg-red-100"
   data-testid="button-remove-discount"
   >
   إزالة
   </Button>
   </div>
   ) : (
   <div className="flex gap-2">
   <Input
   type="text"
   value={discountCode}
   onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
   placeholder="أدخل كود الخصم"
   className="flex-1"
   data-testid="input-discount-code"
   onKeyDown={(e) => {
   if (e.key === 'Enter') {
   handleValidateDiscount();
   }
   }}
   />
   <Button
   onClick={handleValidateDiscount}
   disabled={isValidatingDiscount || !discountCode.trim()}
   className="bg-primary hover:bg-primary"
   data-testid="button-apply-discount"
   >
   {isValidatingDiscount ? "جاري التحقق..." : "تطبيق"}
   </Button>
   </div>
   )}
   </div>
   )}

   {/* Delivery Information Summary */}
   {deliveryInfo && (
   <Card className="mb-4 border-2 border-primary/20 bg-gradient-to-br from-slate-50 to-white">
   <CardHeader className="pb-3">
   <div className="flex items-center justify-between">
   <CardTitle className="font-playfair text-lg flex items-center gap-2">
   {deliveryInfo.type === 'pickup' ? (
   <>
   <Store className="w-5 h-5 text-primary" />
   <span data-testid="text-delivery-type">استلام من الفرع</span>
   </>
   ) : (
   <>
   <Truck className="w-5 h-5 text-primary" />
   <span data-testid="text-delivery-type">توصيل للمنزل</span>
   </>
   )}
   </CardTitle>
   <Button
   variant="ghost"
   size="sm"
   onClick={() => setLocation("/delivery")}
   data-testid="button-change-delivery"
   className="text-primary hover:bg-primary/10"
   >
   <Edit className="w-4 h-4 ml-1" />
   تغيير
   </Button>
   </div>
   </CardHeader>
   <CardContent className="space-y-2 pt-0">
   {deliveryInfo.type === 'delivery' && deliveryInfo.address && (
   <>
   <div className="flex items-start gap-2 text-sm">
   <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
   <div className="flex-1">
   <p className="text-foreground font-medium" data-testid="text-delivery-address">
   {deliveryInfo.address.fullAddress}
   </p>
   <p className="text-muted-foreground">
   المنطقة : {deliveryInfo.address.zone}
   </p>
   </div>
   </div>
   <div className="flex justify-between items-center pt-2 border-t border-border">
   <span className="text-sm text-muted-foreground">رسوم التوصيل:</span>
   <span className="font-semibold text-primary" data-testid="text-delivery-fee">
   {deliveryInfo.deliveryFee || 0} ريال
   </span>
   </div>
   </>
   )}
   {deliveryInfo.type === 'pickup' && (
   <div className="flex items-start gap-2 text-sm">
   <Store className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
   <div className="flex-1">
   {deliveryInfo.branchName && (
   <p className="text-foreground font-medium" data-testid="text-branch-name">
   {deliveryInfo.branchName}
   </p>
   )}
   {deliveryInfo.branchAddress && (
   <p className="text-muted-foreground" data-testid="text-branch-address">
   {deliveryInfo.branchAddress}
   </p>
   )}
   <p className="text-xs mt-1 text-muted-foreground">
   سيتم إعلامك عند جاهزية الطلب
   </p>
   </div>
   </div>
   )}
   {/* Cost Breakdown */}
   <div className="pt-3 border-t border-border space-y-1.5">
   <div className="flex justify-between text-sm">
   <span className="text-muted-foreground">المجموع الفرعي:</span>
   <span className="font-medium">{getTotalPrice().toFixed(2)} ريال</span>
   </div>
   {(deliveryInfo.deliveryFee ?? 0) > 0 && (
   <div className="flex justify-between text-sm">
   <span className="text-muted-foreground">رسوم التوصيل:</span>
   <span className="font-medium text-primary">+{deliveryInfo.deliveryFee} ريال</span>
   </div>
   )}
   <div className="flex justify-between text-base font-bold pt-1.5 border-t border-border">
   <span>الإجمالي النهائي:</span>
   <span className="text-primary" data-testid="text-final-total">
   {getFinalTotal().toFixed(2)} ريال
   </span>
   </div>
   </div>
   </CardContent>
   </Card>
   )}

   <div className={`bg-gradient-to-r ${useFreeDrink ? 'from-green-500 to-emerald-600' : 'from-primary to-secondary'} text-primary-foreground rounded-xl p-6 shadow-lg relative overflow-hidden`}>
   <div className="absolute inset-0 bg-gradient-to-r from-card/10 to-transparent opacity-50"></div>
   <div className="relative z-10">
   <div className="flex justify-between items-center mb-2">
   <span className="font-playfair text-xl font-bold flex items-center">
   <Coffee className="w-6 h-6 ml-2 animate-pulse" />
   المجموع الكلي:
   </span>
   <div className="text-center">
   {useFreeDrink ? (
   <>
   <span className="text-3xl font-bold block" data-testid="text-summary-total">
   مجاني
   </span>
   <span className="text-sm opacity-90 line-through">
   {getTotalPrice().toFixed(2)} ريال
   </span>
   </>
   ) : (
   <>
   {appliedDiscount ? (
   <>
   <span className="text-sm opacity-90 line-through block">
   {getTotalPrice().toFixed(2)} ريال
   </span>
   <span className="text-3xl font-bold block text-green-300" data-testid="text-summary-total">
   {(getTotalPrice() * (1 - appliedDiscount.percentage / 100)).toFixed(2)} ريال
   </span>
   <span className="text-sm opacity-90">بعد خصم {appliedDiscount.percentage}%</span>
   </>
   ) : (
   <>
   <span className="text-3xl font-bold block" data-testid="text-summary-total">
   {getTotalPrice().toFixed(2)} ريال
   </span>
   <span className="text-sm opacity-90">شامل جميع العناصر</span>
   </>
   )}
   </>
   )}
   </div>
   </div>
   <div className="mt-3 text-center text-sm opacity-90 bg-white/20 rounded-lg p-2">
   {useFreeDrink ? 'استخدمت بطاقتك - استمتع بقهوتك المجانية !' : 'لكل لحظة قهوة ، لحظة نجاح'}
   </div>
   </div>
   {/* Decorative elements */}
   <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
   <div className="absolute bottom-2 left-2 w-3 h-3 bg-white/40 rounded-full animate-ping"></div>
   </div>
   </CardContent>
   </Card>
   </div>

   {/* Modern Payment Section */}
   <div className="lg:col-span-2 order-1 lg:order-2">
   <Card className="bg-white border-slate-200 shadow-lg">
   <CardHeader className="bg-slate-100 rounded-t-lg p-4 md:p-6">
   <CardTitle className="flex items-center font-playfair text-lg md:text-xl font-bold text-slate-700" data-testid="text-checkout-title">
   <CreditCard className="w-4 md:w-5 h-4 md:h-5 ml-2" />
   اختر طريقة الدفع
   </CardTitle>
   </CardHeader>
   <CardContent className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">

   {/* Customer Information - Creative Popup Style */}
   <div className="space-y-6" data-testid="section-customer-info">
   <div className="relative group">
   {/* Glow effect background */}
   <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>

   {/* Main popup container */}
   <div className="relative bg-gradient-to-br from-card/95 via-blue-50/80 to-slate-50/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border-2 border-primary/20 shadow-2xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-3xl">
   {/* Header with floating animation */}
   <div className="flex items-center justify-center mb-4 md:mb-6 lg:mb-8">
   <div className="relative">
   <div className="absolute -inset-2 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-20 blur animate-pulse"></div>
   <div className="relative from-primary to-blue-500 rounded-full p-3 md:p-4 text-white shadow-lg bg-[#23252f]">
   <User className="w-6 md:w-8 h-6 md:h-8" />
   </div>
   </div>
   </div>

   <h4 className="font-playfair text-xl md:text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
   معلومات العميل
   </h4>
   {isRegisteredCustomer ? (
   <p className="text-center text-green-600 mb-4 md:mb-6 lg:mb-8 text-sm bg-green-50 py-2 px-4 rounded-lg">
   مرحباً {customerName} - حسابك مسجل لدينا
   </p>
   ) : (
   <p className="text-center text-slate-600 mb-4 md:mb-6 lg:mb-8 text-sm">
   أدخل بياناتك للمتابعة مع تجربة قهوة رائعة
   </p>
   )}

   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   <div className="space-y-2">
   <Label htmlFor="customer-name" className="text-sm font-semibold text-slate-600">
   اسم العميل (مطلوب) *
   </Label>
   <Input
   id="customer-name"
   type="text"
   placeholder="أدخل اسم العميل"
   value={customerName}
   onChange={(e) => setCustomerName(e.target.value)}
   className="text-right"
   data-testid="input-customer-name"
   disabled={isRegisteredCustomer}
   required
   />
   </div>

   <div className="space-y-2">
   <Label htmlFor="customer-phone" className="text-sm font-semibold text-slate-600">
   رقم الجوال (9 أرقام تبدأ بـ 5 - {isRegisteredCustomer ? "محفوظ" : "مطلوب"}) *
   </Label>
   <Input
   id="customer-phone"
   type="tel"
   placeholder="5xxxxxxxx"
   value={customerPhone}
   onChange={(e) => setCustomerPhone(e.target.value)}
   className="text-right"
   data-testid="input-customer-phone"
   disabled={isRegisteredCustomer}
   required={!isRegisteredCustomer}
   />
   </div>

   <div className="space-y-2">
   <Label htmlFor="customer-email" className="text-sm font-semibold text-slate-600">
   البريد الإلكتروني ({isRegisteredCustomer ? "محفوظ" : "مطلوب"}) *
   </Label>
   <Input
   id="customer-email"
   type="email"
   placeholder="your@email.com"
   value={customerEmail}
   onChange={(e) => setCustomerEmail(e.target.value)}
   className="text-right"
   data-testid="input-customer-email"
   disabled={isRegisteredCustomer}
   required={!isRegisteredCustomer}
   />
   </div>

   {!isRegisteredCustomer && (
   <div className="space-y-2">
   <Label htmlFor="want-register" className="text-sm font-semibold text-slate-600">
   هل تريد إنشاء حساب؟
   </Label>
   <div className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg border border-blue-200 bg-blue-50">
   <input
   type="checkbox"
   id="want-register"
   checked={wantToRegister}
   onChange={(e) => setWantToRegister(e.target.checked)}
   className="w-4 h-4 text-blue-600 rounded"
   data-testid="checkbox-want-register"
   />
   <label htmlFor="want-register" className="text-sm text-slate-700 cursor-pointer">
   نعم، أريد التسجيل والحصول على نقاط
   </label>
   </div>
   </div>
   )}

   {!isRegisteredCustomer && wantToRegister && (
   <div className="space-y-2">
   <Label htmlFor="customer-password" className="text-sm font-semibold text-slate-600">
   كلمة السر (6 أحرف على الأقل) *
   </Label>
   <div className="relative">
   <Input
   id="customer-password"
   type={showPassword ? "text" : "password"}
   placeholder="أدخل كلمة سر قوية"
   value={customerPassword}
   onChange={(e) => setCustomerPassword(e.target.value)}
   className="text-right pr-10"
   data-testid="input-customer-password"
   required={wantToRegister}
   />
   <button
   type="button"
   onClick={() => setShowPassword(!showPassword)}
   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
   data-testid="button-toggle-password"
   >
   {showPassword ? (
   <EyeOff className="w-4 h-4" />
   ) : (
   <Eye className="w-4 h-4" />
   )}
   </button>
   </div>
   </div>
   )}
   </div>

   {/* Free Drinks Counter for Registered Users */}
   {(isRegisteredCustomer || loyaltyCard) && (availableFreeDrinks > 0 || (loyaltyCard?.stamps || 0) > 0) && (
   <div className="mt-6 relative group" data-testid="section-free-drink">
   <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-primary/50/30 to-amber-400/30 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

   <div className="relative bg-gradient-to-br from-amber-50/90 via-primary/5/80 to-background/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-primary/50 shadow-xl">
   <div className="text-center space-y-3">
   <div className="flex items-center justify-center gap-2">
   <Coffee className="w-6 h-6 text-accent" />
   <h4 className="font-playfair text-xl font-bold text-accent">
   بطاقة كوبي - مشروباتك
   </h4>
   </div>

   <div className="bg-white/60 rounded-xl p-4 space-y-2">
   <div className="flex justify-between items-center">
   <span className="text-sm text-accent">الأختام الحالية:</span>
   <span className="font-bold text-accent">
   {(loyaltyCard?.stamps || 0) % 6}/6
   </span>
   </div>

   <div className="flex justify-between items-center">
   <span className="text-sm text-blue-700">مشروبات مجانية مكتسبة:</span>
   <span className="font-bold text-blue-600">
   {totalFreeCupsEarned}
   </span>
   </div>

   <div className="flex justify-between items-center">
   <span className="text-sm text-accent">مشروبات تم استخدامها:</span>
   <span className="font-bold text-accent">
   {totalFreeCupsRedeemed}
   </span>
   </div>

   <div className="flex justify-between items-center pt-2 border-t border-primary">
   <span className="text-sm text-green-700 font-bold">مشروبات مجانية متاحة:</span>
   <span className="font-bold text-green-600 text-xl">
   {availableFreeDrinks}
   </span>
   </div>
   </div>

   {selectedPaymentMethod === 'qahwa-card' && availableFreeDrinks > 0 ? (
   <div>
   <p className="text-sm text-green-700 bg-green-100 rounded-lg p-2 mb-3">
   تم تطبيق {Object.values(selectedFreeItems).reduce((sum, val) => sum + val, 0)} مشروب مجاني تلقائياً من أرخص المشروبات!
   </p>

   {/* Automatic Free Drinks Display */}
   <div className="bg-white/80 rounded-xl p-4 space-y-3 border-2 border-green-300">
   <h5 className="font-bold text-green-800 flex items-center gap-2">
   <Gift className="w-5 h-5" />
   المشروبات المجانية المطبقة تلقائياً
   </h5>

   {cartItems.map((item) => {
   const freeQty = selectedFreeItems[item.coffeeItemId] || 0;
   
   if (freeQty === 0) return null;

   return (
   <div key={item.coffeeItemId} className="flex items-center justify-between bg-green-50/50 p-3 rounded-lg border-l-4 border-l-green-500">
   <div className="flex-1">
   <p className="font-semibold text-sm">{item.coffeeItem?.nameAr}</p>
   <p className="text-xs text-muted-foreground">سعر الواحد: {item.coffeeItem?.price} ريال</p>
   </div>
   <div className="text-center">
   <span className="font-bold text-lg text-green-600">{freeQty}</span>
   <p className="text-xs text-green-700">مجاني</p>
   </div>
   </div>
   );
   })}

   <div className="flex justify-between items-center pt-2 border-t border-green-300">
   <span className="text-sm font-semibold">إجمالي المشروبات المجانية:</span>
   <span className="text-lg font-bold text-green-600">
   {Object.values(selectedFreeItems).reduce((sum, val) => sum + val, 0)} / {availableFreeDrinks}
   </span>
   </div>

   {(() => {
   const totalDrinks = cartItems.reduce((sum, item) => sum + item.quantity, 0);
   const freeApplied = Object.values(selectedFreeItems).reduce((sum, val) => sum + val, 0);
   const remainingDrinks = totalDrinks - freeApplied;
   
   if (remainingDrinks > 0) {
   return (
   <div className="bg-background rounded-lg p-3 border border-primary">
   <p className="text-sm text-accent font-semibold">
   تنبيه: يتبقى {remainingDrinks} مشروب يحتاج طريقة دفع إضافية
   </p>
   </div>
   );
   }
   return null;
   })()}
   </div>
   </div>
   ) : (availableFreeDrinks > 0 && selectedPaymentMethod !== 'qahwa-card') ? (
   <p className="text-sm text-accent bg-primary rounded-lg p-2">
   اختر بطاقة كوبي - مشروباتك كطريقة دفع لتطبيق المشروبات المجانية تلقائياً
   </p>
   ) : (
   <p className="text-sm text-accent bg-primary rounded-lg p-2">
   اجمع {6 - ((loyaltyCard?.stamps || 0) % 6)} أختام إضافية للحصول على المشروب المجاني القادم!
   </p>
   )}
   </div>
   </div>
   </div>
   )}

   {/* Use Free Drink Option - Only for local storage users with free drinks */}
   {!isRegisteredCustomer && customerStorage.getProfile()?.freeDrinks! > 0 && (
   <div className="mt-6 relative group" data-testid="section-free-drink-local">
   <div className="absolute -inset-1 bg-gradient-to-r from-green-400/30 via-emerald-500/30 to-green-400/30 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

   <div className="relative bg-gradient-to-br from-green-50/90 via-emerald-50/80 to-green-50/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-300/50 shadow-xl">
   <div className="flex items-center space-x-3 space-x-reverse">
   <Checkbox
   id="use-free-drink"
   checked={useFreeDrink}
   onCheckedChange={(checked) => setUseFreeDrink(!!checked)}
   data-testid="checkbox-use-free-drink"
   className="border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
   />
   <div className="flex items-center gap-3 flex-1">
   <div className="relative">
   <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20 blur animate-pulse"></div>
   <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-2.5 text-white shadow-lg">
   <Gift className="w-6 h-6" />
   </div>
   </div>
   <div>
   <Label htmlFor="use-free-drink" className="font-playfair text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent cursor-pointer">
   استخدام بطاقتي (مشروب مجاني)
   </Label>
   <p className="text-sm text-green-700 font-cairo">
   لديك {customerStorage.getProfile()?.freeDrinks} مشروب مجاني متاح!
   </p>
   </div>
   </div>
   </div>
   </div>
   </div>
   )}

   </div>
   </div>
   </div>

   {/* Payment Methods Component */}
   <div className="space-y-6">
   <PaymentMethods
   paymentMethods={paymentMethods}
   selectedMethod={selectedPaymentMethod}
   onSelectMethod={(method) => {
   setSelectedPaymentMethod(method);
   // Reset secondary payment if switching to anything other than qahwa-card
   if (method !== 'qahwa-card') {
   setSecondaryPaymentMethod(null);
   }
   }}
   customerPhone={customerPhone}
   loyaltyCard={loyaltyCard}
   />

   {/* Secondary Payment Selection - Only if qahwa-card selected and remaining drinks exist */}
   {selectedPaymentMethod === 'qahwa-card' && (() => {
   const totalDrinks = cartItems.reduce((sum, item) => sum + item.quantity, 0);
   const freeApplied = Object.values(selectedFreeItems).reduce((sum, val) => sum + val, 0);
   return totalDrinks > freeApplied;
   })() && (
   <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-4 animate-in fade-in zoom-in duration-500">
   <h4 className="font-bold text-blue-800 flex items-center gap-2">
   <CreditCard className="w-5 h-5" />
   طريقة دفع للمشروبات المتبقية
   </h4>
   <p className="text-sm text-blue-600">لديك مشروبات متبقية لا يغطيها الرصيد المجاني. يرجى اختيار طريقة دفع ثانية:</p>
   
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
   {paymentMethods.filter(m => m.id !== 'qahwa-card').map(method => (
   <Button
   key={`secondary-${method.id}`}
   variant={secondaryPaymentMethod === method.id ? 'default' : 'outline'}
   className={`h-12 justify-start gap-3 rounded-xl border-2 ${secondaryPaymentMethod === method.id ? 'border-primary' : 'border-blue-100 bg-white hover:bg-blue-50'}`}
   onClick={() => setSecondaryPaymentMethod(method.id)}
   >
   {secondaryPaymentMethod === method.id && <CheckCircle className="w-4 h-4 text-white" />}
   <span className="font-bold">{method.nameAr}</span>
   </Button>
   ))}
   </div>
   </div>
   )}

   {/* Electronic Payment Details - Creative Area */}
   {(selectedPaymentMethod === 'alinma' || selectedPaymentMethod === 'ur' || selectedPaymentMethod === 'barq' || selectedPaymentMethod === 'rajhi') && (
   <div className="relative group animate-in slide-in-from-top-4 duration-500">
   <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-primary/20 rounded-2xl blur opacity-25"></div>
   <div className="relative bg-white/95 backdrop-blur-md p-6 rounded-2xl border-2 border-primary/20 shadow-xl space-y-6">
   <div className="flex items-center gap-3">
   <div className="p-3 bg-primary/10 rounded-full">
   <FileText className="w-6 h-6 text-primary" />
   </div>
   <div>
   <h4 className="font-bold text-lg text-accent">تفاصيل التحويل البنكي</h4>
   <p className="text-sm text-slate-500">يرجى إتمام التحويل وإرفاق صورة الإيصال</p>
   </div>
   </div>

   <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
   <div className="flex items-center justify-between">
   <Label className="text-sm text-slate-500 font-bold flex items-center gap-2">
   <input
   type="checkbox"
   checked={isSameAsCustomer}
   onChange={(e) => setIsSameAsCustomer(e.target.checked)}
   className="w-4 h-4 text-primary rounded"
   />
   صاحب التحويل هو نفس العميل؟
   </Label>
   </div>

   {!isSameAsCustomer && (
   <div className="space-y-2 animate-in fade-in duration-300">
   <Label className="text-xs text-slate-600 font-bold">اسم صاحب التحويل</Label>
   <Input
   placeholder="أدخل الاسم كما يظهر في الحساب البنكي"
   value={transferOwnerName}
   onChange={(e) => setTransferOwnerName(e.target.value)}
   className="bg-white"
   data-testid="input-transfer-owner"
   />
   </div>
   )}
   </div>

   <div className="space-y-3">
   <Label className="text-base font-bold text-accent flex items-center gap-2">
   صورة الإيصال (مطلوب)
   <small className="font-normal text-slate-400">(JPG, PNG)</small>
   </Label>
   <FileUpload
   onFileUpload={(url: string) => setPaymentReceiptUrl(url)}
   />
   </div>
   </div>
   </div>
   )}

   {/* Secondary Receipt Upload */}
   {secondaryPaymentMethod && ['alinma', 'ur', 'barq', 'rajhi'].includes(secondaryPaymentMethod) && (
   <div className="p-6 bg-blue-50/50 border-2 border-blue-200 rounded-2xl space-y-4">
   <Label className="font-bold text-blue-800">إيصال الدفع للطريقة الثانية</Label>
   <FileUpload onFileUpload={(url: string) => setSecondaryPaymentReceiptUrl(url)} />
   </div>
   )}

   <div className="space-y-4">
   <Label className="text-lg font-bold text-accent flex items-center gap-2">
   <FileText className="w-5 h-5" />
   ملاحظات خاصة (اختياري)
   </Label>
   <textarea
   className="w-full min-h-32 p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-right resize-none"
   placeholder="هل لديك طلب خاص؟ (مثال: سكر زيادة، حليب لوز...)"
   value={customerNotes}
   onChange={(e) => setCustomerNotes(e.target.value)}
   data-testid="textarea-notes"
   />
   </div>

   <div className="pt-6">
   <Button
   onClick={handleProceedPayment}
   className="w-full h-16 bg-primary hover:bg-primary/95 text-white text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transform transition-all active:scale-95 group overflow-hidden"
   disabled={createOrderMutation.isPending}
   data-testid="button-complete-purchase"
   >
   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
   {createOrderMutation.isPending ? (
   <span className="flex items-center gap-2">
   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
   جاري المعالجة...
   </span>
   ) : (
   <span className="flex items-center gap-3">
   تأكيد الطلب والدفع
   <ShoppingBag className="w-6 h-6 animate-pulse" />
   </span>
   )}
   </Button>
   <p className="text-center text-xs text-slate-400 mt-4">بإتمام الطلب، أنت توافق على شروط وأحكام CLUNY CAFE</p>
   </div>
   </div>
   </CardContent>
   </Card>
   </div>
   </div>
   </div>
   </div>

   {/* Modern Confirmation Modal */}
   {showConfirmation && (
   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
   <div className="absolute inset-0 bg-accent/60 backdrop-blur-sm" onClick={() => setShowConfirmation(false)}></div>
   <Card className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-3xl border-2 border-primary/20 animate-in zoom-in-95 duration-300">
   <div className="p-8 space-y-6">
   <div className="text-center space-y-2">
   <div className="w-20 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
   <CheckCircle className="w-12 h-12 text-primary" />
   </div>
   <h3 className="text-2xl font-playfair font-bold text-accent dark:text-accent">تأكيد الطلب النهائي</h3>
   <p className="text-slate-500">هل أنت متأكد من تفاصيل طلبك؟</p>
   </div>

   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-4">
   <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
   <span className="text-slate-500">المجموع النهائي:</span>
   <span className="text-2xl font-black text-primary">{calculateFinalPrice().toFixed(2)} ريال</span>
   </div>
   <div className="flex justify-between items-center">
   <span className="text-slate-500">طريقة الدفع:</span>
   <span className="font-bold text-accent">{getPaymentMethodName(selectedPaymentMethod!)}</span>
   </div>
   <div className="flex justify-between items-center">
   <span className="text-slate-500">اسم العميل:</span>
   <span className="font-bold">{customerName}</span>
   </div>
   </div>

   <div className="grid grid-cols-2 gap-4">
   <Button
   variant="outline"
   onClick={() => setShowConfirmation(false)}
   className="h-14 rounded-2xl font-bold border-2 border-slate-200 hover:bg-slate-50"
   >
   إلغاء
   </Button>
   <Button
   onClick={confirmAndCreateOrder}
   disabled={createOrderMutation.isPending}
   className="h-14 rounded-2xl bg-primary hover:bg-primary font-black text-lg shadow-lg shadow-primary/20"
   >
   {createOrderMutation.isPending ? "جاري الحفظ..." : "تأكيد وإرسال"}
   </Button>
   </div>
   </div>
   </Card>
   </div>
   )}
  </div>
 );
}
