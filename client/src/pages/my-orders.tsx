import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import OrderTracker from "@/components/order-tracker";
import { ReceiptInvoice } from "@/components/receipt-invoice";
import { CarPickupForm } from "@/components/car-pickup-form";
import type { Order as OrderType } from "@shared/schema";
import { useCustomer } from "@/contexts/CustomerContext";

interface OrderDisplay extends OrderType {
 items: any[];
}

export default function MyOrders() {
 const [, setLocation] = useLocation();
 const { customer } = useCustomer();
 const customerId = customer?._id || customer?.id;

 // Set SEO metadata
 useEffect(() => {
   document.title = "طلباتي - BLACK ROSE | متابعة الطلبات والحالة";
   const metaDesc = document.querySelector('meta[name="description"]');
   if (metaDesc) metaDesc.setAttribute('content', 'متابع طلباتك السابقة والحالية في BLACK ROSE - تتبع آني للحالة والتوصيل');
 }, []);

 const { data: orders = [], isLoading, refetch } = useQuery<OrderDisplay[]>({
 queryKey: ["/api/customers", customerId, "orders"],
 enabled: !!customerId,
 refetchInterval: 5000, // Refresh every 5 seconds to show status updates
 });

 return (
 <div className="min-h-screen bg-gradient-to-br from-amber-50 via-primary/5 to-amber-100 overflow-hidden relative" data-testid="page-my-orders">
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute top-20 left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
 <div className="absolute bottom-32 right-16 w-32 h-32 bg-accent/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
 <div className="absolute top-1/2 left-10 w-28 h-28 bg-primary/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
 </div>

 <div className="max-w-4xl mx-auto p-4 relative z-10">
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center justify-between mb-6"
 >
 <Button
 variant="ghost"
 onClick={() => setLocation("/menu")}
 className="text-accent hover:text-accent hover:bg-primary/50 backdrop-blur-sm"
 data-testid="button-back"
 >
 <ArrowRight className="ml-2 h-5 w-5" />
 العودةللقائمة 
 </Button>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5 }}
 className="text-center mb-8"
 >
 <h1 className="text-4xl font-amiri font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
 طلباتي
 </h1>
 <p className="text-accent font-cairo">
 تتبع طلباتك السابقةوالحالية 
 </p>
 </motion.div>

 {!customerId ? (
 <Card className="p-8 bg-white/90 backdrop-blur-lg shadow-2xl border-2 border-primary/50 text-center">
 <Coffee className="h-16 w-16 text-accent mx-auto mb-4" />
 <h2 className="text-2xl font-amiri font-bold text-accent mb-3">
 لا توجد طلبات بعد
 </h2>
 <p className="text-accent font-cairo mb-6">
 قم بتسجيل الدخول أو إنشاء طلب جديد لعرض طلباتك
 </p>
 <Button
 onClick={() => setLocation("/menu")}
 className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo"
 >
 تصفح القائمة
 </Button>
 </Card>
 ) : isLoading ? (
 <div className="flex items-center justify-center py-20">
 <div className="flex space-x-2 space-x-reverse">
 <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
 <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
 <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
 </div>
 </div>
 ) : orders.length === 0 ? (
 <Card className="p-8 bg-white/90 backdrop-blur-lg shadow-2xl border-2 border-primary/50 text-center">
 <Coffee className="h-16 w-16 text-accent mx-auto mb-4" />
 <h2 className="text-2xl font-amiri font-bold text-accent mb-3">
 لا توجد طلبات بعد
 </h2>
 <p className="text-accent font-cairo mb-6">
 ابدأ طلبك الأول واستمتع بأفضل القهوة !
 </p>
 <Button
 onClick={() => setLocation("/menu")}
 className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-cairo"
 >
 تصفح القائمة
 </Button>
 </Card>
 ) : (
 <div className="space-y-6">
 {orders.map((order: OrderDisplay, index: number) => (
 <motion.div
 key={order.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 >
 <div className="space-y-4">
 {/* Order Details Card */}
 <Card className="p-6 bg-white/90 backdrop-blur-lg shadow-lg border-2 border-primary/50">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <Coffee className="h-5 w-5 text-accent" />
 <h3 className="text-lg font-cairo font-bold text-accent">
 طلب #{order.orderNumber}
 </h3>
 </div>
 <p className="text-sm text-accent font-cairo">
 {new Date(order.createdAt).toLocaleDateString('ar-SA', {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 </div>
 <div className="text-left">
 <span className="text-2xl font-bold text-accent font-cairo">
 {Number(order.totalAmount).toFixed(2)} ريال
 </span>
 </div>
 </div>

 <div className="space-y-2">
 {(order.items || []).map((item: any, i: number) => (
 <div key={i} className="flex justify-between text-sm bg-background p-2 rounded-lg">
 <span className="text-accent font-cairo">
 {item.nameAr || item.name} × {item.quantity}
 </span>
 <span className="text-accent font-bold">
 {(parseFloat(item.price) * item.quantity).toFixed(2)} ريال
 </span>
 </div>
 ))}
 </div>
 </Card>

 {/* Order Tracker */}
 <OrderTracker order={order} />

 {/* Car Pickup Form - Show when order is ready */}
 {order.status === 'ready' && (
 <CarPickupForm order={order} customer={customer} />
 )}

 {/* PDF Invoice Button */}
 {(order.status === 'ready' || order.status === 'completed') && (
 <ReceiptInvoice order={order} />
 )}

 {order.customerNotes && (
 <div className="bg-primary/20 rounded-lg p-3 mb-4 border border-primary/20">
 <p className="text-accent text-sm font-semibold mb-1">ملاحظات العميل:</p>
 <p className="text-white text-sm" data-testid={`text-customer-notes-${order.id}`}>
 {order.customerNotes}
 </p>
 </div>
 )}

 {order.status === 'cancelled' && (order as any).cancellationReason && (
 <div className="bg-red-900/20 rounded-lg p-3 mb-4 border border-red-500/20">
 <p className="text-red-400 text-sm font-semibold mb-1">سبب الإلغاء:</p>
 <p className="text-white text-sm">
 {(order as any).cancellationReason}
 </p>
 </div>
 )}
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}