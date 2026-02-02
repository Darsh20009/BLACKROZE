import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  ToggleLeft,
  Eye,
  EyeOff,
  Shield,
  Database,
  Server,
  Activity,
  Users,
  FileText,
  Zap,
  RefreshCw,
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Package,
  CreditCard,
  Coffee,
  ChefHat,
  BarChart,
  Bell,
  Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureControl {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  isEnabled: boolean;
  icon: string;
  description: string;
  route?: string;
}

interface PageControl {
  id: string;
  nameAr: string;
  nameEn: string;
  route: string;
  isVisible: boolean;
  requiredRole: string;
  category: string;
}

export default function AdminControlPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [features, setFeatures] = useState<FeatureControl[]>([
    { id: "loyalty", nameAr: "نظام الولاء", nameEn: "Loyalty System", category: "customer", isEnabled: true, icon: "Gift", description: "نظام النقاط والختم", route: "/manager/loyalty" },
    { id: "offers", nameAr: "صفحة عروضي", nameEn: "My Offers", category: "customer", isEnabled: true, icon: "Gift", description: "عروض العملاء الخاصة", route: "/my-offers" },
    { id: "pos", nameAr: "نظام نقاط البيع", nameEn: "POS System", category: "operations", isEnabled: true, icon: "CreditCard", description: "نقاط البيع والكاشير", route: "/employee/pos" },
    { id: "kitchen", nameAr: "عرض المطبخ", nameEn: "Kitchen Display", category: "operations", isEnabled: true, icon: "ChefHat", description: "شاشة المطبخ", route: "/employee/kitchen" },
    { id: "inventory", nameAr: "إدارة المخزون", nameEn: "Inventory Management", category: "operations", isEnabled: true, icon: "Package", description: "نظام المخزون الذكي", route: "/manager/inventory" },
    { id: "accounting", nameAr: "المحاسبة", nameEn: "Accounting", category: "finance", isEnabled: true, icon: "BarChart", description: "التقارير المحاسبية", route: "/manager/accounting" },
    { id: "delivery", nameAr: "خدمة التوصيل", nameEn: "Delivery Service", category: "operations", isEnabled: true, icon: "TrendingUp", description: "إدارة التوصيل", route: "/manager/delivery-services" },
    { id: "reservations", nameAr: "الحجوزات", nameEn: "Reservations", category: "customer", isEnabled: true, icon: "FileText", description: "حجوزات الطاولات", route: "/my-reservations" },
    { id: "notifications", nameAr: "الإشعارات", nameEn: "Notifications", category: "system", isEnabled: true, icon: "Bell", description: "نظام الإشعارات", route: "/notifications" },
    { id: "reviews", nameAr: "التقييمات", nameEn: "Reviews", category: "customer", isEnabled: true, icon: "Coffee", description: "تقييمات المنتجات" },
  ]);

  const [pages, setPages] = useState<PageControl[]>([
    { id: "my-offers", nameAr: "عروضي", nameEn: "My Offers", route: "/my-offers", isVisible: true, requiredRole: "customer", category: "customer" },
    { id: "orders-enhanced", nameAr: "عرض الطلبات المحسّن", nameEn: "Enhanced Orders Display", route: "/employee/orders-display-enhanced", isVisible: true, requiredRole: "employee", category: "operations" },
    { id: "kitchen-categories", nameAr: "إدارة المطابخ", nameEn: "Kitchen Management", route: "/manager/kitchen-categories", isVisible: true, requiredRole: "manager", category: "operations" },
    { id: "table-barcodes", nameAr: "باركود الطاولات", nameEn: "Table Barcodes", route: "/manager/tables/barcodes", isVisible: true, requiredRole: "manager", category: "operations" },
    { id: "pos-system", nameAr: "نقاط البيع", nameEn: "POS System", route: "/employee/pos", isVisible: true, requiredRole: "employee", category: "operations" },
    { id: "kitchen-display", nameAr: "شاشة المطبخ", nameEn: "Kitchen Display", route: "/employee/kitchen", isVisible: true, requiredRole: "employee", category: "operations" },
    { id: "inventory", nameAr: "المخزون", nameEn: "Inventory", route: "/manager/inventory", isVisible: true, requiredRole: "manager", category: "operations" },
    { id: "accounting", nameAr: "المحاسبة", nameEn: "Accounting", route: "/manager/accounting", isVisible: true, requiredRole: "manager", category: "finance" },
  ]);

  const [systemStatus, setSystemStatus] = useState({
    database: true,
    backend: true,
    frontend: true,
    websocket: true,
  });

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFeature = (featureId: string) => {
    setFeatures(features.map(f => 
      f.id === featureId ? { ...f, isEnabled: !f.isEnabled } : f
    ));
    toast({
      title: "تم التحديث",
      description: "تم تحديث حالة الميزة بنجاح",
      className: "bg-green-600 text-white",
    });
  };

  const togglePage = (pageId: string) => {
    setPages(pages.map(p => 
      p.id === pageId ? { ...p, isVisible: !p.isVisible } : p
    ));
    toast({
      title: "تم التحديث",
      description: "تم تحديث حالة الصفحة بنجاح",
      className: "bg-green-600 text-white",
    });
  };

  const saveAllSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage or API
      localStorage.setItem('adminFeatureControls', JSON.stringify(features));
      localStorage.setItem('adminPageControls', JSON.stringify(pages));
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ جميع الإعدادات",
        className: "bg-green-600 text-white",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setFeatures(features.map(f => ({ ...f, isEnabled: true })));
    setPages(pages.map(p => ({ ...p, isVisible: true })));
    localStorage.removeItem('adminFeatureControls');
    localStorage.removeItem('adminPageControls');
    setShowResetDialog(false);
    toast({
      title: "تمت الإعادة",
      description: "تم إعادة جميع الإعدادات للوضع الافتراضي",
      className: "bg-blue-600 text-white",
    });
  };

  useEffect(() => {
    // Load saved settings
    const savedFeatures = localStorage.getItem('adminFeatureControls');
    const savedPages = localStorage.getItem('adminPageControls');
    
    if (savedFeatures) {
      try {
        setFeatures(JSON.parse(savedFeatures));
      } catch (e) {}
    }
    
    if (savedPages) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (e) {}
    }
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "customer": return <Users className="w-4 h-4" />;
      case "operations": return <Activity className="w-4 h-4" />;
      case "finance": return <CreditCard className="w-4 h-4" />;
      case "system": return <Server className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const categoryColors = {
    customer: "bg-blue-100 text-blue-800 border-blue-300",
    operations: "bg-orange-100 text-orange-800 border-orange-300",
    finance: "bg-green-100 text-green-800 border-green-300",
    system: "bg-purple-100 text-purple-800 border-purple-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-purple-900 text-white p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/admin/dashboard")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <Shield className="w-10 h-10" />
                  لوحة التحكم الرئيسية
                </h1>
                <p className="text-blue-200 mt-2">التحكم الكامل في جميع ميزات وصفحات النظام</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={saveAllSettings}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ الكل
              </Button>
              <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                    <RefreshCw className="w-4 h-4 ml-2" />
                    إعادة تعيين
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم إعادة جميع الإعدادات إلى الوضع الافتراضي. هذا الإجراء لا يمكن التراجع عنه.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={resetToDefaults} className="bg-red-600">
                      نعم، إعادة التعيين
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-white" />
                  <div>
                    <p className="text-white/70 text-sm">قاعدة البيانات</p>
                    <p className="text-white font-bold">MongoDB</p>
                  </div>
                </div>
                {systemStatus.database ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-6 h-6 text-white" />
                  <div>
                    <p className="text-white/70 text-sm">الخادم الخلفي</p>
                    <p className="text-white font-bold">Express</p>
                  </div>
                </div>
                {systemStatus.backend ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-white" />
                  <div>
                    <p className="text-white/70 text-sm">الواجهة الأمامية</p>
                    <p className="text-white font-bold">React + Vite</p>
                  </div>
                </div>
                {systemStatus.frontend ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-white" />
                  <div>
                    <p className="text-white/70 text-sm">WebSocket</p>
                    <p className="text-white font-bold">مباشر</p>
                  </div>
                </div>
                {systemStatus.websocket ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg">
            <TabsTrigger value="features" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <ToggleLeft className="w-4 h-4 ml-2" />
              الميزات
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 ml-2" />
              الصفحات
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 ml-2" />
              متقدم
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  التحكم في الميزات
                </CardTitle>
                <CardDescription>تفعيل أو إيقاف الميزات في النظام</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature) => (
                    <Card key={feature.id} className="border-2 hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {feature.icon === "Gift" && <Gift className="w-5 h-5 text-blue-600" />}
                              {feature.icon === "CreditCard" && <CreditCard className="w-5 h-5 text-blue-600" />}
                              {feature.icon === "ChefHat" && <ChefHat className="w-5 h-5 text-blue-600" />}
                              {feature.icon === "Package" && <Package className="w-5 h-5 text-blue-600" />}
                              {feature.icon === "BarChart" && <BarChart className="w-5 h-5 text-blue-600" />}
                              {feature.icon === "TrendingUp" && <TrendingUp className="w-5 h-5 text-blue-600" />}
                              {feature.icon === "FileText" && <FileText className="w-5 h-5 text-blue-600" />}
                              {feature.icon === "Bell" && <Bell className="w-5 h-5 text-blue-600" />}
                              {feature.icon === "Coffee" && <Coffee className="w-5 h-5 text-blue-600" />}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{feature.nameAr}</h3>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={feature.isEnabled}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={categoryColors[feature.category as keyof typeof categoryColors]} variant="outline">
                            {getCategoryIcon(feature.category)}
                            <span className="mr-1">
                              {feature.category === "customer" && "عملاء"}
                              {feature.category === "operations" && "عمليات"}
                              {feature.category === "finance" && "مالية"}
                              {feature.category === "system" && "نظام"}
                            </span>
                          </Badge>
                          <Badge variant={feature.isEnabled ? "default" : "secondary"}>
                            {feature.isEnabled ? "مفعّل" : "معطّل"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  التحكم في الصفحات
                </CardTitle>
                <CardDescription>إظهار أو إخفاء صفحات النظام</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {pages.map((page) => (
                    <Card key={page.id} className="border hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-2 rounded-lg ${page.isVisible ? 'bg-green-100' : 'bg-gray-100'}`}>
                              {page.isVisible ? (
                                <Eye className={`w-5 h-5 ${page.isVisible ? 'text-green-600' : 'text-gray-400'}`} />
                              ) : (
                                <EyeOff className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold">{page.nameAr}</h3>
                              <p className="text-sm text-gray-600">{page.route}</p>
                            </div>
                            <Badge className={categoryColors[page.category as keyof typeof categoryColors]} variant="outline">
                              {page.category === "customer" && "عملاء"}
                              {page.category === "operations" && "عمليات"}
                              {page.category === "finance" && "مالية"}
                            </Badge>
                            <Badge variant="outline" className="bg-slate-100">
                              {page.requiredRole === "customer" && "عميل"}
                              {page.requiredRole === "employee" && "موظف"}
                              {page.requiredRole === "manager" && "مدير"}
                              {page.requiredRole === "admin" && "أدمن"}
                            </Badge>
                          </div>
                          <Switch
                            checked={page.isVisible}
                            onCheckedChange={() => togglePage(page.id)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-600" />
                    إدارة قاعدة البيانات
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button variant="outline" className="w-full">
                    <Database className="w-4 h-4 ml-2" />
                    نسخ احتياطي للبيانات
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 ml-2" />
                    مسح الكاش
                  </Button>
                  <Button variant="destructive" className="w-full">
                    <AlertCircle className="w-4 h-4 ml-2" />
                    إعادة بناء الفهارس
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    مراقبة النظام
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الطلبات النشطة</span>
                      <span className="font-bold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">المستخدمون المتصلون</span>
                      <span className="font-bold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">استخدام الذاكرة</span>
                      <span className="font-bold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">وقت التشغيل</span>
                      <span className="font-bold">2 ساعة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
