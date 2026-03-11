import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Truck, Globe, Settings2, Link2, ArrowRight, Activity, RefreshCw,
  Copy, CheckCircle2, XCircle, AlertCircle, Zap, BarChart3,
  ShoppingBag, Package, Clock, TrendingUp, Webhook, Play, ExternalLink,
  ChevronDown, ChevronUp, Eye, EyeOff
} from "lucide-react";
import { useLocation } from "wouter";

const PLATFORMS = [
  {
    id: 'hungerstation', providerName: 'hunger_station',
    nameAr: 'هنقرستيشن', nameEn: 'HungerStation',
    color: '#E31E30', bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    description: 'أكبر منصة توصيل طعام في السعودية والشرق الأوسط',
    docsUrl: 'https://developers.deliveryhero.com',
    setupSteps: [
      'سجّل حسابك التجاري على HungerStation Partner',
      'اطلب الوصول للـ API من فريق الدعم الفني',
      'أدخل مفتاح الـ API الخاص بك أدناه',
      'انسخ رابط الـ Webhook وأضفه في لوحة تحكم HungerStation',
    ],
  },
  {
    id: 'jahez', providerName: 'jahez',
    nameAr: 'جاهز', nameEn: 'Jahez',
    color: '#FF6B35', bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    description: 'منصة توصيل الطعام السعودية المدرجة في السوق المالية',
    docsUrl: 'https://jahez.net',
    setupSteps: [
      'سجّل حسابك على بوابة شركاء جاهز',
      'احصل على API Key من قسم الإعدادات',
      'أدخل مفتاح الـ API الخاص بك أدناه',
      'انسخ رابط الـ Webhook وأضفه في لوحة تحكم جاهز',
    ],
  },
  {
    id: 'mrsool', providerName: 'mrsool',
    nameAr: 'مرسول', nameEn: 'Mrsool',
    color: '#6C63FF', bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'منصة التوصيل الاجتماعية الأسرع نمواً في السعودية',
    docsUrl: 'https://mrsool.co',
    setupSteps: [
      'تواصل مع فريق الشراكات في مرسول',
      'احصل على بيانات الـ API بعد الموافقة',
      'أدخل مفتاح الـ API والـ Merchant ID أدناه',
      'انسخ رابط الـ Webhook وأضفه في لوحة تحكم مرسول',
    ],
  },
  {
    id: 'noon_food', providerName: 'noon_food',
    nameAr: 'نون فود', nameEn: 'Noon Food',
    color: '#FEEE00', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    description: 'منصة الطعام من شركة نون للتجارة الإلكترونية',
    docsUrl: 'https://noon.com',
    setupSteps: [
      'سجّل في برنامج Noon Merchant',
      'اطلب تفعيل Food API من الدعم الفني',
      'أدخل بيانات API أدناه',
      'انسخ رابط الـ Webhook وأضفه في إعدادات نون',
    ],
  },
  {
    id: 'keeta', providerName: 'keeta',
    nameAr: 'كيتا', nameEn: 'Keeta',
    color: '#00C851', bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    description: 'منصة توصيل Meituan الصينية المتوسعة في السعودية',
    docsUrl: 'https://keeta.com',
    setupSteps: [
      'سجّل شراكتك مع كيتا للمطاعم',
      'احصل على بيانات التكامل',
      'أدخل مفتاح الـ API أدناه',
      'انسخ رابط الـ Webhook',
    ],
  },
  {
    id: 'careem', providerName: 'careem',
    nameAr: 'كريم', nameEn: 'Careem',
    color: '#1BAE4F', bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'منصة كريم السوبر آب للتوصيل والخدمات',
    docsUrl: 'https://careem.com',
    setupSteps: [
      'تواصل مع فريق Careem Food Merchant',
      'أكمل عملية التحقق من المطعم',
      'أدخل بيانات API أدناه',
      'انسخ رابط الـ Webhook',
    ],
  },
];

