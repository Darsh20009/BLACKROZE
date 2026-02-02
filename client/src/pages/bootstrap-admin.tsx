import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, User, Lock, Phone, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BootstrapAdmin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/employees/bootstrap-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "✅ تم إنشاء المدير بنجاح!",
          description: "يمكنك الآن تسجيل الدخول",
          className: "bg-green-600 text-white",
        });
        
        setTimeout(() => {
          setLocation("/employee/login");
        }, 1500);
      } else {
        toast({
          title: "❌ فشل إنشاء المدير",
          description: data.error || data.errorEn || "حدث خطأ",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ خطأ في الاتصال",
        description: "تأكد من أن الخادم يعمل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl flex items-center gap-3 justify-center">
            <Shield className="w-8 h-8" />
            إنشاء مدير النظام الأول
          </CardTitle>
          <p className="text-blue-100 text-center text-sm mt-2">
            قم بإنشاء حساب المدير الرئيسي للنظام
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                اسم المستخدم *
              </Label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
                required
                className="text-right"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                كلمة المرور *
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={4}
                className="text-right"
              />
              <p className="text-xs text-gray-500 mt-1">يجب أن تكون 4 أحرف على الأقل</p>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                الاسم الكامل *
              </Label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="محمد أحمد"
                required
                className="text-right"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                رقم الجوال (اختياري)
              </Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05xxxxxxxx"
                className="text-right"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ ملاحظة:</strong> هذا الحساب سيكون لديه صلاحيات كاملة على النظام. 
                يمكنك بعد ذلك إضافة موظفين آخرين من لوحة التحكم.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء حساب المدير"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{" "}
              <button
                onClick={() => setLocation("/employee/login")}
                className="text-blue-600 hover:underline font-bold"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
