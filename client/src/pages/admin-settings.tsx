import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Shield, Bell, Palette, Database, Plus, Store, Utensils, Coffee } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminSettings() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [settings, setSettings] = useState({
    companyName: 'CLUNY CAFE',
    businessEmail: 'info@qahwakup.com',
    businessPhone: '+966501234567',
    theme: 'auto',
    currency: 'SAR',
    language: 'ar',
    emailNotifications: true,
    dataBackupInterval: 'daily',
  });

  const { data: businessConfig, isLoading: isLoadingConfig } = useQuery<{
    activityType: 'cafe' | 'restaurant' | 'both';
    isFoodEnabled: boolean;
    isDrinksEnabled: boolean;
  }>({
    queryKey: ['/api/business-config'],
  });

  const [businessMode, setBusinessMode] = useState<'cafe' | 'restaurant' | 'both'>('cafe');
  const [isFoodEnabled, setIsFoodEnabled] = useState(false);

  useEffect(() => {
    if (businessConfig) {
      setBusinessMode(businessConfig.activityType || 'cafe');
      setIsFoodEnabled(businessConfig.isFoodEnabled || false);
    }
  }, [businessConfig]);

  const updateBusinessConfigMutation = useMutation({
    mutationFn: async (data: { activityType?: string; isFoodEnabled?: boolean }) => {
      return apiRequest('PATCH', '/api/config', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث إعدادات وضع العمل بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الإعدادات',
        variant: 'destructive',
      });
    },
  });

  const handleBusinessModeChange = (mode: 'cafe' | 'restaurant' | 'both') => {
    setBusinessMode(mode);
    const newFoodEnabled = mode === 'restaurant' || mode === 'both';
    setIsFoodEnabled(newFoodEnabled);
    updateBusinessConfigMutation.mutate({ 
      activityType: mode,
      isFoodEnabled: newFoodEnabled
    });
  };

  const handleSave = () => {
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ الإعدادات بنجاح',
    });
  };

  const SettingSection = ({ icon: Icon, title, description, children }: any) => (
    <Card className="border-0 bg-white dark:bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent dark:bg-accent/30 p-3 rounded-lg">
            <Icon className="w-5 h-5 text-accent dark:text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات النظام</h1>
          <p className="text-muted-foreground mt-1">إدارة إعدادات التطبيق والمتغيرات العامة</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-accent hover:bg-accent"
          data-testid="button-save-settings"
        >
          <Save className="w-4 h-4 ml-2" />
          حفظ التغييرات
        </Button>
      </div>

      {/* Business Mode Settings */}
      <SettingSection
        icon={Store}
        title="وضع العمل"
        description="اختر نوع نشاطك التجاري - كافيه فقط أو مطعم وكافيه معاً"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleBusinessModeChange('cafe')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                businessMode === 'cafe' 
                  ? 'border-accent bg-accent/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-accent/50'
              }`}
              data-testid="button-mode-cafe"
            >
              <Coffee className={`w-8 h-8 ${businessMode === 'cafe' ? 'text-accent' : 'text-muted-foreground'}`} />
              <div className="text-center">
                <p className="font-bold">كافيه فقط</p>
                <p className="text-xs text-muted-foreground">مشروبات وحلويات</p>
              </div>
            </button>
            <button
              onClick={() => handleBusinessModeChange('restaurant')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                businessMode === 'restaurant' 
                  ? 'border-accent bg-accent/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-accent/50'
              }`}
              data-testid="button-mode-restaurant"
            >
              <Utensils className={`w-8 h-8 ${businessMode === 'restaurant' ? 'text-accent' : 'text-muted-foreground'}`} />
              <div className="text-center">
                <p className="font-bold">مطعم فقط</p>
                <p className="text-xs text-muted-foreground">مأكولات ووجبات</p>
              </div>
            </button>
            <button
              onClick={() => handleBusinessModeChange('both')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                businessMode === 'both' 
                  ? 'border-accent bg-accent/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-accent/50'
              }`}
              data-testid="button-mode-both"
            >
              <div className="flex gap-1">
                <Coffee className={`w-6 h-6 ${businessMode === 'both' ? 'text-accent' : 'text-muted-foreground'}`} />
                <Utensils className={`w-6 h-6 ${businessMode === 'both' ? 'text-accent' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-center">
                <p className="font-bold">كافيه ومطعم</p>
                <p className="text-xs text-muted-foreground">مشروبات ومأكولات معاً</p>
              </div>
            </button>
          </div>
          <div className={`p-4 rounded-lg ${isFoodEnabled ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isFoodEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <p className="font-medium">
                  {isFoodEnabled ? 'قائمة الطعام مفعلة' : 'قائمة الطعام غير مفعلة'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isFoodEnabled 
                    ? 'العملاء يمكنهم رؤية واختيار المأكولات من المنيو' 
                    : 'اختر وضع "مطعم" أو "كافيه ومطعم" لتفعيل قائمة الطعام'}
                </p>
              </div>
            </div>
          </div>
          {updateBusinessConfigMutation.isPending && (
            <p className="text-sm text-muted-foreground text-center">جاري الحفظ...</p>
          )}
        </div>
      </SettingSection>

      {/* General Settings */}
      <SettingSection
        icon={Palette}
        title="الإعدادات العامة"
        description="بيانات الشركة والتطبيق الأساسية"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم الشركة</label>
            <Input
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              placeholder="اسم الشركة"
              data-testid="input-company-name"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <Input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                placeholder="البريد الإلكتروني"
                data-testid="input-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <Input
                value={settings.businessPhone}
                onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                placeholder="رقم الهاتف"
                data-testid="input-phone"
              />
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Display Settings */}
      <SettingSection
        icon={Palette}
        title="إعدادات العرض"
        description="تخصيص مظهر وتجربة المستخدم"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">المظهر</label>
            <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
              <SelectTrigger data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">فاتح</SelectItem>
                <SelectItem value="dark">غامق</SelectItem>
                <SelectItem value="auto">تلقائي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">العملة</label>
            <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
              <SelectTrigger data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                <SelectItem value="EUR">يورو (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">اللغة</label>
            <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
              <SelectTrigger data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection
        icon={Bell}
        title="الإشعارات"
        description="إدارة إعدادات الإشعارات والتنبيهات"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-medium">إشعارات البريد الإلكتروني</p>
              <p className="text-sm text-muted-foreground">استقبال إشعارات الطلبات والأحداث</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
                data-testid="toggle-email-notifications"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </SettingSection>

      {/* Database Settings */}
      <SettingSection
        icon={Database}
        title="قاعدة البيانات"
        description="إعدادات النسخ الاحتياطي والصيانة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">فترة النسخ الاحتياطي</label>
            <Select value={settings.dataBackupInterval} onValueChange={(value) => setSettings({ ...settings, dataBackupInterval: value })}>
              <SelectTrigger data-testid="select-backup-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">كل ساعة</SelectItem>
                <SelectItem value="daily">يومياً</SelectItem>
                <SelectItem value="weekly">أسبوعياً</SelectItem>
                <SelectItem value="monthly">شهرياً</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" data-testid="button-backup-now">
              عمل نسخة احتياطية الآن
            </Button>
            <Button variant="outline" data-testid="button-restore-backup">
              استعادة نسخة
            </Button>
          </div>
        </div>
      </SettingSection>

      {/* Branch Management Section - Fixed white screen issue */}
      <SettingSection
        icon={Plus}
        title="إدارة الفروع"
        description="إضافة وتعديل فروع المقهى"
      >
        <div className="p-4 bg-background dark:bg-accent/20 rounded-lg border border-orange-100 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-accent dark:text-accent">إضافة فرع جديد</p>
              <p className="text-sm text-accent dark:text-accent">يمكنك إضافة فرع جديد وتعيين مدير له من هنا</p>
            </div>
            <Button 
              className="bg-accent hover:bg-accent"
              onClick={() => navigate('/admin/branches')}
            >
              <Plus className="w-4 h-4 ml-2" />
              إدارة الفروع
            </Button>
          </div>
        </div>
      </SettingSection>

      {/* Security Settings */}
      <SettingSection
        icon={Shield}
        title="الأمان"
        description="إعدادات الأمان والخصوصية"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">تحذير أمني:</span> تأكد من تحديث كلمات المرور بانتظام وتفعيل المصادقة الثنائية لحسابات الإدارة.
            </p>
          </div>
          <Button variant="outline" className="w-full" data-testid="button-change-admin-password">
            تغيير كلمة المرور الرئيسية
          </Button>
        </div>
      </SettingSection>
    </div>
  );
}
