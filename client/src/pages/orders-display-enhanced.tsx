import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  ArrowLeft, 
  RefreshCw,
  Package,
  Timer,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import type { Employee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  status: string;
  tableStatus?: string;
  totalAmount: number;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: any[];
  customerInfo?: any;
  tableNumber?: string;
  orderType?: string;
  estimatedPrepTimeInMinutes?: number;
  prepTimeSetAt?: string;
}

const REFRESH_INTERVAL = 3000; // 3 seconds

export default function OrdersDisplayEnhanced() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      setEmployee(emp);
      if (emp.branchId) {
        setSelectedBranch(emp.branchId);
      }
    } else {
      setLocation("/employee/login");
    }
  }, [setLocation]);

  const fetchOrders = useCallback(async () => {
    if (!selectedBranch) return;

    try {
      const token = localStorage.getItem("employeeToken");
      const response = await fetch(`/api/orders?branchId=${selectedBranch}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedBranch) {
      fetchOrders();
      const interval = setInterval(fetchOrders, REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [selectedBranch, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("employeeToken");
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "تم تحديث الحالة",
          description: `تم تحديث حالة الطلب إلى ${getStatusLabel(newStatus)}`,
          className: "bg-green-600 text-white",
        });
        fetchOrders();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الطلب",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      payment_confirmed: "تم تأكيد الدفع",
      in_progress: "قيد التحضير",
      ready: "جاهز",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      payment_confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      in_progress: "bg-orange-100 text-orange-800 border-orange-300",
      ready: "bg-green-100 text-green-800 border-green-300",
      completed: "bg-gray-100 text-gray-800 border-gray-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "payment_confirmed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "in_progress":
        return <ChefHat className="w-4 h-4" />;
      case "ready":
        return <Package className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTimeElapsed = (createdAt?: string) => {
    if (!createdAt) return "N/A";
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diff = Math.floor((now - created) / 1000 / 60); // minutes
    return `${diff} دقيقة`;
  };

  const groupedOrders = {
    pending: orders.filter(o => o.status === "pending"),
    payment_confirmed: orders.filter(o => o.status === "payment_confirmed"),
    in_progress: orders.filter(o => o.status === "in_progress"),
    ready: orders.filter(o => o.status === "ready"),
  };

  const stats = {
    total: orders.length,
    pending: groupedOrders.pending.length,
    inProgress: groupedOrders.in_progress.length,
    ready: groupedOrders.ready.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/employee/dashboard")}
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                شاشة عرض الطلبات
              </h1>
              <p className="text-slate-300 mt-1">متابعة الطلبات لحظة بلحظة</p>
            </div>
          </div>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="bg-white text-slate-800 hover:bg-slate-100"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto mt-6 grid grid-cols-4 gap-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-white/70 text-sm">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/20 border-yellow-300/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-white/90 text-sm">قيد الانتظار</p>
              <p className="text-3xl font-bold text-yellow-200">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/20 border-orange-300/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-white/90 text-sm">قيد التحضير</p>
              <p className="text-3xl font-bold text-orange-200">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/20 border-green-300/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-white/90 text-sm">جاهز للتسليم</p>
              <p className="text-3xl font-bold text-green-200">{stats.ready}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pending Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              قيد الانتظار ({groupedOrders.pending.length})
            </h2>
            {groupedOrders.pending.map((order) => (
              <Card key={order._id} className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{order.orderNumber}</CardTitle>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {getStatusIcon(order.status)}
                      <span className="mr-1">{getStatusLabel(order.status)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                    <Timer className="w-4 h-4" />
                    <span>{getTimeElapsed(order.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-700">المجموع: {order.totalAmount.toFixed(2)} ر.س</p>
                    {order.tableNumber && (
                      <p className="text-slate-600">طاولة: {order.tableNumber}</p>
                    )}
                    {order.items && (
                      <p className="text-slate-600">{order.items.length} عنصر</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => updateOrderStatus(order.id || order._id, "in_progress")}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      <ChefHat className="w-4 h-4 ml-2" />
                      بدء التحضير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Confirmed Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              مؤكد الدفع ({groupedOrders.payment_confirmed.length})
            </h2>
            {groupedOrders.payment_confirmed.map((order) => (
              <Card key={order._id} className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{order.orderNumber}</CardTitle>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {getStatusIcon(order.status)}
                      <span className="mr-1">{getStatusLabel(order.status)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                    <Timer className="w-4 h-4" />
                    <span>{getTimeElapsed(order.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-700">المجموع: {order.totalAmount.toFixed(2)} ر.س</p>
                    {order.tableNumber && (
                      <p className="text-slate-600">طاولة: {order.tableNumber}</p>
                    )}
                    {order.items && (
                      <p className="text-slate-600">{order.items.length} عنصر</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => updateOrderStatus(order.id || order._id, "in_progress")}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      <ChefHat className="w-4 h-4 ml-2" />
                      بدء التحضير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* In Progress Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-600" />
              قيد التحضير ({groupedOrders.in_progress.length})
            </h2>
            {groupedOrders.in_progress.map((order) => (
              <Card key={order._id} className="border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow animate-pulse">
                <CardHeader className="pb-3 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{order.orderNumber}</CardTitle>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {getStatusIcon(order.status)}
                      <span className="mr-1">{getStatusLabel(order.status)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                    <Timer className="w-4 h-4" />
                    <span>{getTimeElapsed(order.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-700">المجموع: {order.totalAmount.toFixed(2)} ر.س</p>
                    {order.tableNumber && (
                      <p className="text-slate-600">طاولة: {order.tableNumber}</p>
                    )}
                    {order.items && (
                      <p className="text-slate-600">{order.items.length} عنصر</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => updateOrderStatus(order.id || order._id, "ready")}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <Package className="w-4 h-4 ml-2" />
                      جاهز للتسليم
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ready Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              جاهز ({groupedOrders.ready.length})
            </h2>
            {groupedOrders.ready.map((order) => (
              <Card key={order._id} className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3 bg-green-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{order.orderNumber}</CardTitle>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {getStatusIcon(order.status)}
                      <span className="mr-1">{getStatusLabel(order.status)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                    <Timer className="w-4 h-4" />
                    <span>{getTimeElapsed(order.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-700">المجموع: {order.totalAmount.toFixed(2)} ر.س</p>
                    {order.tableNumber && (
                      <p className="text-slate-600">طاولة: {order.tableNumber}</p>
                    )}
                    {order.items && (
                      <p className="text-slate-600">{order.items.length} عنصر</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => updateOrderStatus(order.id || order._id, "completed")}
                      className="w-full bg-slate-600 hover:bg-slate-700"
                      size="sm"
                    >
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                      تم التسليم
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
