import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ShoppingCart, ArrowRight, Plus, Trash2, Package, CheckCircle2, Clock, XCircle, Truck, FileText, ChevronDown } from "lucide-react";
import type { RawItem } from "@shared/schema";

interface Supplier { id: string; nameAr: string; nameEn?: string; phone?: string; }
interface PurchaseOrderItem { rawItemId: string; rawItemName: string; quantity: number; unit: string; unitCost: number; totalCost: number; receivedQuantity?: number; }
interface PurchaseOrder {
  id: string; orderNumber: string; supplierId: string; supplierName: string;
  items: PurchaseOrderItem[]; totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  expectedDeliveryDate?: string; receivedDate?: string; notes?: string; createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700", icon: FileText },
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "معتمد", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  ordered: { label: "تم الطلب", color: "bg-purple-100 text-purple-700", icon: Truck },
  received: { label: "مستلم", color: "bg-green-100 text-green-700", icon: Package },
  cancelled: { label: "ملغى", color: "bg-red-100 text-red-700", icon: XCircle },
};

const NEXT_STATUS: Record<string, string> = {
  draft: 'pending', pending: 'approved', approved: 'ordered', ordered: 'received',
};

export default function PurchaseOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState<Array<{ rawItemId: string; rawItemName: string; quantity: string; unit: string; unitCost: string }>>([{ rawItemId: "", rawItemName: "", quantity: "1", unit: "kg", unitCost: "0" }]);

  const { data: orders = [], isLoading } = useQuery<PurchaseOrder[]>({ queryKey: ["/api/purchase-orders", statusFilter] });
  const { data: suppliers = [] } = useQuery<Supplier[]>({ queryKey: ["/api/inventory/suppliers"] });
  const { data: rawItems = [] } = useQuery<RawItem[]>({ queryKey: ["/api/inventory/raw-items"] });

  const filteredOrders = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      setShowAdd(false);
      setSupplierId(""); setSupplierName(""); setExpectedDeliveryDate(""); setNotes("");
      setOrderItems([{ rawItemId: "", rawItemName: "", quantity: "1", unit: "kg", unitCost: "0" }]);
      toast({ title: "تم إنشاء أمر الشراء" });
    },
    onError: (e: any) => toast({ title: e.message || "فشل", variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: any) => apiRequest("PATCH", `/api/purchase-orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({ title: "تم تحديث حالة الأمر" });
    },
  });

  const addItem = () => setOrderItems(prev => [...prev, { rawItemId: "", rawItemName: "", quantity: "1", unit: "kg", unitCost: "0" }]);
  const removeItem = (i: number) => setOrderItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string) => {
    setOrderItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      if (field === 'rawItemId') {
        const ri = rawItems.find(r => r.id === value);
        if (ri) { updated.rawItemName = ri.nameAr; updated.unit = ri.unit; updated.unitCost = String(ri.unitCost || 0); }
      }
      return updated;
    }));
  };

  const totalAmount = orderItems.reduce((sum, i) => sum + (parseFloat(i.quantity || "0") * parseFloat(i.unitCost || "0")), 0);

  const handleSubmit = () => {
    if (!supplierId) return toast({ title: "اختر المورد", variant: "destructive" });
    const validItems = orderItems.filter(i => i.rawItemId && parseFloat(i.quantity) > 0);
    if (!validItems.length) return toast({ title: "أضف مادة واحدة على الأقل", variant: "destructive" });
    createMutation.mutate({ supplierId, supplierName, items: validItems.map(i => ({ ...i, quantity: parseFloat(i.quantity), unitCost: parseFloat(i.unitCost) })), expectedDeliveryDate, notes });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 pb-20" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/manager/dashboard")} data-testid="button-back">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">أوامر الشراء</h1>
            <p className="text-muted-foreground text-sm">إدارة طلبات الشراء من الموردين</p>
          </div>
          <Button className="mr-auto" onClick={() => setShowAdd(true)} data-testid="button-add-order">
            <Plus className="w-4 h-4 ml-2" /> أمر شراء جديد
          </Button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {["all", ...Object.keys(STATUS_CONFIG)].map(s => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} data-testid={`filter-${s}`} className="text-xs">
              {s === 'all' ? 'الكل' : STATUS_CONFIG[s]?.label}
              {s !== 'all' && <Badge variant="secondary" className="mr-1 text-xs">{orders.filter(o => o.status === s).length}</Badge>}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center py-12 text-muted-foreground">جارٍ التحميل...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد أوامر شراء</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const cfg = STATUS_CONFIG[order.status];
              const Icon = cfg?.icon || FileText;
              const isExpanded = expandedId === order.id;
              return (
                <Card key={order.id} data-testid={`card-order-${order.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                          <Badge className={`text-xs ${cfg?.color}`}><Icon className="w-3 h-3 ml-1" />{cfg?.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.supplierName} • {order.items.length} مادة • {order.totalAmount.toFixed(2)} ر.س</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {NEXT_STATUS[order.status] && (
                          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); statusMutation.mutate({ id: order.id, status: NEXT_STATUS[order.status] }); }} data-testid={`button-advance-${order.id}`} className="text-xs">
                            {STATUS_CONFIG[NEXT_STATUS[order.status]]?.label} →
                          </Button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'received' && (
                          <Button size="sm" variant="ghost" className="text-red-500 text-xs" onClick={e => { e.stopPropagation(); statusMutation.mutate({ id: order.id, status: 'cancelled' }); }} data-testid={`button-cancel-${order.id}`}>إلغاء</Button>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <div className="grid grid-cols-3 text-xs text-muted-foreground font-medium mb-1 px-1">
                          <span>المادة</span><span className="text-center">الكمية</span><span className="text-left">التكلفة</span>
                        </div>
                        {order.items.map((item, i) => (
                          <div key={i} className="grid grid-cols-3 text-sm px-1 py-1 bg-muted/30 rounded">
                            <span>{item.rawItemName}</span>
                            <span className="text-center">{item.quantity} {item.unit}</span>
                            <span className="text-left font-medium">{item.totalCost.toFixed(2)} ر.س</span>
                          </div>
                        ))}
                        {order.notes && <p className="text-xs text-muted-foreground pt-1">ملاحظة: {order.notes}</p>}
                        {order.expectedDeliveryDate && <p className="text-xs text-muted-foreground">موعد التسليم المتوقع: {new Date(order.expectedDeliveryDate).toLocaleDateString('ar-SA')}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> أمر شراء جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المورد *</Label>
                <Select value={supplierId} onValueChange={v => { setSupplierId(v); setSupplierName(suppliers.find(s => s.id === v)?.nameAr || ""); }}>
                  <SelectTrigger data-testid="select-supplier"><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>موعد التسليم المتوقع</Label>
                <Input type="date" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} data-testid="input-expected-date" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>المواد المطلوبة *</Label>
                <Button variant="outline" size="sm" onClick={addItem} data-testid="button-add-item"><Plus className="w-3 h-3 ml-1" /> إضافة مادة</Button>
              </div>
              <div className="space-y-2">
                {orderItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Select value={item.rawItemId} onValueChange={v => updateItem(i, 'rawItemId', v)}>
                        <SelectTrigger className="text-sm" data-testid={`select-raw-item-${i}`}><SelectValue placeholder="المادة" /></SelectTrigger>
                        <SelectContent>
                          {rawItems.map(r => <SelectItem key={r.id} value={r.id}>{r.nameAr}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="الكمية" className="text-sm" data-testid={`input-qty-${i}`} />
                    </div>
                    <div className="col-span-2">
                      <Input value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} placeholder="الوحدة" className="text-sm" data-testid={`input-unit-${i}`} />
                    </div>
                    <div className="col-span-3">
                      <Input type="number" min="0" step="0.01" value={item.unitCost} onChange={e => updateItem(i, 'unitCost', e.target.value)} placeholder="سعر الوحدة" className="text-sm" data-testid={`input-cost-${i}`} />
                    </div>
                    <div className="col-span-1">
                      {orderItems.length > 1 && (
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500" onClick={() => removeItem(i)} data-testid={`button-remove-item-${i}`}><Trash2 className="w-3 h-3" /></Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-left mt-2 text-sm font-medium">
                الإجمالي: <span className="text-primary">{totalAmount.toFixed(2)} ر.س</span>
              </div>
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات إضافية..." data-testid="input-notes" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-submit-order">
                {createMutation.isPending ? "جارٍ الإنشاء..." : "إنشاء أمر الشراء"}
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
