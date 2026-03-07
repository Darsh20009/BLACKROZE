import { useLocation } from "wouter";
import { 
  Coffee, LogOut, ShoppingCart, ClipboardList, User, 
  BarChart3, Settings, Table, Clock, MonitorSmartphone, ChefHat,
  Wallet, Warehouse, Eye, Bell, CheckCircle, AlertCircle, Wifi, WifiOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Employee } from "@shared/schema";
import blackroseLogoStaff from "@assets/blackrose-logo.png";

interface Notification {
  id: string;
  type: 'leave' | 'order' | 'kitchen' | 'manager' | 'alert';
  title: string;
  message: string;
  status?: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  actionLink?: string;
}

interface DashboardSimpleLayoutProps {
  employee: Employee;
  notifications: Notification[];
  pendingOrdersCount: number;
  wsConnected: boolean;
  onLogout: () => void;
}

const roleArabicMap: Record<string, string> = {
  cashier: "كاشير",
  barista: "باريستا",
  manager: "مدير",
  admin: "مشرف",
  owner: "صاحب العمل",
  waiter: "نادل",
  kitchen: "مطبخ",
  delivery: "توصيل",
};

export function DashboardSimpleLayout({
  employee,
  notifications,
  pendingOrdersCount,
  wsConnected,
  onLogout,
}: DashboardSimpleLayoutProps) {
  const [, setLocation] = useLocation();
  const roleArabic = roleArabicMap[employee.role] || employee.role;
  const isManager = ["manager", "owner", "admin"].includes(employee.role);

  const primaryServices = [
    { label: "الكاشير", icon: Coffee, path: "/employee/mobile-cashier" },
    { label: "نقطة البيع", icon: Wallet, path: "/employee/pos" },
    { label: "الطلبات", icon: ClipboardList, path: "/employee/orders" },
    { label: "المطبخ", icon: ChefHat, path: "/employee/kitchen" },
  ];

  const secondaryServices = [
    { label: "عرض الطلبات", icon: MonitorSmartphone, path: "/employee/orders-display" },
    { label: "الحضور", icon: Clock, path: "/employee/attendance" },
    { label: "المنيو", icon: Settings, path: "/employee/menu-management" },
    { label: "الطاولات", icon: Table, path: "/employee/table-orders" },
    { label: "حجز طاولة", icon: Table, path: "/employee/tables" },
  ];

  const managerServices = [
    { label: "لوحة التحكم", icon: BarChart3, path: "/manager/dashboard" },
    { label: "الإعدادات", icon: Settings, path: "/admin/settings" },
    { label: "المحاسبة", icon: BarChart3, path: "/employee/accounting" },
    { label: "الموظفون", icon: User, path: "/admin/employees" },
    { label: "المخزون", icon: Warehouse, path: "/employee/inventory" },
    { label: "عرض المنيو", icon: Eye, path: "/menu-view" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={blackroseLogoStaff} alt="BLACK ROSE" className="w-8 h-8 object-contain rounded" />
          <div>
            <p className="text-xs text-muted-foreground leading-none">BLACK ROSE SYSTEMS</p>
            <p className="text-sm font-bold text-primary leading-tight">لوحة التحكم</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingOrdersCount > 0 && (
            <Badge className="bg-primary text-primary-foreground rounded-full h-6 px-2.5 text-xs font-bold">
              {pendingOrdersCount}
            </Badge>
          )}
          <div className={`flex items-center gap-1 text-xs ${wsConnected ? "text-green-600" : "text-muted-foreground"}`}>
            {wsConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          </div>
          <button
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
            data-testid="button-logout-simple"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="px-4 py-5 space-y-6 max-w-xl mx-auto">
        {/* Greeting */}
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {employee.imageUrl ? (
              <img src={employee.imageUrl} alt={employee.fullName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground truncate">أهلاً، {employee.fullName.split(' ')[0]}</p>
            <p className="text-xs text-muted-foreground">{roleArabic}</p>
          </div>
        </div>

        {/* Primary quick actions */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2.5">الخدمات الرئيسية</p>
          <div className="grid grid-cols-4 gap-2">
            {primaryServices.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.path}
                  onClick={() => setLocation(s.path)}
                  className="flex flex-col items-center gap-1.5 p-3 bg-card border border-border rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all"
                  data-testid={`service-simple-${s.path.replace(/\//g, '-')}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground text-center leading-tight">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary services */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2.5">خدمات أخرى</p>
          <Card>
            <CardContent className="p-0">
              {secondaryServices.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.path}
                    onClick={() => setLocation(s.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors text-right ${
                      idx < secondaryServices.length - 1 ? "border-b border-border/60" : ""
                    }`}
                    data-testid={`service-simple-sec-${s.path.replace(/\//g, '-')}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-foreground/70" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{s.label}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Manager services */}
        {isManager && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2.5">إدارة النظام</p>
            <Card>
              <CardContent className="p-0">
                {managerServices.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.path}
                      onClick={() => setLocation(s.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-purple-50 dark:hover:bg-purple-500/5 transition-colors text-right ${
                        idx < managerServices.length - 1 ? "border-b border-border/60" : ""
                      }`}
                      data-testid={`service-simple-mgr-${s.path.replace(/\//g, '-')}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-muted-foreground">الإشعارات</p>
            {notifications.length > 0 && (
              <Badge variant="secondary" className="text-xs">{notifications.length}</Badge>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
              <Bell className="w-8 h-8 opacity-25" />
              <p className="text-xs">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 6).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 bg-card border border-border rounded-xl p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => notif.actionLink && setLocation(notif.actionLink)}
                  data-testid={`notif-simple-${notif.id}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    {notif.type === 'order' && <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />}
                    {notif.type === 'kitchen' && <ChefHat className="w-3.5 h-3.5 text-orange-500" />}
                    {notif.type === 'leave' && notif.status === 'approved' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                    {notif.type === 'leave' && notif.status === 'rejected' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                    {notif.type === 'leave' && notif.status === 'pending' && <Clock className="w-3.5 h-3.5 text-yellow-500" />}
                    {notif.type === 'manager' && <BarChart3 className="w-3.5 h-3.5 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
