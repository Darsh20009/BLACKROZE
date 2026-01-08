import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Coffee, BellRing, RefreshCw, ArrowRight, Search, Filter, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function EmployeeOrders() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Cash payment dialog state
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [receivedAmount, setReceivedAmount] = useState<string>("");
  const [changeAmount, setChangeAmount] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem("currentEmployee");
    if (stored) {
      setEmployee(JSON.parse(stored));
    } else {
      setLocation("/employee/login");
    }
  }, [setLocation]);

  const { data: orders = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 3000, // Faster real-time refresh
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["/api/branches"],
  });

  const completeAllOrdersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/orders/complete-all", { method: "POST" });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, paymentStatus, paymentDetails }: { id: string; paymentStatus: string; paymentDetails?: string }) => {
      const response = await fetch(`/api/orders/${id}/payment-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus, paymentDetails }),
      });
      if (!response.ok) throw new Error("Failed to update payment status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setShowCashDialog(false);
      setReceivedAmount("");
      setCurrentOrder(null);
    },
  });

  useEffect(() => {
    if (currentOrder && receivedAmount) {
      const received = parseFloat(receivedAmount);
      const total = parseFloat(currentOrder.totalAmount);
      if (!isNaN(received)) {
        setChangeAmount(Math.max(0, received - total));
      }
    } else {
      setChangeAmount(0);
    }
  }, [receivedAmount, currentOrder]);

  const handleCashPayment = (order: any) => {
    setCurrentOrder(order);
    setShowCashDialog(true);
  };

  const confirmCashPayment = () => {
    if (!currentOrder) return;
    const received = parseFloat(receivedAmount);
    if (isNaN(received) || received < parseFloat(currentOrder.totalAmount)) {
      alert("المبلغ المدفوع أقل من إجمالي الطلب");
      return;
    }
    updatePaymentMutation.mutate({ 
      id: currentOrder._id || currentOrder.id, 
      paymentStatus: 'paid',
      paymentDetails: `نقدي - المستلم: ${received} ر.س - المرتجع: ${changeAmount.toFixed(2)} ر.س`
    });
  };

  if (!employee) return null;

  const filteredOrders = orders.filter((order) => {
    if (selectedBranchId && order.branchId !== selectedBranchId) return false;
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (order.orderNumber || "").toLowerCase().includes(query);
    }
    return true;
  });

  const newOrdersCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center relative">
                <Coffee className="w-6 h-6 text-primary" />
                {newOrdersCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-destructive-foreground text-xs font-bold">{newOrdersCount}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                  إدارة الطلبات
                  {newOrdersCount > 0 && <BellRing className="w-5 h-5 text-destructive animate-pulse" />}
                </h1>
                <p className="text-muted-foreground text-sm">الموظف: {employee.fullName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()} className="border-primary/50 text-primary">
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث
              </Button>
              <Button variant="outline" onClick={() => setLocation("/employee/dashboard")} className="border-primary/50 text-primary">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold text-primary">تصفية حسب الفرع:</Label>
            <Select value={selectedBranchId || "all"} onValueChange={(v) => setSelectedBranchId(v === "all" ? null : v)}>
              <SelectTrigger className="w-56"><SelectValue placeholder="اختر فرع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                {branches.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.nameAr}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => confirm("هل تريد حقاً؟") && completeAllOrdersMutation.mutate()} className="bg-[#B58B5A] text-white">
              جعل جميع الطلبات مكتملة
            </Button>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10 text-right" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="pending">جديد</SelectItem>
                    <SelectItem value="in_progress">قيد التحضير</SelectItem>
                    <SelectItem value="ready">جاهز</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="p-2 border rounded bg-background"><p className="text-primary font-bold">{filteredOrders.length}</p><p className="text-xs">إجمالي</p></div>
                <div className="p-2 border rounded bg-background"><p className="text-primary font-bold">{filteredOrders.filter(o => o.status === "pending").length}</p><p className="text-xs">جديد</p></div>
                <div className="p-2 border rounded bg-background"><p className="text-primary font-bold">{filteredOrders.filter(o => o.status === "in_progress").length}</p><p className="text-xs">تحضير</p></div>
                <div className="p-2 border rounded bg-background"><p className="text-primary font-bold">{filteredOrders.filter(o => o.status === "ready").length}</p><p className="text-xs">جاهز</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-card rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground">لا توجد طلبات لعرضها حالياً</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order._id || order.id} className="hover-elevate overflow-hidden border-border bg-card">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-primary">طلب #{order.orderNumber}</h3>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-SA') : 'تاريخ غير معروف'}
                        </p>
                      </div>
                      <Badge variant={
                        order.status === 'pending' ? 'destructive' :
                        order.status === 'in_progress' ? 'default' :
                        order.status === 'ready' ? 'success' : 'outline'
                      }>
                        {order.status === 'pending' ? 'جديد' :
                         order.status === 'in_progress' ? 'تحضير' :
                         order.status === 'ready' ? 'جاهز' : 
                         order.status === 'completed' ? 'مكتمل' : 'ملغي'}
                      </Badge>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="space-y-1">
                        {order.items?.map((item: any, idx: number) => {
                          const unitPrice = item.unitPrice || item.price || item.coffeeItem?.price || 0;
                          const name = item.nameAr || item.coffeeItem?.nameAr || 'منتج';
                          return (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{name} x{item.quantity}</span>
                              <span className="font-semibold">{(item.totalPrice || (unitPrice * item.quantity)).toFixed(2)} ر.س</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="flex flex-col text-right" dir="rtl">
                        <span className="font-bold text-primary">الإجمالي: {order.totalAmount} ر.س</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'outline'} className="text-[10px]">
                            {order.paymentStatus === 'paid' ? 'تم الدفع' : 'لم يتم الدفع'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{order.paymentMethod === 'cash' ? 'نقدي' : 'شبكة/بطاقة'}</span>
                        </div>
                        {order.customerInfo && (
                          <div className="mt-1 text-[10px] text-muted-foreground leading-tight">
                            <p>العميل: {order.customerInfo.customerName}</p>
                            <p>الجوال: {order.customerInfo.phoneNumber}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {order.paymentStatus !== 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-[10px] border-green-600 text-green-600 hover-elevate"
                            onClick={() => {
                              if (order.paymentMethod === 'cash') {
                                handleCashPayment(order);
                              } else {
                                updatePaymentMutation.mutate({ id: order._id || order.id, paymentStatus: 'paid' });
                              }
                            }}
                          >
                            تأكيد الدفع
                          </Button>
                        )}
                        {order.status === 'pending' && (
                          <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: order._id || order.id, status: 'in_progress' })}>
                            بدء التحضير
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: order._id || order.id, status: 'ready' })}>
                            جاهز للتسليم
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: order._id || order.id, status: 'completed' })}>
                            إكمال
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCashDialog} onOpenChange={setShowCashDialog}>
        <DialogContent className="max-w-md bg-white border-2 border-primary/20 shadow-2xl" dir="rtl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-primary">تحصيل مبلغ نقدي</DialogTitle>
            <p className="text-center text-muted-foreground">طلب رقم #{currentOrder?.orderNumber}</p>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/10">
              <span className="text-lg font-semibold text-primary">المبلغ المطلوب:</span>
              <span className="text-2xl font-black text-primary">{currentOrder?.totalAmount} ر.س</span>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-bold text-primary">المبلغ المستلم من العميل:</Label>
              <div className="relative">
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="text-2xl h-14 text-center font-bold border-2 border-primary/30 focus:border-primary transition-all rounded-xl"
                  autoFocus
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold">ر.س</span>
              </div>
            </div>

            {changeAmount > 0 && (
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-800">المبلغ المتبقي للعميل:</span>
                  <span className="text-2xl font-black text-green-700">{changeAmount.toFixed(2)} ر.س</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCashDialog(false)} 
              className="flex-1 h-12 text-lg border-2"
            >
              إلغاء
            </Button>
            <Button 
              onClick={confirmCashPayment} 
              disabled={updatePaymentMutation.isPending || !receivedAmount || parseFloat(receivedAmount) < (currentOrder?.totalAmount || 0)}
              className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg"
            >
              {updatePaymentMutation.isPending ? "جاري الحفظ..." : "تأكيد واستلام"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}