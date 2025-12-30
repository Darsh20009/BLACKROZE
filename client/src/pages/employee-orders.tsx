import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Coffee, BellRing, RefreshCw, ArrowRight, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export default function EmployeeOrders() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentEmployee");
    if (stored) {
      setEmployee(JSON.parse(stored));
    } else {
      setLocation("/employee/gateway");
    }
  }, [setLocation]);

  const { data: orders = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/orders"],
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
        </div>
      </div>
    </div>
  );
}