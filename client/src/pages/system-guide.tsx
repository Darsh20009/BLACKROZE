import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  ShoppingCart,
  Coffee,
  ChefHat,
  BarChart,
  Settings,
  Gift,
  CreditCard,
  Package,
  FileText,
  TrendingUp,
  Eye,
  CheckCircle,
  Star,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  QrCode,
  Smartphone,
  Printer,
  Database,
  Shield,
  Zap,
  Award,
  Bell,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Info,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Target,
  TrendingDown
} from "lucide-react";

export default function SystemGuide() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-purple-900 text-white p-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <BookOpen className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">دليل نظام BLACK ROSE الشامل</h1>
              <p className="text-blue-200 mt-2 text-lg">كل ما تحتاج معرفته عن النظام - من الألف إلى الياء</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                <p className="text-white font-bold text-xl">4</p>
                <p className="text-white/70 text-sm">أنواع مستخدمين</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-white font-bold text-xl">50+</p>
                <p className="text-white/70 text-sm">ميزة متقدمة</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
                <p className="text-white font-bold text-xl">100%</p>
                <p className="text-white/70 text-sm">متكامل</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                <p className="text-white font-bold text-xl">سهل</p>
                <p className="text-white/70 text-sm">الاستخدام</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 bg-white shadow-lg h-auto p-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3">
              <Eye className="w-4 h-4 ml-2" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-green-600 data-[state=active]:text-white py-3">
              <Users className="w-4 h-4 ml-2" />
              دليل العملاء
            </TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-3">
              <ChefHat className="w-4 h-4 ml-2" />
              دليل الموظفين
            </TabsTrigger>
            <TabsTrigger value="managers" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3">
              <BarChart className="w-4 h-4 ml-2" />
              دليل المديرين
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-red-600 data-[state=active]:text-white py-3">
              <Shield className="w-4 h-4 ml-2" />
              دليل الأدمن
            </TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Info className="w-6 h-6 text-blue-600" />
                  ما هو نظام BLACK ROSE؟
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-lg leading-relaxed">
                  نظام BLACK ROSE هو نظام إدارة مقاهي شامل ومتكامل يجمع بين إدارة الطلبات، المخزون، المحاسبة، 
                  وبرنامج الولاء في منصة واحدة سهلة الاستخدام. تم تصميمه خصيصاً لتسهيل عمل المقاهي وتحسين تجربة العملاء.
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Coffee className="w-8 h-8 text-blue-600 mb-2" />
                    <h3 className="font-bold text-lg mb-2">للعملاء</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• طلب سهل وسريع</li>
                      <li>• برنامج ولاء ونقاط</li>
                      <li>• عروض خاصة</li>
                      <li>• تتبع الطلبات</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <ChefHat className="w-8 h-8 text-orange-600 mb-2" />
                    <h3 className="font-bold text-lg mb-2">للموظفين</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• نظام POS متقدم</li>
                      <li>• شاشة مطبخ ذكية</li>
                      <li>• إدارة الطلبات</li>
                      <li>• سهولة الاستخدام</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <BarChart className="w-8 h-8 text-purple-600 mb-2" />
                    <h3 className="font-bold text-lg mb-2">للمديرين</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• تقارير شاملة</li>
                      <li>• إدارة المخزون</li>
                      <li>• المحاسبة الذكية</li>
                      <li>• مراقبة الأداء</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <Shield className="w-8 h-8 text-red-600 mb-2" />
                    <h3 className="font-bold text-lg mb-2">للأدمن</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• تحكم كامل</li>
                      <li>• إدارة الصلاحيات</li>
                      <li>• تفعيل/إيقاف الميزات</li>
                      <li>• مراقبة النظام</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-green-600" />
                  المزايا الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-bold mb-2">سريع وفعال</h3>
                    <p className="text-sm text-gray-600">معالجة الطلبات في ثوانٍ</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 rounded-xl">
                    <Database className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-bold mb-2">متكامل</h3>
                    <p className="text-sm text-gray-600">ربط تلقائي بين جميع الأقسام</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 rounded-xl">
                    <Award className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-bold mb-2">سهل الاستخدام</h3>
                    <p className="text-sm text-gray-600">واجهة بديهية للجميع</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* دليل العملاء */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="shadow-xl border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-600" />
                  دليل العملاء الشامل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="space-y-4">
                  
                  {/* التسجيل والدخول */}
                  <AccordionItem value="item-1" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Smartphone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">1. كيف أسجل وأدخل إلى النظام؟</h3>
                          <p className="text-sm text-gray-600">التسجيل وتسجيل الدخول</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-600">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          خطوات التسجيل:
                        </h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>اذهب إلى <code className="bg-blue-100 px-2 py-1 rounded">/customer/auth</code></li>
                          <li>أدخل رقم الجوال (يبدأ بـ 05)</li>
                          <li>أدخل اسمك الكامل</li>
                          <li>أدخل البريد الإلكتروني (اختياري)</li>
                          <li>اضغط "تسجيل" أو "دخول"</li>
                        </ol>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm"><strong>💡 نصيحة:</strong> احفظ رقم جوالك - هو هويتك في النظام!</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* الطلب */}
                  <AccordionItem value="item-2" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <ShoppingCart className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">2. كيف أطلب قهوة؟</h3>
                          <p className="text-sm text-gray-600">عملية الطلب خطوة بخطوة</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="space-y-3">
                        <div className="bg-orange-50 p-4 rounded-lg border-r-4 border-orange-600">
                          <h4 className="font-bold mb-2">📱 الطلب عبر الموقع:</h4>
                          <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>اذهب إلى <code className="bg-orange-100 px-2 py-1 rounded">/menu</code></li>
                            <li>اختر المنتج الذي تريده</li>
                            <li>اختر الحجم (صغير، وسط، كبير)</li>
                            <li>أضف إضافات إذا أردت (حليب، سكر، إلخ)</li>
                            <li>اضغط "أضف للسلة"</li>
                            <li>راجع سلتك واضغط "إتمام الطلب"</li>
                            <li>اختر طريقة الدفع</li>
                            <li>أكد الطلب</li>
                          </ol>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border-r-4 border-purple-600">
                          <h4 className="font-bold mb-2">🔲 الطلب عبر QR Code:</h4>
                          <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>امسح QR Code الموجود على الطاولة</li>
                            <li>سينقلك مباشرة لقائمة المنتجات</li>
                            <li>اطلب كما في الطريقة السابقة</li>
                            <li>رقم الطاولة سيُضاف تلقائياً</li>
                          </ol>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* برنامج الولاء */}
                  <AccordionItem value="item-3" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Gift className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">3. ما هو برنامج الولاء؟ وكيف أستفيد منه؟</h3>
                          <p className="text-sm text-gray-600">نظام النقاط والمكافآت</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-purple-50 p-4 rounded-lg border-r-4 border-purple-600">
                        <h4 className="font-bold mb-3 text-lg">🎁 كيف يعمل برنامج الولاء؟</h4>
                        
                        <div className="space-y-4">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2 flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-600" />
                              نظام النقاط:
                            </h5>
                            <ul className="text-sm space-y-1">
                              <li>✅ <strong>10 نقاط</strong> مع كل مشروب تشتريه</li>
                              <li>✅ النقاط تتراكم تلقائياً</li>
                              <li>✅ استبدل النقاط بعروض خاصة</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2 flex items-center gap-2">
                              <Coffee className="w-4 h-4 text-brown-600" />
                              نظام الأختام:
                            </h5>
                            <ul className="text-sm space-y-1">
                              <li>✅ <strong>1 ختم</strong> مع كل مشروب</li>
                              <li>✅ اجمع <strong>6 أختام</strong> = قهوة مجانية 🎉</li>
                              <li>✅ الأختام صالحة للأبد</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2 flex items-center gap-2">
                              <Award className="w-4 h-4 text-gold-600" />
                              المستويات (Tiers):
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                <span className="font-bold">🥉 برونزي</span>
                                <span className="text-xs">0 ريال • 0 نقطة</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                                <span className="font-bold">🥈 فضي</span>
                                <span className="text-xs">500 ريال • 100 نقطة</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                                <span className="font-bold">🥇 ذهبي</span>
                                <span className="text-xs">1500 ريال • 300 نقطة</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                                <span className="font-bold">💎 بلاتيني</span>
                                <span className="text-xs">3000 ريال • 600 نقطة</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-bold mb-2">📍 أين أجد معلوماتي؟</h4>
                        <ul className="text-sm space-y-1">
                          <li>• <code className="bg-green-100 px-2 py-1 rounded">/my-card</code> - بطاقتي</li>
                          <li>• <code className="bg-green-100 px-2 py-1 rounded">/my-offers</code> - عروضي الخاصة</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* العروض */}
                  <AccordionItem value="item-4" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">4. كيف أستخدم صفحة "عروضي"؟</h3>
                          <p className="text-sm text-gray-600">العروض الخاصة والمكافآت</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-yellow-50 p-4 rounded-lg border-r-4 border-yellow-600">
                        <h4 className="font-bold mb-3">🎯 صفحة "عروضي" - <code>/my-offers</code></h4>
                        <p className="text-sm mb-3">هذه الصفحة تعرض عروض خاصة لك فقط حسب مستواك ونقاطك!</p>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">ماذا ستجد في الصفحة؟</h5>
                            <ul className="text-sm space-y-1">
                              <li>✅ عروض حصرية لمستواك</li>
                              <li>✅ خصومات على المنتجات</li>
                              <li>✅ قهوة مجانية</li>
                              <li>✅ ترقية حجم مجانية</li>
                              <li>✅ عروض "اشترِ 2 احصل على 1 مجاناً"</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">كيف تستبدل العرض؟</h5>
                            <ol className="list-decimal list-inside text-sm space-y-1">
                              <li>اذهب إلى <code>/my-offers</code></li>
                              <li>اختر العرض الذي تريده</li>
                              <li>تحقق من نقاطك (يجب أن تكون كافية)</li>
                              <li>اضغط "استبدل الآن"</li>
                              <li>استخدم العرض في طلبك القادم</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* تتبع الطلبات */}
                  <AccordionItem value="item-5" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">5. كيف أتتبع طلبي؟</h3>
                          <p className="text-sm text-gray-600">متابعة حالة الطلب</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-green-50 p-4 rounded-lg border-r-4 border-green-600">
                        <h4 className="font-bold mb-3">📍 تتبع طلبك:</h4>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">مراحل الطلب:</h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm">1️⃣ قيد الانتظار - في انتظار التأكيد</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">2️⃣ تم التأكيد - الدفع مؤكد</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                                <ChefHat className="w-4 h-4 text-orange-600" />
                                <span className="text-sm">3️⃣ قيد التحضير - المطبخ يعمل عليه</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                <Package className="w-4 h-4 text-green-600" />
                                <span className="text-sm">4️⃣ جاهز - يمكنك الاستلام</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">أين أتتبع؟</h5>
                            <ul className="text-sm space-y-1">
                              <li>• اذهب إلى <code className="bg-green-100 px-2 py-1 rounded">/my-orders</code></li>
                              <li>• ستجد جميع طلباتك مع حالة كل طلب</li>
                              <li>• يمكنك رؤية التفاصيل والفاتورة</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* طرق الدفع */}
                  <AccordionItem value="item-6" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <CreditCard className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">6. ما هي طرق الدفع المتاحة؟</h3>
                          <p className="text-sm text-gray-600">خيارات الدفع المتعددة</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-red-50 p-4 rounded-lg border-r-4 border-red-600">
                        <h4 className="font-bold mb-3">💳 طرق الدفع المتاحة:</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <h5 className="font-bold mb-1 text-green-700">💵 نقداً</h5>
                            <p className="text-xs text-gray-600">ادفع عند الاستلام</p>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-blue-200">
                            <h5 className="font-bold mb-1 text-blue-700">💳 شبكة</h5>
                            <p className="text-xs text-gray-600">مدى، فيزا، ماستر كارد</p>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <h5 className="font-bold mb-1 text-purple-700">🎁 بطاقة كوبي</h5>
                            <p className="text-xs text-gray-600">استخدم نقاطك</p>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <h5 className="font-bold mb-1 text-orange-700">📱 نيو ليب</h5>
                            <p className="text-xs text-gray-600">دفع إلكتروني سريع</p>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <h5 className="font-bold mb-1">🍎 Apple Pay</h5>
                            <p className="text-xs text-gray-600">دفع سريع وآمن</p>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-indigo-200">
                            <h5 className="font-bold mb-1 text-indigo-700">🏦 بطاقة بنكية</h5>
                            <p className="text-xs text-gray-600">عبر NeoLeap</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* دليل الموظفين */}
          <TabsContent value="employees" className="space-y-6">
            <Card className="shadow-xl border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                  دليل الموظفين والكاشيرات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="space-y-4">
                  
                  {/* تسجيل الدخول للموظفين */}
                  <AccordionItem value="emp-1" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">1. كيف أسجل دخولي كموظف؟</h3>
                          <p className="text-sm text-gray-600">الدخول إلى نظام الموظفين</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-600">
                        <h4 className="font-bold mb-3">🔐 تسجيل الدخول:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>اذهب إلى <code className="bg-blue-100 px-2 py-1 rounded">/employee/login</code></li>
                          <li>أدخل اسم المستخدم (username) الخاص بك</li>
                          <li>أدخل كلمة المرور</li>
                          <li>اضغط "تسجيل الدخول"</li>
                        </ol>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm"><strong>⚠️ تنبيه:</strong> إذا نسيت كلمة المرور، تواصل مع المدير</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* نظام POS */}
                  <AccordionItem value="emp-2" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CreditCard className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">2. كيف أستخدم نظام POS (نقاط البيع)؟</h3>
                          <p className="text-sm text-gray-600">إنشاء طلب جديد</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-green-50 p-4 rounded-lg border-r-4 border-green-600">
                        <h4 className="font-bold mb-3">💻 استخدام POS:</h4>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">خطوات إنشاء طلب:</h5>
                            <ol className="list-decimal list-inside text-sm space-y-2">
                              <li>اذهب إلى <code className="bg-green-100 px-2 py-1 rounded">/employee/pos</code></li>
                              <li>اختر المنتجات من القائمة</li>
                              <li>حدد الحجم والإضافات</li>
                              <li>أضف للسلة</li>
                              <li>أدخل معلومات العميل (رقم الجوال)</li>
                              <li>اختر طريقة الدفع:
                                <ul className="mr-6 mt-1 space-y-1">
                                  <li>• نقداً - يتم التأكيد تلقائياً ✅</li>
                                  <li>• شبكة - يتم التأكيد تلقائياً ✅</li>
                                  <li>• بطاقة كوبي - يتم التأكيد تلقائياً ✅</li>
                                </ul>
                              </li>
                              <li>اضغط "تأكيد الطلب"</li>
                              <li>اطبع الفاتورة إذا لزم الأمر</li>
                            </ol>
                          </div>

                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <h5 className="font-bold mb-2">⚡ ميزة مهمة:</h5>
                            <p className="text-sm">الطلبات من POS تكون <strong>مؤكدة تلقائياً</strong> للطرق: نقداً، شبكة، بطاقة كوبي</p>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-bold mb-2">💡 نصائح سريعة:</h5>
                            <ul className="text-sm space-y-1">
                              <li>• استخدم البحث للعثور على المنتجات بسرعة</li>
                              <li>• يمكنك حفظ الطلب ومتابعة لاحقاً</li>
                              <li>• النظام يحسب الإجمالي تلقائياً</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* شاشة المطبخ */}
                  <AccordionItem value="emp-3" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <ChefHat className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">3. كيف تعمل شاشة المطبخ؟</h3>
                          <p className="text-sm text-gray-600">إدارة الطلبات في المطبخ</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-orange-50 p-4 rounded-lg border-r-4 border-orange-600">
                        <h4 className="font-bold mb-3">👨‍🍳 شاشة المطبخ:</h4>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">الوصول:</h5>
                            <p className="text-sm">اذهب إلى <code className="bg-orange-100 px-2 py-1 rounded">/employee/kitchen</code> أو <code>/employee/orders-display-enhanced</code></p>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">كيف تعمل؟</h5>
                            <ul className="text-sm space-y-2">
                              <li>
                                <strong>4 أعمدة:</strong>
                                <div className="mr-4 mt-1 space-y-1">
                                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                                    <span>1️⃣</span>
                                    <span>قيد الانتظار (أصفر)</span>
                                  </div>
                                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                    <span>2️⃣</span>
                                    <span>مؤكد الدفع (أزرق)</span>
                                  </div>
                                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                                    <span>3️⃣</span>
                                    <span>قيد التحضير (برتقالي)</span>
                                  </div>
                                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                    <span>4️⃣</span>
                                    <span>جاهز (أخضر)</span>
                                  </div>
                                </div>
                              </li>
                              <li><strong>تحديث تلقائي:</strong> كل 3 ثوانٍ</li>
                              <li><strong>إشعارات صوتية:</strong> عند طلب جديد</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">خطوات العمل:</h5>
                            <ol className="list-decimal list-inside text-sm space-y-1">
                              <li>تظهر الطلبات الجديدة في "قيد الانتظار"</li>
                              <li>اضغط "بدء التحضير" لنقله لعمود "قيد التحضير"</li>
                              <li>عند الانتهاء، اضغط "جاهز للتسليم"</li>
                              <li>عند التسليم، اضغط "تم التسليم"</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* إدارة الطلبات */}
                  <AccordionItem value="emp-4" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">4. كيف أدير الطلبات؟</h3>
                          <p className="text-sm text-gray-600">عرض وتحديث الطلبات</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-purple-50 p-4 rounded-lg border-r-4 border-purple-600">
                        <h4 className="font-bold mb-3">📋 إدارة الطلبات:</h4>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">ما يمكنك فعله:</h5>
                            <ul className="text-sm space-y-1">
                              <li>✅ عرض جميع الطلبات</li>
                              <li>✅ تغيير حالة الطلب</li>
                              <li>✅ البحث عن طلب معين</li>
                              <li>✅ طباعة الفاتورة</li>
                              <li>✅ إلغاء طلب (إذا لزم الأمر)</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">حالات الطلب:</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span>قيد الانتظار</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>تم تأكيد الدفع</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                                <ChefHat className="w-4 h-4 text-orange-600" />
                                <span>قيد التحضير</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                <Package className="w-4 h-4 text-green-600" />
                                <span>جاهز</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <CheckCircle className="w-4 h-4 text-gray-600" />
                                <span>مكتمل</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* دليل المديرين */}
          <TabsContent value="managers" className="space-y-6">
            <Card className="shadow-xl border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BarChart className="w-6 h-6 text-purple-600" />
                  دليل المديرين
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="space-y-4">
                  
                  {/* لوحة التحكم */}
                  <AccordionItem value="mgr-1" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BarChart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">1. لوحة التحكم الرئيسية</h3>
                          <p className="text-sm text-gray-600">نظرة عامة على الأعمال</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-600">
                        <h4 className="font-bold mb-3">📊 لوحة التحكم:</h4>
                        <p className="text-sm mb-3">اذهب إلى <code className="bg-blue-100 px-2 py-1 rounded">/manager/dashboard</code></p>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <h5 className="font-bold mb-2">ماذا تعرض؟</h5>
                          <ul className="text-sm space-y-1">
                            <li>📈 مبيعات اليوم</li>
                            <li>📦 الطلبات النشطة</li>
                            <li>👥 عدد العملاء</li>
                            <li>💰 الإيرادات</li>
                            <li>📊 رسوم بيانية</li>
                            <li>⚡ إحصائيات مباشرة</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* إدارة المخزون */}
                  <AccordionItem value="mgr-2" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">2. إدارة المخزون الذكية</h3>
                          <p className="text-sm text-gray-600">تتبع المواد والمنتجات</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-green-50 p-4 rounded-lg border-r-4 border-green-600">
                        <h4 className="font-bold mb-3">📦 المخزون:</h4>
                        <p className="text-sm mb-3">اذهب إلى <code className="bg-green-100 px-2 py-1 rounded">/manager/inventory</code></p>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">الميزات:</h5>
                            <ul className="text-sm space-y-1">
                              <li>✅ تتبع المواد الخام</li>
                              <li>✅ تتبع المنتجات النهائية</li>
                              <li>✅ تنبيهات عند انخفاض المخزون</li>
                              <li>✅ حساب تلقائي للاستهلاك</li>
                              <li>✅ تقارير المخزون</li>
                              <li>✅ حركة المخزون</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">كيف يعمل؟</h5>
                            <p className="text-sm">عند كل طلب، يتم خصم المواد المستخدمة تلقائياً من المخزون!</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* المحاسبة */}
                  <AccordionItem value="mgr-3" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">3. المحاسبة الذكية</h3>
                          <p className="text-sm text-gray-600">التقارير المالية</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-purple-50 p-4 rounded-lg border-r-4 border-purple-600">
                        <h4 className="font-bold mb-3">💰 المحاسبة:</h4>
                        <p className="text-sm mb-3">اذهب إلى <code className="bg-purple-100 px-2 py-1 rounded">/manager/accounting</code></p>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <h5 className="font-bold mb-2">التقارير المتاحة:</h5>
                          <ul className="text-sm space-y-1">
                            <li>📊 تقرير المبيعات اليومي</li>
                            <li>📈 تقرير المبيعات الشهري</li>
                            <li>💵 تكلفة البضاعة المباعة (COGS)</li>
                            <li>💰 الأرباح والخسائر</li>
                            <li>🧾 الفواتير الضريبية</li>
                            <li>📉 تحليل المصروفات</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* إدارة المطابخ */}
                  <AccordionItem value="mgr-4" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <ChefHat className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">4. إدارة المطابخ والأقسام</h3>
                          <p className="text-sm text-gray-600">تنظيم المطابخ</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-orange-50 p-4 rounded-lg border-r-4 border-orange-600">
                        <h4 className="font-bold mb-3">👨‍🍳 المطابخ:</h4>
                        <p className="text-sm mb-3">اذهب إلى <code className="bg-orange-100 px-2 py-1 rounded">/manager/kitchen-categories</code></p>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">ما يمكنك فعله؟</h5>
                            <ul className="text-sm space-y-1">
                              <li>✅ إضافة مطبخ جديد</li>
                              <li>✅ تعديل المطابخ الموجودة</li>
                              <li>✅ حذف مطبخ</li>
                              <li>✅ إضافة أقسام المشروبات</li>
                              <li>✅ تحديد أنواع المطابخ (مشروبات، أطعمة، حلويات)</li>
                              <li>✅ ربط الأقسام بالمطابخ</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">مثال:</h5>
                            <p className="text-sm">يمكنك إنشاء "مطبخ القهوة" وربطه بقسم "القهوة الساخنة" و"القهوة الباردة"</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* باركود الطاولات */}
                  <AccordionItem value="mgr-5" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <QrCode className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">5. باركود الطاولات المحسّن</h3>
                          <p className="text-sm text-gray-600">طباعة QR codes</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-red-50 p-4 rounded-lg border-r-4 border-red-600">
                        <h4 className="font-bold mb-3">🔲 باركود الطاولات:</h4>
                        <p className="text-sm mb-3">اذهب إلى <code className="bg-red-100 px-2 py-1 rounded">/manager/tables/barcodes</code></p>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">3 تصاميم مختلفة:</h5>
                            <ul className="text-sm space-y-1">
                              <li>🎨 <strong>عصري:</strong> تدرجات لونية وتصميم جذاب</li>
                              <li>📜 <strong>كلاسيكي:</strong> تصميم أنيق مع إطار</li>
                              <li>⚪ <strong>بسيط:</strong> نظيف ومباشر</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">الميزات:</h5>
                            <ul className="text-sm space-y-1">
                              <li>✅ معاينة مباشرة</li>
                              <li>✅ تحميل فردي أو جماعي</li>
                              <li>✅ طباعة مباشرة</li>
                              <li>✅ جودة عالية</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* دليل الأدمن */}
          <TabsContent value="admin" className="space-y-6">
            <Card className="shadow-xl border-2 border-red-200">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  دليل الأدمن - التحكم الكامل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="space-y-4">
                  
                  {/* لوحة التحكم الشاملة */}
                  <AccordionItem value="adm-1" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Settings className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">1. لوحة التحكم الشاملة</h3>
                          <p className="text-sm text-gray-600">السيطرة الكاملة على النظام</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-purple-50 p-4 rounded-lg border-r-4 border-purple-600">
                        <h4 className="font-bold mb-3">🎛️ لوحة التحكم:</h4>
                        <p className="text-sm mb-3">اذهب إلى <code className="bg-purple-100 px-2 py-1 rounded">/admin/control-panel</code></p>
                        
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">3 أقسام رئيسية:</h5>
                            
                            <div className="space-y-2 mt-2">
                              <div className="p-2 bg-blue-50 rounded">
                                <h6 className="font-bold text-sm mb-1">1️⃣ التحكم في الميزات</h6>
                                <p className="text-xs text-gray-600">تفعيل أو إيقاف أي ميزة في النظام</p>
                              </div>
                              
                              <div className="p-2 bg-green-50 rounded">
                                <h6 className="font-bold text-sm mb-1">2️⃣ التحكم في الصفحات</h6>
                                <p className="text-xs text-gray-600">إظهار أو إخفاء أي صفحة</p>
                              </div>
                              
                              <div className="p-2 bg-orange-50 rounded">
                                <h6 className="font-bold text-sm mb-1">3️⃣ الإعدادات المتقدمة</h6>
                                <p className="text-xs text-gray-600">نسخ احتياطي، مسح الكاش، مراقبة النظام</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2">الميزات التي يمكن التحكم بها:</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>نظام الولاء</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>صفحة عروضي</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>نظام POS</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>عرض المطبخ</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>إدارة المخزون</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>المحاسبة</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>خدمة التوصيل</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>الإشعارات</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* مراقبة النظام */}
                  <AccordionItem value="adm-2" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">2. مراقبة النظام</h3>
                          <p className="text-sm text-gray-600">حالة الخوادم والأداء</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-green-50 p-4 rounded-lg border-r-4 border-green-600">
                        <h4 className="font-bold mb-3">📊 المراقبة:</h4>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <h5 className="font-bold mb-2">ما تراه:</h5>
                          <ul className="text-sm space-y-1">
                            <li>🗄️ حالة قاعدة البيانات (MongoDB)</li>
                            <li>🖥️ حالة الخادم الخلفي (Express)</li>
                            <li>🌐 حالة الواجهة الأمامية (React + Vite)</li>
                            <li>⚡ حالة WebSocket</li>
                            <li>📈 عدد الطلبات النشطة</li>
                            <li>👥 المستخدمون المتصلون</li>
                            <li>💾 استخدام الذاكرة</li>
                            <li>⏱️ وقت التشغيل</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* الصلاحيات */}
                  <AccordionItem value="adm-3" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">3. إدارة الصلاحيات</h3>
                          <p className="text-sm text-gray-600">من يصل إلى ماذا؟</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-red-50 p-4 rounded-lg border-r-4 border-red-600">
                        <h4 className="font-bold mb-3">🔐 الصلاحيات:</h4>
                        
                        <div className="space-y-2">
                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2 text-green-700">👤 العملاء</h5>
                            <ul className="text-xs space-y-1">
                              <li>• قائمة المنتجات</li>
                              <li>• إنشاء طلبات</li>
                              <li>• بطاقة الولاء</li>
                              <li>• صفحة عروضي</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2 text-blue-700">👔 الموظفين</h5>
                            <ul className="text-xs space-y-1">
                              <li>• نظام POS</li>
                              <li>• شاشة المطبخ</li>
                              <li>• إدارة الطلبات</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2 text-purple-700">👨‍💼 المديرين</h5>
                            <ul className="text-xs space-y-1">
                              <li>• كل صلاحيات الموظفين</li>
                              <li>• + التقارير</li>
                              <li>• + إدارة المخزون</li>
                              <li>• + المحاسبة</li>
                              <li>• + إدارة الموظفين</li>
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-lg">
                            <h5 className="font-bold mb-2 text-red-700">🛡️ الأدمن</h5>
                            <ul className="text-xs space-y-1">
                              <li>• كل الصلاحيات</li>
                              <li>• + التحكم الكامل</li>
                              <li>• + إدارة الميزات</li>
                              <li>• + مراقبة النظام</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Footer */}
        <Card className="mt-8 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              هل تحتاج مساعدة إضافية؟
            </h3>
            <p className="text-gray-700 mb-4">
              هذا الدليل يغطي جميع جوانب النظام. إذا كنت بحاجة لمزيد من المساعدة:
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <Phone className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-bold">اتصل بالدعم الفني</p>
                <p className="text-xs text-gray-600">متاح 24/7</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-bold">راسلنا</p>
                <p className="text-xs text-gray-600">نرد خلال ساعة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
