import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Gift, Plus, ArrowRight, Copy, ToggleLeft, ToggleRight, Trash2, CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface GiftCard {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  purchasedByName?: string;
  assignedToPhone?: string;
  note?: string;
  expiryDate?: string;
  transactions: Array<{ amount: number; description: string; type: string; date: string }>;
  createdAt: string;
}

export default function GiftCardManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [form, setForm] = useState({ initialBalance: "", purchasedByName: "", assignedToPhone: "", note: "", expiryDate: "" });
  const [validateCode, setValidateCode] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);

  const { data: cards = [], isLoading } = useQuery<GiftCard[]>({ queryKey: ["/api/gift-cards"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/gift-cards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gift-cards"] });
      setShowAdd(false);
      setForm({ initialBalance: "", purchasedByName: "", assignedToPhone: "", note: "", expiryDate: "" });
      toast({ title: "تم إنشاء بطاقة الهدية بنجاح" });
    },
    onError: (e: any) => toast({ title: e.message || "فشل", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/gift-cards/${id}/toggle`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/gift-cards"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/gift-cards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gift-cards"] });
      toast({ title: "تم حذف البطاقة" });
    },
  });

  const totalIssued = cards.reduce((s, c) => s + c.initialBalance, 0);
  const totalRemaining = cards.reduce((s, c) => s + c.currentBalance, 0);
  const activeCards = cards.filter(c => c.isActive).length;

  const handleValidate = async () => {
    if (!validateCode.trim()) return;
    try {
      const res = await fetch(`/api/gift-cards/validate/${validateCode.trim()}`);
      const data = await res.json();
      setValidationResult(res.ok ? { ...data, valid: true } : { valid: false, error: data.error });
    } catch {
      setValidationResult({ valid: false, error: "خطأ في الاتصال" });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "تم نسخ الكود" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/manager/dashboard")} data-testid="button-back">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">بطاقات الهدايا</h1>
            <p className="text-muted-foreground text-sm">إدارة وإصدار بطاقات الهدايا</p>
          </div>
          <div className="mr-auto">
            <Button onClick={() => setShowAdd(true)} data-testid="button-add-gift-card">
              <Plus className="w-4 h-4 ml-2" /> إصدار بطاقة هدية
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي البطاقات</p>
                <p className="text-2xl font-bold" data-testid="text-total-cards">{cards.length}</p>
                <p className="text-xs text-green-600">{activeCards} نشطة</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإصدار</p>
                <p className="text-2xl font-bold">{totalIssued.toFixed(0)} ر.س</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرصيد المتبقي</p>
                <p className="text-2xl font-bold">{totalRemaining.toFixed(0)} ر.س</p>
                <p className="text-xs text-muted-foreground">محصور {(totalIssued - totalRemaining).toFixed(0)} ر.س</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>بطاقات الهدايا</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-8 text-muted-foreground">جارٍ التحميل...</p>
                ) : cards.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">لا توجد بطاقات هدايا بعد</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الكود</TableHead>
                          <TableHead>المبلغ الأصلي</TableHead>
                          <TableHead>الرصيد المتبقي</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>المستلم</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cards.map(card => (
                          <TableRow key={card.id} data-testid={`row-gift-card-${card.id}`} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCard(card)}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{card.code}</code>
                                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => { e.stopPropagation(); copyCode(card.code); }} data-testid={`button-copy-${card.id}`}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{card.initialBalance} ر.س</TableCell>
                            <TableCell>
                              <span className={card.currentBalance === 0 ? "text-red-500" : "text-green-600 font-medium"}>
                                {card.currentBalance} ر.س
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={card.isActive ? "default" : "secondary"}>
                                {card.isActive ? "نشطة" : "معطلة"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{card.assignedToPhone || "—"}</TableCell>
                            <TableCell>
                              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toggleMutation.mutate(card.id)} data-testid={`button-toggle-${card.id}`}>
                                  {card.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500" onClick={() => deleteMutation.mutate(card.id)} data-testid={`button-delete-${card.id}`}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">التحقق من بطاقة</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="أدخل كود البطاقة" value={validateCode} onChange={e => setValidateCode(e.target.value.toUpperCase())} data-testid="input-validate-code" className="font-mono text-sm" />
                  <Button onClick={handleValidate} size="sm" data-testid="button-validate">تحقق</Button>
                </div>
                {validationResult && (
                  <div className={`p-3 rounded-lg text-sm ${validationResult.valid ? "bg-green-50 dark:bg-green-950 border border-green-200" : "bg-red-50 dark:bg-red-950 border border-red-200"}`}>
                    {validationResult.valid ? (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">بطاقة صالحة</p>
                          <p className="text-green-700 dark:text-green-300">الرصيد: {validationResult.currentBalance} ر.س</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        <p className="text-red-700 dark:text-red-300">{validationResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedCard && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    سجل المعاملات
                    <Button variant="ghost" size="icon" className="w-6 h-6 mr-auto" onClick={() => setSelectedCard(null)}>✕</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded mb-3 text-center">{selectedCard.code}</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCard.transactions.map((t, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-muted/50">
                        <span className="text-muted-foreground">{t.description}</span>
                        <span className={t.type === 'credit' ? "text-green-600" : "text-red-500"}>
                          {t.type === 'credit' ? '+' : '-'}{t.amount} ر.س
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="w-5 h-5" /> إصدار بطاقة هدية جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>قيمة البطاقة (ر.س) *</Label>
              <Input type="number" min="1" value={form.initialBalance} onChange={e => setForm(f => ({ ...f, initialBalance: e.target.value }))} placeholder="مثال: 100" data-testid="input-gift-amount" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>اسم المشتري</Label>
                <Input value={form.purchasedByName} onChange={e => setForm(f => ({ ...f, purchasedByName: e.target.value }))} placeholder="اسم المشتري" data-testid="input-gift-buyer" />
              </div>
              <div>
                <Label>رقم هاتف المستلم</Label>
                <Input value={form.assignedToPhone} onChange={e => setForm(f => ({ ...f, assignedToPhone: e.target.value }))} placeholder="05xxxxxxxx" data-testid="input-gift-phone" />
              </div>
            </div>
            <div>
              <Label>تاريخ الانتهاء (اختياري)</Label>
              <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} data-testid="input-gift-expiry" />
            </div>
            <div>
              <Label>ملاحظة</Label>
              <Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="مناسبة أو ملاحظة..." data-testid="input-gift-note" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.initialBalance} data-testid="button-create-gift-card">
                {createMutation.isPending ? "جارٍ الإنشاء..." : "إصدار البطاقة"}
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
