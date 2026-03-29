import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  FileText,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Send,
  RefreshCw,
  Download,
  Filter,
  Building2,
  User,
  Calendar,
  TrendingUp,
  BarChart3,
  Receipt,
  Loader2,
  Percent,
  TrendingDown,
  AlertCircle,
  Hash
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Supplier {
  _id: string;
  id?: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  taxNumber?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: number;
  createdAt: string;
}

interface PurchaseInvoice {
  _id: string;
  id?: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName?: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

interface COGSItem {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  cogs: number;
  profit: number;
  margin: number;
  category: string;
  ingredientCount: number;
}

interface COGSSummary {
  totalItems: number;
  avgMargin: number;
  highMargin: number;
  lowMargin: number;
  itemsWithCOGS: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-gray-500" },
  pending: { label: "قيد الانتظار", color: "bg-yellow-500" },
  approved: { label: "معتمد", color: "bg-blue-500" },
  received: { label: "تم الاستلام", color: "bg-emerald-600" },
  cancelled: { label: "ملغي", color: "bg-red-500" },
  unpaid: { label: "غير مدفوع", color: "bg-red-500" },
  partial: { label: "مدفوع جزئياً", color: "bg-yellow-500" },
  paid: { label: "مدفوع", color: "bg-green-500" },
  active: { label: "نشط", color: "bg-green-500" },
  inactive: { label: "غير نشط", color: "bg-gray-500" },
};

function COGSReport() {
  const { data, isLoading } = useQuery<{ items: COGSItem[]; summary: COGSSummary }>({
    queryKey: ["/api/analytics/cogs"],
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!data) return null;

  const { items = [], summary } = data;

  const getMarginColor = (margin: number) => {
    if (margin >= 60) return "text-green-600";
    if (margin >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getMarginBg = (margin: number) => {
    if (margin >= 60) return "bg-green-50 text-green-700 border-green-200";
    if (margin >= 40) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">متوسط هامش الربح</p>
            <p className={`text-3xl font-bold ${getMarginColor(summary?.avgMargin || 0)}`}>{summary?.avgMargin || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">هامش مرتفع (≥60%)</p>
            <p className="text-3xl font-bold text-green-600">{summary?.highMargin || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">هامش منخفض (&lt;30%)</p>
            <p className="text-3xl font-bold text-red-600">{summary?.lowMargin || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">منتجات محددة التكلفة</p>
            <p className="text-3xl font-bold text-blue-600">{summary?.itemsWithCOGS || 0} / {summary?.totalItems || 0}</p>
          </CardContent>
        </Card>
      </div>

      {summary && summary.itemsWithCOGS < summary.totalItems && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>{summary.totalItems - summary.itemsWithCOGS}</strong> منتج لم يتم تحديد تكلفة التصنيع لها بعد.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            هوامش الربح لجميع المنتجات
          </CardTitle>
          <CardDescription>مرتبة من الأعلى هامشاً إلى الأقل</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-center">سعر البيع</TableHead>
                <TableHead className="text-center">تكلفة التصنيع</TableHead>
                <TableHead className="text-center">صافي الربح</TableHead>
                <TableHead className="text-center">هامش الربح</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.nameAr}</p>
                    {item.nameEn && <p className="text-xs text-muted-foreground">{item.nameEn}</p>}
                  </TableCell>
                  <TableCell className="text-center font-mono">{item.price.toFixed(2)} ر.س</TableCell>
                  <TableCell className="text-center font-mono">
                    {item.cogs > 0 ? <span>{item.cogs.toFixed(2)} ر.س</span> : <span className="text-muted-foreground text-xs">غير محدد</span>}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {item.cogs > 0 ? (
                      <span className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>{item.profit.toFixed(2)} ر.س</span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.cogs > 0 ? (
                      <Badge variant="outline" className={`${getMarginBg(item.margin)} font-bold`}>{item.margin}%</Badge>
                    ) : <Badge variant="outline" className="text-muted-foreground">—</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SupplierManagementPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suppliers");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isViewSupplierOpen, setIsViewSupplierOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [newSupplier, setNewSupplier] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    taxNumber: '',
    paymentTerms: 'cash',
    notes: '',
  });

  const { data: suppliers = [], isLoading: suppliersLoading, refetch: refetchSuppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/inventory/suppliers'],
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<PurchaseInvoice[]>({
    queryKey: ['/api/inventory/purchases'],
  });

  const createSupplierMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/inventory/suppliers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/suppliers'] });
      setIsAddSupplierOpen(false);
      setNewSupplier({ code: '', nameAr: '', nameEn: '', contactPerson: '', phone: '', email: '', city: '', address: '', taxNumber: '', paymentTerms: 'cash', notes: '' });
      toast({ title: '✅ تم إضافة المورد بنجاح' });
    },
    onError: (e: any) => {
      toast({ title: 'خطأ', description: e.message || 'فشل في إضافة المورد', variant: 'destructive' });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PUT', `/api/inventory/suppliers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/suppliers'] });
      setIsEditSupplierOpen(false);
      setSelectedSupplier(null);
      toast({ title: '✅ تم تحديث المورد بنجاح' });
    },
    onError: (e: any) => {
      toast({ title: 'خطأ', description: e.message || 'فشل في تحديث المورد', variant: 'destructive' });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/inventory/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/suppliers'] });
      toast({ title: '✅ تم حذف المورد بنجاح' });
    },
    onError: (e: any) => {
      toast({ title: 'خطأ', description: e.message || 'فشل في حذف المورد', variant: 'destructive' });
    },
  });

  const supplierId = (s: Supplier) => s._id || s.id || '';
  const activeSuppliers = suppliers.filter(s => s.isActive === 1).length;
  const totalPurchases = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const pendingPurchases = purchases.filter(p => p.paymentStatus === 'unpaid').reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const filteredSuppliers = suppliers.filter(s =>
    s.nameAr.includes(searchQuery) || (s.contactPerson || '').includes(searchQuery) || (s.phone || '').includes(searchQuery)
  );

  const getSupplierName = (supplierId: string) => {
    const s = suppliers.find(s => supplierId === s._id || supplierId === s.id);
    return s?.nameAr || supplierId;
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewSupplierOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier({ ...supplier });
    setIsEditSupplierOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSupplier) return;
    updateSupplierMutation.mutate({
      id: supplierId(selectedSupplier),
      data: {
        nameAr: selectedSupplier.nameAr,
        nameEn: selectedSupplier.nameEn,
        contactPerson: selectedSupplier.contactPerson,
        phone: selectedSupplier.phone,
        email: selectedSupplier.email,
        city: selectedSupplier.city,
        address: selectedSupplier.address,
        taxNumber: selectedSupplier.taxNumber,
        paymentTerms: selectedSupplier.paymentTerms,
        notes: selectedSupplier.notes,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-primary/5 to-yellow-50 dark:from-background dark:via-primary/5 dark:to-background" dir="rtl">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button variant="ghost" onClick={() => setLocation("/manager/dashboard")} className="text-accent dark:text-accent">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-accent dark:text-accent flex items-center gap-2">
            <Truck className="w-8 h-8" />
            إدارة الموردين
          </h1>
          <Button onClick={() => setIsAddSupplierOpen(true)} className="bg-primary hover:bg-primary/90" data-testid="button-add-supplier">
            <Plus className="w-4 h-4 ml-2" />
            مورد جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">الموردين النشطين</p>
                  <p className="text-3xl font-bold mt-1">{suppliersLoading ? '...' : activeSuppliers}</p>
                  <p className="text-blue-200 text-xs mt-1">من {suppliers.length} إجمالي</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">إجمالي المشتريات</p>
                  <p className="text-3xl font-bold mt-1">{(totalPurchases / 1000).toFixed(1)}K</p>
                  <p className="text-green-200 text-xs mt-1">ريال سعودي</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">فواتير غير مدفوعة</p>
                  <p className="text-3xl font-bold mt-1">{pendingPurchases.toLocaleString()}</p>
                  <p className="text-amber-200 text-xs mt-1">ريال سعودي</p>
                </div>
                <Receipt className="w-12 h-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">فواتير الشراء</p>
                  <p className="text-3xl font-bold mt-1">{purchasesLoading ? '...' : purchases.length}</p>
                  <p className="text-purple-200 text-xs mt-1">إجمالي الفواتير</p>
                </div>
                <FileText className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-primary dark:bg-primary/30">
            <TabsTrigger value="suppliers" className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              الموردين
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              فواتير الشراء
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              التحليلات
            </TabsTrigger>
            <TabsTrigger value="cogs" className="flex items-center gap-1">
              <Percent className="w-4 h-4" />
              تقرير التكاليف
            </TabsTrigger>
          </TabsList>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو جهة الاتصال أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-suppliers"
                />
              </div>
              <Button variant="outline" onClick={() => refetchSuppliers()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {suppliersLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا يوجد موردون</h3>
                  <p className="text-muted-foreground mb-4">ابدأ بإضافة أول مورد لك</p>
                  <Button onClick={() => setIsAddSupplierOpen(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة مورد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers.map((supplier) => (
                  <Card key={supplierId(supplier)} className="hover:shadow-lg transition-shadow" data-testid={`card-supplier-${supplierId(supplier)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{supplier.nameAr}</h3>
                          {supplier.nameEn && <p className="text-xs text-muted-foreground">{supplier.nameEn}</p>}
                          <p className="text-xs text-muted-foreground font-mono mt-1">{supplier.code}</p>
                        </div>
                        <Badge className={`${supplier.isActive === 1 ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                          {supplier.isActive === 1 ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        {supplier.contactPerson && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{supplier.contactPerson}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span dir="ltr">{supplier.phone}</span>
                        </div>
                        {supplier.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{supplier.city}</span>
                          </div>
                        )}
                        {supplier.paymentTerms && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{supplier.paymentTerms}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end mt-4 pt-4 border-t gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewSupplier(supplier)} data-testid={`button-view-supplier-${supplierId(supplier)}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSupplier(supplier)} data-testid={`button-edit-supplier-${supplierId(supplier)}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف المورد "${supplier.nameAr}"؟`)) {
                              deleteSupplierMutation.mutate(supplierId(supplier));
                            }
                          }}
                          data-testid={`button-delete-supplier-${supplierId(supplier)}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Purchase Invoices Tab */}
          <TabsContent value="purchases" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">فواتير الشراء</h2>
              <Button onClick={() => setLocation('/manager/purchase-orders')} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 ml-2" />
                طلب شراء جديد
              </Button>
            </div>

            {purchasesLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم الفاتورة</TableHead>
                        <TableHead className="text-right">المورد</TableHead>
                        <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                        <TableHead className="text-right">تاريخ الفاتورة</TableHead>
                        <TableHead className="text-right">حالة الطلب</TableHead>
                        <TableHead className="text-right">حالة الدفع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            لا توجد فواتير شراء
                          </TableCell>
                        </TableRow>
                      ) : purchases.map((purchase) => (
                        <TableRow key={purchase._id || purchase.id}>
                          <TableCell className="font-mono font-medium">{purchase.invoiceNumber}</TableCell>
                          <TableCell>{purchase.supplierName || getSupplierName(purchase.supplierId)}</TableCell>
                          <TableCell className="font-medium">{(purchase.totalAmount || 0).toLocaleString()} ر.س</TableCell>
                          <TableCell>
                            {purchase.invoiceDate && format(new Date(purchase.invoiceDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${(statusConfig[purchase.status] || { color: 'bg-gray-500' }).color} text-white`}>
                              {(statusConfig[purchase.status] || { label: purchase.status }).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${(statusConfig[purchase.paymentStatus] || { color: 'bg-gray-500' }).color} text-white`}>
                              {(statusConfig[purchase.paymentStatus] || { label: purchase.paymentStatus }).label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    قائمة الموردين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {suppliers.slice(0, 5).map((supplier, idx) => (
                      <div key={supplierId(supplier)} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                          idx === 0 ? 'bg-yellow-500' :
                          idx === 1 ? 'bg-gray-400' :
                          'bg-amber-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{supplier.nameAr}</p>
                          <p className="text-xs text-muted-foreground">{supplier.city || '—'}</p>
                        </div>
                        <Badge variant={supplier.isActive === 1 ? 'default' : 'secondary'}>
                          {supplier.isActive === 1 ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                    ))}
                    {suppliers.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">لا يوجد موردون</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    ملخص الفواتير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['draft', 'pending', 'approved', 'received', 'cancelled'].map(status => {
                      const count = purchases.filter(p => p.status === status).length;
                      const total = purchases.filter(p => p.status === status).reduce((s, p) => s + (p.totalAmount || 0), 0);
                      return (
                        <div key={status} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge className={`${(statusConfig[status] || { color: 'bg-gray-500' }).color} text-white text-xs`}>
                              {(statusConfig[status] || { label: status }).label}
                            </Badge>
                            <span className="text-sm">{count} فاتورة</span>
                          </div>
                          <span className="font-bold">{total.toLocaleString()} ر.س</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>تقييم أداء الموردين</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المورد</TableHead>
                      <TableHead className="text-right">كود المورد</TableHead>
                      <TableHead className="text-right">المدينة</TableHead>
                      <TableHead className="text-right">شروط الدفع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplierId(supplier)}>
                        <TableCell className="font-medium">{supplier.nameAr}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{supplier.code}</TableCell>
                        <TableCell>{supplier.city || '—'}</TableCell>
                        <TableCell>{supplier.paymentTerms || '—'}</TableCell>
                        <TableCell>
                          <Badge className={`${supplier.isActive === 1 ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                            {supplier.isActive === 1 ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COGS Tab */}
          <TabsContent value="cogs" className="space-y-6">
            <COGSReport />
          </TabsContent>
        </Tabs>

        {/* Add Supplier Dialog */}
        <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                إضافة مورد جديد
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>كود المورد <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="SUP-001"
                    value={newSupplier.code}
                    onChange={e => setNewSupplier(p => ({ ...p, code: e.target.value }))}
                    data-testid="input-supplier-code"
                  />
                </div>
                <div>
                  <Label>اسم المورد (عربي) <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="شركة ..."
                    value={newSupplier.nameAr}
                    onChange={e => setNewSupplier(p => ({ ...p, nameAr: e.target.value }))}
                    data-testid="input-supplier-name-ar"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الاسم (إنجليزي)</Label>
                  <Input
                    placeholder="Company name"
                    value={newSupplier.nameEn}
                    onChange={e => setNewSupplier(p => ({ ...p, nameEn: e.target.value }))}
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>جهة الاتصال</Label>
                  <Input
                    placeholder="الاسم"
                    value={newSupplier.contactPerson}
                    onChange={e => setNewSupplier(p => ({ ...p, contactPerson: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>رقم الهاتف <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    value={newSupplier.phone}
                    onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))}
                    data-testid="input-supplier-phone"
                  />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    dir="ltr"
                    value={newSupplier.email}
                    onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المدينة</Label>
                  <Input
                    placeholder="ينبع"
                    value={newSupplier.city}
                    onChange={e => setNewSupplier(p => ({ ...p, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>شروط الدفع</Label>
                  <Select value={newSupplier.paymentTerms} onValueChange={v => setNewSupplier(p => ({ ...p, paymentTerms: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نقدي">نقدي</SelectItem>
                      <SelectItem value="15 يوم">15 يوم</SelectItem>
                      <SelectItem value="30 يوم">30 يوم</SelectItem>
                      <SelectItem value="60 يوم">60 يوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>الرقم الضريبي</Label>
                <Input
                  placeholder="3XXXXXXXXXX"
                  dir="ltr"
                  value={newSupplier.taxNumber}
                  onChange={e => setNewSupplier(p => ({ ...p, taxNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label>العنوان</Label>
                <Input
                  placeholder="حي، شارع..."
                  value={newSupplier.address}
                  onChange={e => setNewSupplier(p => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  placeholder="ملاحظات إضافية..."
                  value={newSupplier.notes}
                  onChange={e => setNewSupplier(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddSupplierOpen(false)}>إلغاء</Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                disabled={!newSupplier.code || !newSupplier.nameAr || !newSupplier.phone || createSupplierMutation.isPending}
                onClick={() => createSupplierMutation.mutate(newSupplier)}
                data-testid="button-save-supplier"
              >
                {createSupplierMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                حفظ المورد
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Supplier Dialog */}
        <Dialog open={isEditSupplierOpen} onOpenChange={setIsEditSupplierOpen}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                تعديل المورد
              </DialogTitle>
            </DialogHeader>
            {selectedSupplier && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم المورد (عربي) <span className="text-red-500">*</span></Label>
                    <Input
                      value={selectedSupplier.nameAr}
                      onChange={e => setSelectedSupplier(p => p ? { ...p, nameAr: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label>الاسم (إنجليزي)</Label>
                    <Input
                      value={selectedSupplier.nameEn || ''}
                      onChange={e => setSelectedSupplier(p => p ? { ...p, nameEn: e.target.value } : null)}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>جهة الاتصال</Label>
                    <Input
                      value={selectedSupplier.contactPerson || ''}
                      onChange={e => setSelectedSupplier(p => p ? { ...p, contactPerson: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={selectedSupplier.phone}
                      onChange={e => setSelectedSupplier(p => p ? { ...p, phone: e.target.value } : null)}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المدينة</Label>
                    <Input
                      value={selectedSupplier.city || ''}
                      onChange={e => setSelectedSupplier(p => p ? { ...p, city: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label>شروط الدفع</Label>
                    <Select value={selectedSupplier.paymentTerms || 'نقدي'} onValueChange={v => setSelectedSupplier(p => p ? { ...p, paymentTerms: v } : null)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نقدي">نقدي</SelectItem>
                        <SelectItem value="15 يوم">15 يوم</SelectItem>
                        <SelectItem value="30 يوم">30 يوم</SelectItem>
                        <SelectItem value="60 يوم">60 يوم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={selectedSupplier.notes || ''}
                    onChange={e => setSelectedSupplier(p => p ? { ...p, notes: e.target.value } : null)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditSupplierOpen(false)}>إلغاء</Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                disabled={updateSupplierMutation.isPending}
                onClick={handleSaveEdit}
              >
                {updateSupplierMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Supplier Dialog */}
        <Dialog open={isViewSupplierOpen} onOpenChange={setIsViewSupplierOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                تفاصيل المورد
              </DialogTitle>
            </DialogHeader>
            {selectedSupplier && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedSupplier.nameAr}</h2>
                    {selectedSupplier.nameEn && <p className="text-muted-foreground">{selectedSupplier.nameEn}</p>}
                    <p className="text-xs font-mono text-muted-foreground mt-1">كود: {selectedSupplier.code}</p>
                  </div>
                  <Badge className={`${selectedSupplier.isActive === 1 ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                    {selectedSupplier.isActive === 1 ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedSupplier.contactPerson && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">جهة الاتصال</p>
                      <p className="font-medium">{selectedSupplier.contactPerson}</p>
                    </div>
                  )}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="font-medium" dir="ltr">{selectedSupplier.phone}</p>
                  </div>
                  {selectedSupplier.email && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                      <p className="font-medium" dir="ltr">{selectedSupplier.email}</p>
                    </div>
                  )}
                  {selectedSupplier.city && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">المدينة</p>
                      <p className="font-medium">{selectedSupplier.city}</p>
                    </div>
                  )}
                  {selectedSupplier.paymentTerms && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">شروط الدفع</p>
                      <p className="font-medium">{selectedSupplier.paymentTerms}</p>
                    </div>
                  )}
                  {selectedSupplier.taxNumber && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">الرقم الضريبي</p>
                      <p className="font-medium" dir="ltr">{selectedSupplier.taxNumber}</p>
                    </div>
                  )}
                </div>

                {selectedSupplier.notes && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">ملاحظات</p>
                    <p className="font-medium">{selectedSupplier.notes}</p>
                  </div>
                )}

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">تاريخ الإضافة</p>
                  <p className="font-medium">{selectedSupplier.createdAt ? format(new Date(selectedSupplier.createdAt), "dd MMMM yyyy", { locale: ar }) : '—'}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewSupplierOpen(false)}>إغلاق</Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setIsViewSupplierOpen(false);
                  if (selectedSupplier) handleEditSupplier(selectedSupplier);
                }}
              >
                <Edit className="w-4 h-4 ml-2" />
                تعديل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
