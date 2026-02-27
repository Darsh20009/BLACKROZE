import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderWebSocket } from "@/lib/websocket";
import { 
  Coffee, ShoppingBag, Trash2, Plus, Minus, Search, 
  CreditCard, ChevronLeft, ChevronRight, XCircle, 
  Volume2, VolumeX, ClipboardList, Grid3X3, Tag, 
  Columns2, ArrowRight, Printer, CheckCircle, 
  Clock, Check, X, AlertTriangle, MessageSquare, 
  Archive, RefreshCw, Wifi, WifiOff, Loader2,
  Navigation, SplitSquareVertical, Banknote, Gift,
  Lock, Bell, BellOff, MonitorSmartphone, ScanLine,
  PauseCircle, Receipt, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CoffeeItem, Order, Table, Employee } from "@shared/schema";
import { 
  printSimpleReceipt, 
  printTaxInvoice, 
  printKitchenOrder 
} from "@/lib/print-utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import DrinkCustomizationDialog, { type DrinkCustomization } from "@/components/drink-customization-dialog";

type OrderType = "dine_in" | "takeaway" | "delivery" | "car_pickup";
type PaymentMethod = "cash" | "card" | "qahwa-card";

const ORDER_TYPES = [
  { id: "dine_in", name: "محلي", nameEn: "Dine-in", icon: Coffee },
  { id: "takeaway", name: "سفري", nameEn: "Takeaway", icon: ShoppingBag },
  { id: "car_pickup", name: "سيارة", nameEn: "Car Pickup", icon: Navigation },
  { id: "delivery", name: "توصيل", nameEn: "Delivery", icon: ShoppingBag },
];

const PAYMENT_METHODS = [
  { id: "cash", name: "كاش", nameEn: "Cash", icon: Banknote },
  { id: "card", name: "Geidea", nameEn: "Geidea Card", icon: CreditCard },
  { id: "qahwa-card", name: "نقاط", nameEn: "Loyalty", icon: Gift },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "كاش / Cash",
  card: "Geidea / شبكة",
  "qahwa-card": "بطاقة نقاط / Loyalty",
};

const formatPosOrderNumber = (order: any): string => {
  if (order?.dailyNumber) return `ORD#${String(order.dailyNumber).padStart(4, '0')}`;
  const num = order?.orderNumber || '';
  if (num.includes('-')) return `ORD#${num.split('-').pop()}`;
  return `ORD#${num.slice(-4) || '0000'}`;
};

