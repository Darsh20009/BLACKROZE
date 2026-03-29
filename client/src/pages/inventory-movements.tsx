import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  Package,
  Loader2,
  RefreshCw,
  Trash2,
  ShoppingCart,
  Activity,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLocation } from "wouter";

interface StockMovement {
  id: string;
  branchId: string;
  rawItemId: string;
  movementType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  rawItem?: { nameAr: string; code: string; unit: string };
  branch?: { nameAr: string };
}

interface Branch {
  id?: string;
  _id?: string;
  nameAr: string;
}

const movementTypeConfig: Record<string, { label: string; icon: typeof ArrowUp; color: string; direction: "in" | "out" | "neutral" }> = {
  purchase:     { label: "شراء",         icon: ArrowUp,         color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",   direction: "in"      },
  sale:         { label: "بيع",           icon: ShoppingCart,    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",       direction: "out"     },
  transfer_in:  { label: "تحويل وارد",   icon: ArrowUp,         color: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",       direction: "in"      },
  transfer_out: { label: "تحويل صادر",   icon: ArrowDown,       color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200", direction: "out"    },
  adjustment:   { label: "تعديل",         icon: ArrowRightLeft,  color: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200",       direction: "neutral" },
  waste:        { label: "هدر/تالف",      icon: Trash2,          color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",           direction: "out"     },
  return:       { label: "إرجاع",         icon: TrendingUp,      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200", direction: "in"    },
  stock_in:     { label: "إدخال مخزون",  icon: ArrowUp,         color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",   direction: "in"      },
  stock_out:    { label: "إخراج مخزون",  icon: ArrowDown,       color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200", direction: "out"   },
  initial:      { label: "رصيد أولي",    icon: Package,         color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200", direction: "in"    },
};

const unitLabels: Record<string, string> = {
  kg: "كجم", g: "جرام", liter: "لتر", ml: "مل", piece: "قطعة", box: "صندوق", bag: "كيس",
};

const PERIOD_OPTIONS = [
  { value: "week",  label: "آخر أسبوع" },
  { value: "month", label: "آخر شهر"   },
  { value: "all",   label: "الكل"       },
];

export default function InventoryMovementsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery]   = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter]     = useState<string>("all");
  const [period, setPeriod]             = useState<string>("month");

  const { data: movements = [], isLoading, dataUpdatedAt, refetch } = useQuery<StockMovement[]>({
    queryKey: ["/api/inventory/movements", branchFilter, period],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (branchFilter && branchFilter !== "all") params.set("branchId", branchFilter);
      if (period && period !== "all") params.set("period", period);
      params.set("limit", "300");
      const res = await fetch(`/api/inventory/movements?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch movements");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000, // Live refresh every 30 seconds
  });

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const getBranchName = (id: string) => {
    const b = branches.find((br: any) => br.id === id || br._id?.toString() === id);
    return b?.nameAr || id;
  };

  const filteredMovements = movements.filter((m) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      m.rawItem?.nameAr?.toLowerCase().includes(searchLower) ||
      m.rawItem?.code?.toLowerCase().includes(searchLower) ||
      m.notes?.toLowerCase().includes(searchLower);
    const matchesBranch = branchFilter === "all" || m.branchId === branchFilter;
    const matchesType   = typeFilter   === "all" || m.movementType === typeFilter;
    return matchesSearch && matchesBranch && matchesType;
  });

  const inMovements    = movements.filter(m => movementTypeConfig[m.movementType]?.direction === "in").length;
  const outMovements   = movements.filter(m => movementTypeConfig[m.movementType]?.direction === "out").length;
  const saleMovements  = movements.filter(m => m.movementType === "sale").length;
  const wasteMovements = movements.filter(m => m.movementType === "waste").length;

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/manager/inventory")} data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <History className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">حركات المخزون</h1>
            <p className="text-muted-foreground text-sm">
              سجل جميع حركات المخزون — آخر تحديث:{" "}
              {dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm:ss", { locale: ar }) : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
            <Activity className="w-3 h-3 animate-pulse" />
            تحديث تلقائي كل 30 ثانية
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث الآن
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحركات</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
            <p className="text-xs text-muted-foreground">حركة مخزون</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">واردة</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inMovements}</div>
            <p className="text-xs text-muted-foreground">شراء وتحويل وارد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبيعات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{saleMovements}</div>
            <p className="text-xs text-muted-foreground">خصم من الطلبات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">هدر/تالف</CardTitle>
            <Trash2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{wasteMovements}</div>
            <p className="text-xs text-muted-foreground">مواد تالفة</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالمادة أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search-movements"
              />
            </div>

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]" data-testid="select-period">
                <SelectValue placeholder="الفترة" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-branch-filter">
                <SelectValue placeholder="الفرع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                {branches.map((b: any) => (
                  <SelectItem key={b.id || b._id} value={b.id || b._id?.toString()}>
                    {b.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-type-filter">
                <SelectValue placeholder="نوع الحركة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(movementTypeConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-xs text-muted-foreground mr-auto">
              {filteredMovements.length} من {movements.length} حركة
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-3 text-muted-foreground">جاري تحميل الحركات...</span>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-right">التاريخ والوقت</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">المادة</TableHead>
                    <TableHead className="text-right">الفرع</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">قبل</TableHead>
                    <TableHead className="text-right">بعد</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base font-medium">لا توجد حركات مخزون</p>
                        <p className="text-sm mt-1">
                          {searchQuery || branchFilter !== "all" || typeFilter !== "all"
                            ? "جرب تغيير الفلاتر"
                            : "ستظهر الحركات هنا عند إضافة أو تعديل المخزون"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMovements.map((movement, idx) => {
                      const config = movementTypeConfig[movement.movementType] || movementTypeConfig.adjustment;
                      const MovementIcon = config.icon;
                      return (
                        <TableRow key={movement.id || idx} data-testid={`row-movement-${movement.id || idx}`} className="hover:bg-muted/30">
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                            {movement.createdAt
                              ? format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.color} flex items-center gap-1 w-fit text-xs`} variant="outline">
                              <MovementIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{movement.rawItem?.nameAr || movement.rawItemId}</div>
                            {movement.rawItem?.code && (
                              <div className="text-xs text-muted-foreground font-mono">{movement.rawItem.code}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {movement.branch?.nameAr || getBranchName(movement.branchId)}
                          </TableCell>
                          <TableCell>
                            <span className={`font-bold text-sm ${
                              config.direction === "in"  ? "text-green-600" :
                              config.direction === "out" ? "text-red-600"   : "text-muted-foreground"
                            }`}>
                              {config.direction === "in" ? "+" : config.direction === "out" ? "−" : ""}
                              {movement.quantity}
                            </span>
                            <span className="text-muted-foreground text-xs mr-1">
                              {unitLabels[movement.rawItem?.unit || ""] || movement.rawItem?.unit || ""}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{movement.previousQuantity ?? "—"}</TableCell>
                          <TableCell className="font-medium text-sm">{movement.newQuantity ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground text-xs max-w-[180px] truncate">
                            {movement.notes || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