function PlatformLogo({ id, size = 40 }: { id: string; size?: number }) {
  const logos: Record<string, string> = {
    hungerstation: '🍔', jahez: '🛵', mrsool: '📦',
    noon_food: '🌙', keeta: '⚡', careem: '🚗',
  };
  return (
    <div
      className="rounded-xl flex items-center justify-center text-2xl font-bold"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {logos[id] || '🚀'}
    </div>
  );
}

export default function ExternalIntegrationsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [setupPlatform, setSetupPlatform] = useState<typeof PLATFORMS[0] | null>(null);
  const [formData, setFormData] = useState({ apiKey: '', apiSecret: '', merchantId: '', autoAcceptOrders: false, commissionPercent: '' });
  const [showSecret, setShowSecret] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [expandedSetup, setExpandedSetup] = useState<string | null>(null);

  const baseUrl = window.location.origin;

  const { data: integrations = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/integrations/delivery"],
  });

  const { data: stats = {} } = useQuery<Record<string, any>>({
    queryKey: ["/api/integrations/delivery/stats"],
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/integrations/delivery", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/delivery"] });
      toast({ title: "تم ربط المنصة بنجاح", className: "bg-green-600 text-white" });
      setSetupPlatform(null);
      setFormData({ apiKey: '', apiSecret: '', merchantId: '', autoAcceptOrders: false, commissionPercent: '' });
    },
    onError: () => toast({ title: "فشل الربط", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/integrations/delivery/${id}/toggle`, {});
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/integrations/delivery"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/integrations/delivery/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/delivery"] });
      toast({ title: "تم إلغاء الربط" });
    },
  });

  const simulateMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await apiRequest("POST", "/api/integrations/delivery/simulate", { provider });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/delivery/stats"] });
      toast({
        title: "✅ تم إنشاء طلب تجريبي",
        description: `طلب رقم ${data.order?.dailyNumber || data.order?.id?.slice(-4)} تم إرساله للكاشير`,
        className: "bg-green-600 text-white",
      });
    },
    onError: () => toast({ title: "فشل إنشاء الطلب التجريبي", variant: "destructive" }),
  });

  const copyWebhookUrl = (providerId: string) => {
    const url = `${baseUrl}/api/webhooks/delivery/${providerId}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(providerId);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const getIntegration = (providerName: string) =>
    integrations.find((i: any) => i.providerName === providerName || i.provider === providerName);

  const totalOrdersToday = Object.values(stats).reduce((s: number, v: any) => s + (v?.ordersToday || 0), 0);
  const totalRevenueToday = Object.values(stats).reduce((s: number, v: any) => s + (v?.revenueToday || 0), 0);
  const connectedCount = PLATFORMS.filter(p => {
    const int = getIntegration(p.providerName);
    return int && int.isActive;
  }).length;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/manager")} className="hover:bg-primary/10">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">منصات التوصيل</h1>
          <p className="text-muted-foreground text-sm">استقبل طلبات HungerStation وجاهز ومرسول مباشرة في نظام الكاشير</p>
        </div>
        <Globe className="h-8 w-8 text-primary hidden md:block" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-primary">{connectedCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">منصات مفعّلة</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-green-600">{totalOrdersToday}</div>
            <div className="text-xs text-muted-foreground mt-0.5">طلبات اليوم</div>
          </CardContent>
        </Card>
        <Card className="border-accent/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-accent">{totalRevenueToday.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">ريال اليوم</div>
          </CardContent>
        </Card>
      </div>

      {/* How it works banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">كيف يعمل الدمج؟</p>
              <p className="text-xs text-muted-foreground mt-1">
                لما العميل يطلب من HungerStation أو جاهز أو مرسول، يصل الطلب تلقائياً لشاشة الكاشير عندك خلال ثوانٍ — بدون ما تفتح أي تطبيق آخر.
                كل ما تحتاجه هو ربط حسابك التجاري مع كل منصة وإضافة مفتاح الـ API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => {
          const integration = getIntegration(platform.providerName);
          const isActive = integration?.isActive == 1;
          const isConfigured = !!integration;
          const platformStats = stats[platform.id] || {};
          const webhookUrl = `${baseUrl}/api/webhooks/delivery/${platform.id}`;

          return (
            <Card
              key={platform.id}
              className={`border-2 transition-all duration-200 ${isActive ? 'border-green-500/50 shadow-md' : isConfigured ? 'border-amber-400/50' : 'border-border hover:border-primary/30'}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformLogo id={platform.id} size={44} />
                    <div>
                      <CardTitle className="text-base">{platform.nameAr}</CardTitle>
                      <p className="text-xs text-muted-foreground">{platform.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs gap-1">
                        <Activity className="w-2.5 h-2.5 animate-pulse" />
                        مفعّل
                      </Badge>
                    )}
                    {isConfigured && !isActive && (
                      <Badge variant="outline" className="text-amber-600 border-amber-400/50 text-xs">
                        موقوف
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{platform.description}</p>

                {/* Stats if active */}
                {isActive && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <div className="font-black text-lg text-primary">{platformStats.ordersToday || 0}</div>
                      <div className="text-xs text-muted-foreground">طلبات اليوم</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <div className="font-black text-lg text-accent">{(platformStats.revenueToday || 0).toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">ريال اليوم</div>
                    </div>
                  </div>
                )}

                {/* Webhook URL if configured */}
                {isConfigured && (
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setExpandedSetup(expandedSetup === platform.id ? null : platform.id)}
                    >
                      <Webhook className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">رابط الـ Webhook</span>
                      {expandedSetup === platform.id ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                    </div>
                    {expandedSetup === platform.id && (
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
                        <code className="text-xs flex-1 truncate text-muted-foreground" dir="ltr">{webhookUrl}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => copyWebhookUrl(platform.id)}>
                          {copiedUrl === platform.id ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {!isConfigured ? (
                    <Button className="flex-1" size="sm" onClick={() => { setSetupPlatform(platform); setFormData({ apiKey: '', apiSecret: '', merchantId: '', autoAcceptOrders: false, commissionPercent: '' }); }}>
                      <Link2 className="w-3.5 h-3.5 ml-1" />
                      ربط المنصة
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={isActive ? "outline" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleMutation.mutate(integration.id)}
                        disabled={toggleMutation.isPending}
                      >
                        {isActive ? <XCircle className="w-3.5 h-3.5 ml-1" /> : <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
                        {isActive ? 'إيقاف' : 'تفعيل'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="إرسال طلب تجريبي"
                        onClick={() => simulateMutation.mutate(platform.id)}
                        disabled={simulateMutation.isPending}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="إلغاء الربط"
                        onClick={() => deleteMutation.mutate(integration.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Setup steps collapse */}
                {!isConfigured && (
                  <div className="border-t pt-2">
                    <button
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      onClick={() => setExpandedSetup(expandedSetup === platform.id ? null : platform.id)}
                    >
                      {expandedSetup === platform.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      خطوات الربط
                    </button>
                    {expandedSetup === platform.id && (
                      <ol className="mt-2 space-y-1.5 list-decimal list-inside">
                        {platform.setupSteps.map((step, i) => (
                          <li key={i} className="text-xs text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Simulate Order section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="w-4 h-4 text-green-600" />
            اختبار النظام بطلبات وهمية
          </CardTitle>
          <CardDescription>أرسل طلباً تجريبياً من أي منصة لتتأكد إن الكاشير يستقبله بشكل صحيح</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <Button
                key={p.id}
                variant="outline"
                size="sm"
                onClick={() => simulateMutation.mutate(p.id)}
                disabled={simulateMutation.isPending}
                className="gap-1.5"
              >
                <Play className="w-3 h-3 text-green-600" />
                {p.nameAr}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            الطلب التجريبي سيظهر في شاشة الكاشير كطلب حقيقي — يمكنك تجربته وقبوله أو رفضه
          </p>
        </CardContent>
      </Card>

      {/* Technical info */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            معلومات تقنية للمطوّرين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium mb-1">روابط Webhook الخاصة بك:</p>
            <div className="space-y-1.5">
              {PLATFORMS.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-background rounded p-2 border">
                  <span className="text-xs font-medium w-24 flex-shrink-0">{p.nameAr}:</span>
                  <code className="text-xs flex-1 truncate text-muted-foreground" dir="ltr">
                    {baseUrl}/api/webhooks/delivery/{p.id}
                  </code>
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => copyWebhookUrl(p.id)}>
                    {copiedUrl === p.id ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            الطلبات الواردة تُضاف تلقائياً لقائمة الطلبات الحية في الكاشير. إذا كان "القبول التلقائي" مفعّلاً ستذهب مباشرة للمطبخ.
          </p>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={!!setupPlatform} onOpenChange={(open) => !open && setSetupPlatform(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {setupPlatform && <PlatformLogo id={setupPlatform.id} size={36} />}
              ربط {setupPlatform?.nameAr}
            </DialogTitle>
          </DialogHeader>

          {setupPlatform && (
            <div className="space-y-4">
              {/* Steps */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">خطوات الربط</p>
                <ol className="space-y-1.5 list-decimal list-inside">
                  {setupPlatform.setupSteps.map((step, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Webhook URL */}
              <div>
                <Label className="text-xs font-medium">رابط Webhook الخاص بك (ضعه في لوحة تحكم المنصة)</Label>
                <div className="flex items-center gap-2 mt-1.5 bg-muted rounded-lg p-2.5">
                  <code className="text-xs flex-1 text-muted-foreground break-all" dir="ltr">
                    {baseUrl}/api/webhooks/delivery/{setupPlatform.id}
                  </code>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => copyWebhookUrl(setupPlatform.id)}>
                    {copiedUrl === setupPlatform.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <Label>مفتاح الـ API *</Label>
                <Input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="أدخل مفتاح API..."
                  value={formData.apiKey}
                  onChange={e => setFormData(p => ({ ...p, apiKey: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              {/* API Secret */}
              <div>
                <Label>API Secret (اختياري)</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="API Secret..."
                    value={formData.apiSecret}
                    onChange={e => setFormData(p => ({ ...p, apiSecret: e.target.value }))}
                    className="pl-10"
                  />
                  <button className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowSecret(s => !s)}>
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Merchant ID */}
              <div>
                <Label>Merchant ID / Branch ID (اختياري)</Label>
                <Input
                  placeholder="معرّف الفرع..."
                  value={formData.merchantId}
                  onChange={e => setFormData(p => ({ ...p, merchantId: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              {/* Commission */}
              <div>
                <Label>نسبة العمولة % (اختياري)</Label>
                <Input
                  type="number" placeholder="مثال: 15"
                  value={formData.commissionPercent}
                  onChange={e => setFormData(p => ({ ...p, commissionPercent: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              {/* Auto Accept */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">قبول الطلبات تلقائياً</p>
                  <p className="text-xs text-muted-foreground">ترسل الطلبات مباشرة للمطبخ بدون موافقة يدوية</p>
                </div>
                <Switch
                  checked={formData.autoAcceptOrders}
                  onCheckedChange={v => setFormData(p => ({ ...p, autoAcceptOrders: v }))}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setSetupPlatform(null)}>إلغاء</Button>
                <Button
                  className="flex-1"
                  disabled={!formData.apiKey || createMutation.isPending}
                  onClick={() => {
                    if (!setupPlatform) return;
                    createMutation.mutate({
                      providerName: setupPlatform.providerName,
                      providerNameAr: setupPlatform.nameAr,
                      apiKey: formData.apiKey,
                      apiSecret: formData.apiSecret || undefined,
                      merchantId: formData.merchantId || undefined,
                      autoAcceptOrders: formData.autoAcceptOrders ? 1 : 0,
                      commissionPercent: formData.commissionPercent ? Number(formData.commissionPercent) : 0,
                      isActive: 1,
                      isTestMode: 0,
                    });
                  }}
                >
                  {createMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 ml-1" />}
                  تفعيل الربط
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