export default function PosSystem() {
  const [, setLocation] = useLocation();
  const employee = (() => {
    try {
      const data = localStorage.getItem("currentEmployee");
      return data ? JSON.parse(data) as Employee : null;
    } catch { return null; }
  })();
  const { toast } = useToast();
  const { requestPermission: requestPushPermission } = useNotifications({
    userType: 'employee',
    userId: employee?.id?.toString(),
    branchId: employee?.branchId?.toString(),
    autoSubscribe: true,
  });
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [splitViewMode, setSplitViewMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [posTerminalConnected, setPosTerminalConnected] = useState(() => {
    return localStorage.getItem("pos-terminal-connected") === "true";
  });
  const [showTablesDialog, setShowTablesDialog] = useState(false);
  const [showOpenBillsDialog, setShowOpenBillsDialog] = useState(false);
  const [selectedTableForBill, setSelectedTableForBill] = useState<any>(null);
  const [billPaymentMethod, setBillPaymentMethod] = useState<PaymentMethod>("cash");
  const [showPOSSettings, setShowPOSSettings] = useState(false);
  const [posCustomizingItem, setPosCustomizingItem] = useState<CoffeeItem | null>(null);
  const [autoPrint, setAutoPrint] = useState(() => localStorage.getItem("pos-auto-print") !== "false");
  const [showVatLabel, setShowVatLabel] = useState(() => localStorage.getItem("pos-show-vat-label") === "true");

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  const handleNewOrder = useCallback((order: any) => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders/live"] });
    setNewOrdersCount(prev => prev + 1);
    if (soundEnabledRef.current) {
      import("@/lib/notification-sounds").then(({ playNotificationSound }) => {
        const isOnline = order?.orderType === 'delivery' || order?.orderType === 'takeaway' || !order?.employeeId;
        if (isOnline) {
          playNotificationSound('onlineOrderVoice', 1.0);
        } else {
          playNotificationSound('newOrder', 1.0);
        }
      });
    }
    toast({
      title: "New Order! / طلب جديد! 🔔",
      description: `${formatPosOrderNumber(order)} - ${order?.totalAmount || 0} SAR / ر.س`,
    });
  }, [queryClient, toast]);

  const handleOrderUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders/live"] });
  }, [queryClient]);

  const { isConnected: wsConnected, sendMessage: wsSend } = useOrderWebSocket({
    clientType: "pos",
    branchId: employee?.branchId?.toString(),
    onNewOrder: handleNewOrder,
    onOrderUpdated: handleOrderUpdated,
    enabled: true,
  });

  const syncCustomerDisplay = useCallback((payload: any) => {
    if (typeof wsSend === "function") {
      wsSend({
        type: "customer_display_update",
        payload,
      });
    }
  }, [wsSend]);

  useEffect(() => {
    localStorage.setItem("pos-terminal-connected", String(posTerminalConnected));
  }, [posTerminalConnected]);

  useEffect(() => { localStorage.setItem("pos-auto-print", String(autoPrint)); }, [autoPrint]);
  useEffect(() => { localStorage.setItem("pos-show-vat-label", String(showVatLabel)); }, [showVatLabel]);

  useEffect(() => {
    if (employee && Notification.permission === 'default') {
      requestPushPermission();
    }
  }, [employee, requestPushPermission]);

  // Sync cart state to customer display via WebSocket
  useEffect(() => {
    if (orderItems.length === 0) {
      syncCustomerDisplay({ mode: "idle" });
    } else {
      const total = orderItems.reduce((s, i) => s + Number(i.coffeeItem.price) * i.quantity, 0);
      const subtotal = total / 1.15;
      const tax = total - subtotal;
      syncCustomerDisplay({
        mode: "order_review",
        items: orderItems.map(i => ({
          nameAr: i.coffeeItem.nameAr,
          nameEn: i.coffeeItem.nameEn,
          price: Number(i.coffeeItem.price),
          quantity: i.quantity,
          lastAdded: i.lastAdded,
        })),
        subtotal,
        tax,
        total,
      });
    }
  }, [orderItems, syncCustomerDisplay]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const { data: liveOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders/live"],
    refetchInterval: 5000,
  });

  const { data: tables = [], refetch: refetchTables } = useQuery<any[]>({
    queryKey: ["/api/tables/status", employee?.branchId],
    queryFn: async () => {
      const res = await fetch(`/api/tables/status?branchId=${employee?.branchId}`);
      return res.json();
    },
    enabled: !!employee?.branchId,
    refetchInterval: 10000,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/live"] });
      toast({ title: "تم التحديث", description: "تم تحديث حالة الطلب بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث حالة الطلب" });
    }
  });

  const emptyTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      return await apiRequest("PATCH", `/api/tables/${tableId}/occupancy`, { isOccupied: 0 });
    },
    onSuccess: () => {
      refetchTables();
      toast({ title: "تم", description: "تم إفراغ الطاولة بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إفراغ الطاولة" });
    }
  });

  const closeBillMutation = useMutation({
    mutationFn: async ({ orderId, payMethod }: { orderId: string; payMethod: string }) => {
      return await apiRequest("PUT", `/api/orders/${orderId}/status`, { status: "completed", paymentMethod: payMethod });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/live"] });
      refetchTables();
      const order = selectedTableForBill;
      if (order) {
        const items = (Array.isArray(order.items) ? order.items : []).map((item: any) => ({
          coffeeItem: {
            nameAr: item.name || item.nameAr || item.coffeeItem?.nameAr || '',
            nameEn: item.nameEn || item.coffeeItem?.nameEn || '',
            price: String(item.price || item.unitPrice || 0),
          },
          quantity: item.quantity || 1,
        }));
        const total = Number(order.totalAmount || 0);
        printTaxInvoice({
          orderNumber: order.dailyNumber || order.orderNumber || '',
          customerName: order.customerName || order.customerInfo?.customerName || 'عميل نقدي',
          customerPhone: order.customerPhone || order.customerInfo?.customerPhone || '',
          items,
          subtotal: (total / 1.15).toFixed(2),
          total: total.toFixed(2),
          paymentMethod: PAYMENT_METHOD_LABELS[variables.payMethod] || variables.payMethod,
          employeeName: employee?.fullName || 'موظف',
          tableNumber: order.tableNumber,
          orderType: order.orderType,
          date: order.createdAt || new Date().toISOString(),
        });
      }
      setSelectedTableForBill(null);
      toast({ title: "تم", description: "تم إغلاق الفاتورة وطباعة الإيصال" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إغلاق الفاتورة" });
    }
  });

  const openTableOrders = useMemo(() => {
    if (!liveOrders) return [];
    return liveOrders.filter((o: any) => 
      ['pending', 'in_progress', 'ready'].includes(o.status) && 
      o.tableNumber && 
      (o.orderType === 'dine_in' || o.orderType === 'dine-in')
    );
  }, [liveOrders]);

  const filteredItemsList = useMemo(() => {
    if (!productsData) return [];
    return productsData.filter(item => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch = item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [productsData, selectedCategory, searchQuery]);

  const visibleCategories = useMemo(() => {
    const cats = Array.from(new Set(productsData?.map(p => p.category) || []));
    return cats.map(c => ({ id: c, name: c, icon: Tag, color: "text-primary" }));
  }, [productsData]);

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (Number(item.coffeeItem.price) * item.quantity), 0);
  };

  const calculateSubtotal = () => {
    return calculateTotal() / 1.15;
  };

  const addToOrder = (product: CoffeeItem, customization?: DrinkCustomization, qty: number = 1) => {
    const ts = Date.now();
    const lineItemId = Math.random().toString(36).substr(2, 9);
    const unitPrice = customization
      ? (customization.selectedSize
          ? Number(product.availableSizes?.find(s => s.nameAr === customization.selectedSize)?.price || product.price)
          : Number(product.price)) + (customization.totalAddonsPrice || 0)
      : Number(product.price);

    setOrderItems(prev => [
      ...prev.map(i => ({ ...i, lastAdded: undefined })),
      {
        lineItemId,
        coffeeItem: { ...product, price: unitPrice },
        quantity: qty,
        customization: customization || {},
        lastAdded: ts,
      }
    ]);
  };

  const handleConfirmPOSCustomization = (customization: DrinkCustomization, quantity: number) => {
    if (!posCustomizingItem) return;
    addToOrder(posCustomizingItem, customization, quantity);
    setPosCustomizingItem(null);
  };

  const updateQuantity = (lineItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setOrderItems(prev => prev.filter(item => item.lineItemId !== lineItemId));
    } else {
      setOrderItems(prev => prev.map(item => 
        item.lineItemId === lineItemId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const handleCheckout = async () => {
    if (orderItems.length === 0) return;
    
    try {
      setSyncing(true);
      const total = calculateTotal();
      const subtotal = calculateSubtotal();
      const tax = total - subtotal;

      // Notify customer display: payment in progress
      syncCustomerDisplay({ mode: "payment_processing" });

      const orderData = {
        items: orderItems.map(item => ({
          coffeeItemId: item.coffeeItem.id,
          name: item.coffeeItem.nameAr,
          price: item.coffeeItem.price,
          quantity: item.quantity,
          customization: item.customization || {}
        })),
        subtotal,
        tax,
        total,
        orderType,
        paymentMethod,
        tableNumber: orderType === "dine_in" ? tableNumber : undefined,
        customerName,
        customerPhone,
        status: "pending",
        branchId: employee?.branchId || "main",
        tenantId: employee?.tenantId || "demo-tenant",
        employeeId: employee?.id
      };

      const res = await apiRequest("POST", "/api/orders", orderData);
      const result = await res.json();

      setLastOrder({
        orderNumber: result.orderNumber || result.dailyNumber || '',
        date: new Date().toISOString(),
        items: orderItems.map(item => ({
          coffeeItem: {
            nameAr: item.coffeeItem.nameAr,
            nameEn: item.coffeeItem.nameEn,
            price: String(item.coffeeItem.price),
          },
          quantity: item.quantity,
        })),
        subtotal,
        tax,
        total,
        paymentMethod,
        customerName,
        customerPhone,
        employeeName: employee?.fullName || 'موظف',
        tableNumber: orderType === "dine_in" ? tableNumber : undefined,
        orderType,
      });
      // Notify customer display: payment success
      syncCustomerDisplay({
        mode: "payment_success",
        orderNumber: result.orderNumber || result.dailyNumber || '',
        total,
      });
      // Return to idle after 5 seconds
      setTimeout(() => syncCustomerDisplay({ mode: "idle" }), 5000);

      if (autoPrint) {
        printTaxInvoice({
          orderNumber: result.orderNumber || result.dailyNumber || '',
          customerName: customerName || 'عميل نقدي',
          customerPhone: customerPhone || '',
          items: orderItems.map(item => ({
            coffeeItem: {
              nameAr: item.coffeeItem.nameAr,
              nameEn: item.coffeeItem.nameEn,
              price: String(item.coffeeItem.price),
            },
            quantity: item.quantity,
          })),
          subtotal: subtotal.toFixed(2),
          total: total.toFixed(2),
          paymentMethod: PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod,
          employeeName: employee?.fullName || 'موظف',
          tableNumber: orderType === "dine_in" ? tableNumber : undefined,
          orderType: orderType as any,
          date: new Date().toISOString(),
        });
        toast({ title: "تم", description: "تم إتمام الطلب وطباعة الإيصال تلقائياً" });
      }
      setShowReceiptDialog(true);

      setOrderItems([]);
      setTableNumber("");
      setCustomerName("");
      setCustomerPhone("");
      
      queryClient.invalidateQueries({ queryKey: ["/api/orders/live"] });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ 
        variant: "destructive",
        title: "خطأ", 
        description: "فشل في إتمام الطلب. يرجى المحاولة مرة أخرى." 
      });
    } finally {
      setSyncing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!lastOrder) return;
    printTaxInvoice({
      orderNumber: lastOrder.orderNumber,
      customerName: lastOrder.customerName || 'عميل نقدي',
      customerPhone: lastOrder.customerPhone || '',
      items: lastOrder.items,
      subtotal: lastOrder.subtotal.toFixed(2),
      total: lastOrder.total.toFixed(2),
      paymentMethod: PAYMENT_METHOD_LABELS[lastOrder.paymentMethod] || lastOrder.paymentMethod,
      employeeName: lastOrder.employeeName,
      tableNumber: lastOrder.tableNumber,
      orderType: lastOrder.orderType,
      date: lastOrder.date,
    });
  };

  const handlePrintLiveOrder = (order: any) => {
    const items = (Array.isArray(order.items) ? order.items : []).map((item: any) => ({
      coffeeItem: {
        nameAr: item.name || item.nameAr || item.coffeeItem?.nameAr || '',
        nameEn: item.nameEn || item.coffeeItem?.nameEn || '',
        price: String(item.price || item.unitPrice || 0),
      },
      quantity: item.quantity || 1,
    }));
    printSimpleReceipt({
      orderNumber: order.dailyNumber || order.orderNumber || '',
      customerName: order.customerName || order.customerInfo?.customerName || 'عميل',
      customerPhone: order.customerPhone || order.customerInfo?.customerPhone || '',
      items,
      subtotal: String(Number(order.totalAmount || 0) / 1.15),
      total: String(order.totalAmount || 0),
      paymentMethod: PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || 'كاش',
      employeeName: employee?.fullName || 'موظف',
      date: order.createdAt || new Date().toISOString(),
    });
  };

  if (!employee) return <LoadingState />;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground" dir="rtl">
      <header className="flex flex-col sm:flex-row items-center justify-between px-3 py-2 sm:px-6 sm:py-3 border-b bg-card gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-primary">BLACK ROSE</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:hidden">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowOrdersPanel(true)}
              className="relative"
              data-testid="button-mobile-orders"
            >
              <ClipboardList className="w-4 h-4" />
              {newOrdersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[18px] h-[18px] bg-red-500 animate-pulse">
                  {newOrdersCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowPOSSettings(true)}
              data-testid="button-mobile-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            {splitViewMode && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSplitViewMode(false)}
                data-testid="button-mobile-back"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)} className="w-[440px]">
            <TabsList className="grid grid-cols-4 w-full h-10 p-1">
              {ORDER_TYPES.map((type) => (
                <TabsTrigger key={type.id} value={type.id} className="text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-col gap-0 h-full px-1" data-testid={`tab-order-type-${type.id}`}>
                  <type.icon className="w-3.5 h-3.5" />
                  <span>{type.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <Button
            variant={posTerminalConnected ? "default" : "outline"}
            size="sm"
            onClick={() => setPosTerminalConnected(!posTerminalConnected)}
            className="hidden sm:flex gap-1"
            data-testid="button-pos-terminal-toggle"
          >
            <MonitorSmartphone className="w-4 h-4" />
            <span className="text-xs">{posTerminalConnected ? "الشبكة متصلة" : "الشبكة غير متصلة"}</span>
            <div className={`w-2 h-2 rounded-full ${posTerminalConnected ? 'bg-green-400' : 'bg-orange-400'}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPOSSettings(true)}
            className="hidden sm:flex"
            data-testid="button-pos-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hidden sm:flex"
            data-testid="button-sound-toggle"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} title={wsConnected ? 'متصل' : 'غير متصل'} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOrdersPanel(true)}
            className="relative hidden sm:flex"
            data-testid="button-desktop-orders"
          >
            <ClipboardList className="w-4 h-4 ml-2" />
            الطلبات
            {newOrdersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[18px] h-[18px] bg-red-500 animate-pulse">
                {newOrdersCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTablesDialog(true)}
            className="hidden sm:flex"
            data-testid="button-tables-grid"
          >
            <Grid3X3 className="w-4 h-4 ml-2" />
            الطاولات
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOpenBillsDialog(true)}
            className="relative hidden sm:flex"
            data-testid="button-open-bills"
          >
            <Receipt className="w-4 h-4 ml-2" />
            فواتير مفتوحة
            {openTableOrders.length > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[18px] h-[18px] bg-orange-500">
                {openTableOrders.length}
              </Badge>
            )}
          </Button>

          <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-full border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-medium">{employee?.fullName || 'موظف'}</span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => setLocation("/employee/dashboard")} className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-back-dashboard" title="العودة للوحة التحكم">
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className={`${splitViewMode ? 'hidden lg:flex' : 'flex'} w-16 sm:w-24 border-l bg-muted/30 flex-col py-4 gap-4 overflow-y-auto shrink-0`}>
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            className="flex-col gap-1 h-16 sm:h-20 w-full rounded-none"
            onClick={() => setSelectedCategory("all")}
            data-testid="button-category-all"
          >
            <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[10px] sm:text-xs font-bold">الكل</span>
          </Button>
          {visibleCategories.map((cat: any) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "ghost"}
              className="flex-col gap-1 h-16 sm:h-20 w-full rounded-none"
              onClick={() => setSelectedCategory(cat.id)}
              data-testid={`button-category-${cat.id}`}
            >
              <cat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-bold truncate max-w-full px-1">{cat.name}</span>
            </Button>
          ))}
        </aside>

        <section className={`${splitViewMode ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden`}>
          <div className="p-2 sm:p-4 border-b bg-card/50 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-9 sm:h-12 text-sm sm:text-base rounded-xl border-2 focus-visible:ring-primary"
                data-testid="input-search-products"
              />
            </div>
            <div className="flex gap-2 sm:hidden overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
              {ORDER_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={orderType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOrderType(type.id as OrderType)}
                  className="whitespace-nowrap shrink-0 h-9"
                  data-testid={`button-mobile-order-type-${type.id}`}
                >
                  <type.icon className="w-4 h-4 ml-1" />
                  {type.name}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-2 sm:p-4 lg:p-6">
            {isLoadingProducts ? (
              <LoadingState message="جاري تحميل المنتجات..." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {filteredItemsList.map((item: any) => (
                  <Card 
                    key={item.id}
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                      item.isAvailable === false ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-primary/50'
                    }`}
                    onClick={() => item.isAvailable !== false && setPosCustomizingItem(item)}
                    data-testid={`card-product-${item.id}`}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.nameAr}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Coffee className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.isAvailable === false && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <Badge variant="destructive" className="text-[10px] sm:text-sm font-bold px-2 py-0.5 sm:px-3 sm:py-1">نفذت الكمية</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2 sm:p-3">
                      <h3 className="font-bold text-xs sm:text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.nameAr}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-primary font-black text-xs sm:text-base">{Number(item.price).toFixed(2)} ر.س{showVatLabel && <span className="text-muted-foreground font-medium text-[9px] sm:text-[10px] mr-1">(شامل الضريبة)</span>}</p>
                        <div className="bg-primary/10 text-primary rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </section>

        <aside className={`${splitViewMode ? 'flex' : 'hidden md:flex'} w-full md:w-80 lg:w-[420px] border-r flex flex-col bg-card shrink-0 overflow-y-auto`}>
          <div className="p-2 sm:p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-base leading-tight">Order / الطلب</h2>
                <p className="text-[9px] text-muted-foreground">{orderItems.length} item(s)</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setSplitViewMode(!splitViewMode)} className="hidden md:flex" data-testid="button-split-view">
                <Columns2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setOrderItems([])} className="text-destructive" data-testid="button-clear-order">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-2 sm:px-4 py-2">
            {orderItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 py-20">
                <ShoppingBag className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold">السلة فارغة</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {orderItems.map((item) => (
                  <div key={item.lineItemId} className="flex items-center gap-2 p-2 sm:p-3 rounded-xl border-2 hover:border-primary/30 bg-muted/20 transition-all" data-testid={`order-item-${item.lineItemId}`}>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm leading-tight line-clamp-1">{item.coffeeItem.nameAr}</h4>
                      {item.coffeeItem.nameEn && <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">{item.coffeeItem.nameEn}</p>}
                      <p className="text-primary font-black text-[10px] sm:text-xs mt-0.5">{(Number(item.coffeeItem.price) * item.quantity).toFixed(2)} SAR</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center bg-background rounded-full border shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.lineItemId, item.quantity - 1)}
                          data-testid={`button-decrease-${item.lineItemId}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.lineItemId, item.quantity + 1)}
                          data-testid={`button-increase-${item.lineItemId}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => updateQuantity(item.lineItemId, 0)}
                        data-testid={`button-delete-${item.lineItemId}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="px-2 sm:px-4 py-2 border-t space-y-2">
            <Input
              placeholder="Customer Name / اسم العميل"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9 text-sm"
              data-testid="input-pos-customer-name"
            />
            <Input
              placeholder="Phone / رقم الجوال"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="h-9 text-sm"
              dir="ltr"
              data-testid="input-pos-customer-phone"
            />
            {orderType === "dine_in" && (
              <Input
                placeholder="Table No. / رقم الطاولة"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="h-9 text-sm"
                data-testid="input-pos-table-number"
              />
            )}
          </div>

          <div className="px-2 sm:px-4 py-2 border-t">
            <p className="text-xs sm:text-sm font-bold text-muted-foreground mb-2">Payment Method / طريقة الدفع</p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {PAYMENT_METHODS.map((method) => (
                <Button
                  key={method.id}
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`flex flex-col gap-0.5 h-auto py-2 text-[10px] sm:text-xs ${
                    paymentMethod === method.id ? '' : ''
                  }`}
                  data-testid={`button-payment-${method.id}`}
                >
                  <method.icon className="w-4 h-4" />
                  <span className="font-bold">{method.name}</span>
                </Button>
              ))}
            </div>
            {paymentMethod === "card" && (
              <div className="mt-2 space-y-1 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CreditCard className="w-3 h-3 text-blue-600" />
                  <p className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-400">
                    Geidea Terminal / جهاز جيديا
                  </p>
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground text-center">
                  Amount will appear on Geidea terminal / سيتم عرض المبلغ على جهاز جيديا
                </p>
                {posTerminalConnected ? (
                  <div className="flex items-center justify-center gap-1.5 text-green-600 text-[10px] sm:text-xs" data-testid="status-terminal-connected">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium">Geidea Connected / متصل</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-orange-500 text-[10px] sm:text-xs" data-testid="status-terminal-disconnected">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-medium">Geidea Not Connected / غير متصل</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-2 sm:p-4 border-t bg-muted/10 gap-2 sm:gap-3 flex flex-col">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] sm:text-sm">
                <span className="text-muted-foreground">Subtotal / المجموع</span>
                <span className="font-bold">{calculateSubtotal().toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-[10px] sm:text-sm">
                <span className="text-muted-foreground">VAT 15% / ضريبة</span>
                <span className="font-bold">{(calculateTotal() - calculateSubtotal()).toFixed(2)} SAR</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="font-black text-sm sm:text-lg">Total / الإجمالي</span>
                <span className="font-black text-lg sm:text-2xl text-primary">{calculateTotal().toFixed(2)} SAR</span>
              </div>
            </div>

            <Button 
              className="w-full h-11 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-black rounded-xl shadow-lg shadow-primary/20 gap-2"
              disabled={orderItems.length === 0 || syncing}
              onClick={handleCheckout}
              data-testid="button-checkout"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                <>
                  {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.icon && (() => {
                    const IconComp = PAYMENT_METHODS.find(m => m.id === paymentMethod)!.icon;
                    return <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />;
                  })()}
                </>
              )}
              {syncing ? 'Processing...' : `Charge ${calculateTotal().toFixed(2)} SAR`}
            </Button>
          </div>
        </aside>
      </main>

      {!splitViewMode && orderItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <Button 
            className="w-full h-14 rounded-2xl shadow-2xl flex items-center justify-between px-6"
            onClick={() => setSplitViewMode(true)}
            data-testid="button-mobile-cart-fab"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-bold">{orderItems.length} أصناف</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black">{calculateTotal().toFixed(2)} ر.س</span>
              <ChevronLeft className="w-5 h-5" />
            </div>
          </Button>
        </div>
      )}

      <Dialog open={showOrdersPanel} onOpenChange={setShowOrdersPanel}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              الطلبات الحية ({liveOrders?.length || 0})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[65vh]">
            <div className="space-y-3 p-1">
              {!liveOrders || liveOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">لا توجد طلبات حية حالياً</p>
                </div>
              ) : (
                liveOrders.map((order: any) => {
                  const orderCustomerName = order.customerName || order.customerInfo?.customerName || order.customerInfo?.name || '';
                  const orderCustomerPhone = order.customerPhone || order.customerInfo?.customerPhone || order.customerInfo?.phone || '';
                  const statusColors: Record<string, string> = {
                    'pending': 'border-yellow-500 bg-yellow-500/5',
                    'in_progress': 'border-blue-500 bg-blue-500/5',
                    'ready': 'border-green-500 bg-green-500/5',
                  };
                  const statusLabels: Record<string, string> = {
                    'pending': 'قيد الانتظار',
                    'payment_confirmed': 'مؤكد',
                    'in_progress': 'جاري التحضير',
                    'ready': 'جاهز',
                  };
                  const carInfo = order.carType || order.carInfo?.carType;
                  const carColor = order.carColor || order.carInfo?.carColor;
                  
                  return (
                    <Card key={order.id || order._id} className={`border-2 ${statusColors[order.status] || 'border-border'}`} data-testid={`order-card-${order.id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-black text-lg">{formatPosOrderNumber(order)}</span>
                              <Badge variant={order.status === 'ready' ? 'default' : 'secondary'} className="text-xs">
                                {statusLabels[order.status] || order.status}
                              </Badge>
                              {order.orderType && (
                                <Badge variant="outline" className="text-xs">
                                  {order.orderType === 'dine_in' || order.orderType === 'dine-in' ? 'محلي' : 
                                   order.orderType === 'takeaway' || order.orderType === 'pickup' ? 'سفري' : 
                                   order.orderType === 'car_pickup' || order.orderType === 'car-pickup' ? 'سيارة' : 
                                   order.orderType === 'delivery' ? 'توصيل' : order.orderType}
                                </Badge>
                              )}
                            </div>
                            {orderCustomerName && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">{orderCustomerName}</span>
                                {orderCustomerPhone && <span className="mr-2 text-xs">({orderCustomerPhone})</span>}
                              </p>
                            )}
                            {order.tableNumber && (
                              <p className="text-xs text-muted-foreground">طاولة: {order.tableNumber}</p>
                            )}
                            {carInfo && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-purple-500">
                                <Navigation className="w-3 h-3" />
                                <span>{carInfo} - {carColor}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            <span className="font-black text-primary text-lg">{Number(order.totalAmount).toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground mr-1">ر.س</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs py-0.5">
                              <span>{item.name || item.nameAr || item.coffeeItem?.nameAr} x{item.quantity}</span>
                              <span className="text-muted-foreground">{Number(item.price || item.unitPrice || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id || order._id, status: 'in_progress' })}
                              disabled={updateOrderStatusMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                              data-testid={`button-start-prep-${order.id}`}
                            >
                              <Clock className="w-3 h-3 ml-1" />
                              بدء التحضير
                            </Button>
                          )}
                          {order.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id || order._id, status: 'ready' })}
                              disabled={updateOrderStatusMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`button-ready-${order.id}`}
                            >
                              <Check className="w-3 h-3 ml-1" />
                              جاهز
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id || order._id, status: 'completed' })}
                              disabled={updateOrderStatusMutation.isPending}
                              data-testid={`button-delivered-${order.id}`}
                            >
                              <CheckCircle className="w-3 h-3 ml-1" />
                              تم التسليم
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePrintLiveOrder(order)}
                            data-testid={`button-print-order-${order.id}`}
                          >
                            <Printer className="w-3 h-3 ml-1" />
                            طباعة
                          </Button>
                          {order.status !== 'cancelled' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id || order._id, status: 'cancelled' })}
                              disabled={updateOrderStatusMutation.isPending}
                              data-testid={`button-cancel-${order.id}`}
                            >
                              <X className="w-3 h-3 ml-1" />
                              إلغاء
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
              إيصال الطلب
            </DialogTitle>
          </DialogHeader>
          {lastOrder && (
            <div className="space-y-4">
              <div className="text-center space-y-1 border-b pb-3">
                <h3 className="font-black text-xl text-primary">BLACK ROSE CAFE</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(lastOrder.date).toLocaleDateString('ar-SA')} - {new Date(lastOrder.date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <Badge variant="secondary" className="text-sm font-black" data-testid="text-receipt-order-number">
                  {formatPosOrderNumber(lastOrder)}
                </Badge>
              </div>

              {(lastOrder.customerName || lastOrder.customerPhone) && (
                <div className="text-xs space-y-0.5 border-b pb-2">
                  {lastOrder.customerName && <p>العميل: <span className="font-bold">{lastOrder.customerName}</span></p>}
                  {lastOrder.customerPhone && <p>الجوال: <span className="font-bold" dir="ltr">{lastOrder.customerPhone}</span></p>}
                </div>
              )}

              <div className="space-y-1.5">
                {lastOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm" data-testid={`receipt-item-${idx}`}>
                    <div className="flex-1">
                      <span className="font-medium">{item.coffeeItem.nameAr}</span>
                      <span className="text-muted-foreground mr-1">x{item.quantity}</span>
                    </div>
                    <span className="font-bold">{(Number(item.coffeeItem.price) * item.quantity).toFixed(2)} ر.س</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-bold">{lastOrder.subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الضريبة (15%)</span>
                  <span className="font-bold">{lastOrder.tax.toFixed(2)} ر.س</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-black text-base">الإجمالي</span>
                  <span className="font-black text-lg text-primary">{lastOrder.total.toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="text-xs space-y-0.5 border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">طريقة الدفع</span>
                  <span className="font-bold">{PAYMENT_METHOD_LABELS[lastOrder.paymentMethod] || lastOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الموظف</span>
                  <span className="font-bold">{lastOrder.employeeName}</span>
                </div>
                {lastOrder.tableNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الطاولة</span>
                    <span className="font-bold">{lastOrder.tableNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={handlePrintReceipt}
                  data-testid="button-print-receipt"
                >
                  <Printer className="w-4 h-4" />
                  طباعة الفاتورة
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => setShowReceiptDialog(false)}
                  data-testid="button-new-order"
                >
                  <Plus className="w-4 h-4" />
                  طلب جديد
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showTablesDialog} onOpenChange={setShowTablesDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              الطاولات ({tables.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[65vh]">
            {tables.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">لا توجد طاولات مسجلة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                {tables.map((table: any) => {
                  const isOccupied = table.isOccupied === 1 || table.isOccupied === true;
                  const isReserved = !!table.reservationInfo;
                  const isAvailable = !isOccupied && !isReserved;
                  const borderColor = isAvailable ? 'border-green-500' : isReserved ? 'border-yellow-500' : 'border-red-500';
                  const bgColor = isAvailable ? 'bg-green-500/5' : isReserved ? 'bg-yellow-500/5' : 'bg-red-500/5';

                  return (
                    <Card
                      key={table.id || table._id}
                      className={`border-2 ${borderColor} ${bgColor} cursor-pointer transition-all`}
                      onClick={() => {
                        if (isAvailable) {
                          setTableNumber(String(table.tableNumber || table.number));
                          setOrderType("dine_in");
                          setShowTablesDialog(false);
                          toast({ title: "تم اختيار الطاولة", description: `طاولة رقم ${table.tableNumber || table.number}` });
                        }
                      }}
                      data-testid={`table-card-${table.id || table._id}`}
                    >
                      <CardContent className="p-3 text-center space-y-2">
                        <div className="text-2xl font-black">{table.tableNumber || table.number}</div>
                        <Badge
                          variant={isAvailable ? "default" : "secondary"}
                          className={`text-[10px] ${isAvailable ? 'bg-green-600' : isReserved ? 'bg-yellow-500 text-black' : 'bg-red-600'}`}
                          data-testid={`table-status-${table.id || table._id}`}
                        >
                          {isAvailable ? 'متاحة' : isReserved ? 'محجوزة' : 'مشغولة'}
                        </Badge>
                        {table.capacity && (
                          <p className="text-[10px] text-muted-foreground">{table.capacity} أشخاص</p>
                        )}
                        {isOccupied && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              emptyTableMutation.mutate(table.id || table._id);
                            }}
                            disabled={emptyTableMutation.isPending}
                            data-testid={`button-empty-table-${table.id || table._id}`}
                          >
                            <X className="w-3 h-3 ml-1" />
                            إفراغ الطاولة
                          </Button>
                        )}
                        {isReserved && table.reservationInfo && (
                          <p className="text-[10px] text-yellow-600 font-medium">
                            {table.reservationInfo.customerName || 'حجز نشط'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showOpenBillsDialog} onOpenChange={(open) => { setShowOpenBillsDialog(open); if (!open) setSelectedTableForBill(null); }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              فواتير مفتوحة ({openTableOrders.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[65vh]">
            {openTableOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">لا توجد فواتير مفتوحة</p>
              </div>
            ) : (
              <div className="space-y-3 p-1">
                {openTableOrders.map((order: any) => {
                  const orderItems = Array.isArray(order.items) ? order.items : [];
                  const total = Number(order.totalAmount || 0);
                  const elapsed = order.createdAt ? Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000) : 0;
                  const isSelectedForClose = selectedTableForBill?.id === order.id;
                  const statusLabels: Record<string, string> = {
                    'pending': 'قيد الانتظار',
                    'in_progress': 'جاري التحضير',
                    'ready': 'جاهز',
                  };

                  return (
                    <Card key={order.id || order._id} className="border-2" data-testid={`open-bill-${order.id}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-lg">طاولة {order.tableNumber}</span>
                              <Badge variant="secondary" className="text-xs">{formatPosOrderNumber(order)}</Badge>
                              <Badge variant="outline" className="text-xs">
                                {statusLabels[order.status] || order.status}
                              </Badge>
                            </div>
                            {elapsed > 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                منذ {elapsed} دقيقة
                              </p>
                            )}
                          </div>
                          <div className="text-left">
                            <span className="font-black text-primary text-lg">{total.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground mr-1">ر.س</span>
                          </div>
                        </div>

                        <div className="border-t pt-2">
                          {orderItems.slice(0, 5).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs py-0.5">
                              <span>{item.name || item.nameAr || item.coffeeItem?.nameAr} x{item.quantity || 1}</span>
                              <span className="text-muted-foreground">{Number(item.price || item.unitPrice || 0).toFixed(2)}</span>
                            </div>
                          ))}
                          {orderItems.length > 5 && (
                            <p className="text-xs text-muted-foreground mt-1">+{orderItems.length - 5} أصناف أخرى</p>
                          )}
                        </div>

                        {isSelectedForClose ? (
                          <div className="border-t pt-3 space-y-3">
                            <p className="text-sm font-bold">اختر طريقة الدفع:</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {PAYMENT_METHODS.map((method) => (
                                <Button
                                  key={method.id}
                                  variant={billPaymentMethod === method.id ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setBillPaymentMethod(method.id as PaymentMethod)}
                                  className="flex flex-col gap-0.5 h-auto py-2 text-[10px]"
                                  data-testid={`bill-payment-${method.id}`}
                                >
                                  <method.icon className="w-4 h-4" />
                                  <span className="font-bold">{method.name}</span>
                                </Button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 gap-2"
                                onClick={() => closeBillMutation.mutate({ orderId: order.id || order._id, payMethod: billPaymentMethod })}
                                disabled={closeBillMutation.isPending}
                                data-testid={`button-confirm-close-bill-${order.id}`}
                              >
                                {closeBillMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                تأكيد وطباعة
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedTableForBill(null)}
                                data-testid={`button-cancel-close-bill-${order.id}`}
                              >
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 flex-wrap border-t pt-2">
                            <Button
                              size="sm"
                              onClick={() => { setSelectedTableForBill(order); setBillPaymentMethod("cash"); }}
                              data-testid={`button-close-bill-${order.id}`}
                            >
                              <Banknote className="w-3 h-3 ml-1" />
                              إغلاق الفاتورة
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintLiveOrder(order)}
                              data-testid={`button-print-bill-${order.id}`}
                            >
                              <Printer className="w-3 h-3 ml-1" />
                              طباعة
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showPOSSettings} onOpenChange={setShowPOSSettings}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right font-bold text-xl">POS Settings / إعدادات نقاط البيع</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-print" className="text-sm font-bold cursor-pointer">Auto Print Receipt / الطباعة التلقائية</Label>
              <Switch id="auto-print" checked={autoPrint} onCheckedChange={setAutoPrint} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-notif" className="text-sm font-bold cursor-pointer">Sound Alerts / تنبيهات الصوت</Label>
              <Switch id="sound-notif" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-vat" className="text-sm font-bold cursor-pointer">Show "Incl. VAT" / عرض "شامل الضريبة"</Label>
              <Switch id="show-vat" checked={showVatLabel} onCheckedChange={setShowVatLabel} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pos-terminal" className="text-sm font-bold cursor-pointer block">Geidea Terminal / جهاز جيديا</Label>
                <p className="text-xs text-muted-foreground mt-1">{posTerminalConnected ? "Connected / متصل" : "Disconnected / غير متصل"}</p>
              </div>
              <Switch id="pos-terminal" checked={posTerminalConnected} onCheckedChange={setPosTerminalConnected} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-bold block">Customer Display / شاشة العميل</Label>
                <p className="text-xs text-muted-foreground mt-1">Open on second screen / افتح على شاشة ثانية</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/customer-display", "_blank")}
                data-testid="button-open-customer-display"
              >
                <MonitorSmartphone className="w-4 h-4 ml-2" />
                فتح
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DrinkCustomizationDialog
        coffeeItem={posCustomizingItem}
        open={posCustomizingItem !== null}
        onClose={() => setPosCustomizingItem(null)}
        onConfirm={handleConfirmPOSCustomization}
      />
    </div>
  );
}
