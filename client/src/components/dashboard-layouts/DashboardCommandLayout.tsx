import { useLocation } from "wouter";
import { 
  Coffee, LogOut, ShoppingCart, ClipboardList, User, 
  BarChart3, Settings, Table, Clock, MonitorSmartphone, ChefHat, 
  Wallet, Warehouse, Eye, Bell, CheckCircle, AlertCircle, 
  Wifi, WifiOff, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface DashboardCommandLayoutProps {
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

const serviceItems = [
  { label: "الكاشير", desc: "استلام الطلبات", icon: Coffee, path: "/employee/mobile-cashier", variant: "primary" as const, roles: null },
  { label: "نقطة البيع", desc: "نظام POS", icon: Wallet, path: "/employee/pos", variant: "accent" as const, roles: null },
  { label: "إدارة الطلبات", desc: "عرض وتحديث", icon: ClipboardList, path: "/employee/orders", variant: "neutral" as const, roles: null },
  { label: "عرض الطلبات", desc: "شاشة حية", icon: MonitorSmartphone, path: "/employee/orders-display", variant: "neutral" as const, roles: null },
  { label: "المطبخ", desc: "تحضير الطلبات", icon: ChefHat, path: "/employee/kitchen", variant: "neutral" as const, roles: null },
  { label: "الحضور", desc: "تسجيل الوقت", icon: Clock, path: "/employee/attendance", variant: "neutral" as const, roles: null },
  { label: "المنيو", desc: "تحديث التوفر", icon: Settings, path: "/employee/menu-management", variant: "neutral" as const, roles: null },
  { label: "الطاولات", desc: "طلبات الطاولات", icon: Table, path: "/employee/table-orders", variant: "neutral" as const, roles: null },
  { label: "حجز طاولة", desc: "تخصيص الطاولات", icon: Table, path: "/employee/tables", variant: "neutral" as const, roles: null },
  { label: "المخزون", desc: "المواد الخام", icon: Warehouse, path: "/employee/inventory", variant: "manager" as const, roles: ["manager", "owner", "admin"] },
  { label: "لوحة المدير", desc: "إحصائيات", icon: BarChart3, path: "/manager/dashboard", variant: "manager" as const, roles: ["manager", "owner", "admin"] },
  { label: "الإعدادات", desc: "إعدادات النظام", icon: Settings, path: "/admin/settings", variant: "manager" as const, roles: ["manager", "owner", "admin"] },
  { label: "المحاسبة", desc: "المصروفات والإيرادات", icon: BarChart3, path: "/employee/accounting", variant: "manager" as const, roles: ["manager", "owner", "admin"] },
  { label: "الموظفون", desc: "إدارة الفريق", icon: User, path: "/admin/employees", variant: "manager" as const, roles: ["manager", "owner", "admin"] },
  { label: "عرض المنيو", desc: "شاشات العرض", icon: Eye, path: "/menu-view", variant: "manager" as const, roles: ["manager", "owner", "admin"] },
];

export function DashboardCommandLayout({
  employee,
  notifications,
  pendingOrdersCount,
  wsConnected,
  onLogout,
}: DashboardCommandLayoutProps) {
  const [, setLocation] = useLocation();
  const roleArabic = roleArabicMap[employee.role] || employee.role;
  const isManager = ["manager", "owner", "admin"].includes(employee.role);

  const visibleServices = serviceItems.filter(s => !s.roles || s.roles.includes(employee.role));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-[#111] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={blackroseLogoStaff} alt="BLACK ROSE" className="w-8 h-8 object-contain rounded-lg" />
          <div>
            <p className="text-xs text-white/50 leading-none">BLACK ROSE SYSTEMS</p>
            <p className="text-sm font-bold leading-tight">Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${wsConnected ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-red-500/40 text-red-400 bg-red-500/10"}`}>
            {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {wsConnected ? "متصل" : "منقطع"}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-red-400 transition-colors"
            data-testid="button-logout-command"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* Identity strip */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{employee.fullName}</p>
            <p className="text-xs text-white/50">{roleArabic} · {employee.username}</p>
          </div>
          {pendingOrdersCount > 0 && (
            <div className="flex items-center gap-1.5 bg-accent/20 border border-accent/40 rounded-xl px-3 py-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent font-bold text-sm">{pendingOrdersCount}</span>
              <span className="text-accent/70 text-xs">طلبات</span>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className="bg-primary/10 border border-primary/30 rounded-2xl p-3 cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => setLocation("/employee/orders")}
            data-testid="kpi-pending-orders"
          >
            <ShoppingCart className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-black text-primary">{pendingOrdersCount}</p>
            <p className="text-[11px] text-primary/60 mt-0.5">طلبات معلقة</p>
          </div>
          <div
            className="bg-white/5 border border-white/10 rounded-2xl p-3 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setLocation("/employee/notifications")}
            data-testid="kpi-notifications"
          >
            <Bell className="w-5 h-5 text-accent mb-2" />
            <p className="text-2xl font-black text-white">{notifications.length}</p>
            <p className="text-[11px] text-white/40 mt-0.5">إشعارات</p>
          </div>
          <div
            className="bg-white/5 border border-white/10 rounded-2xl p-3 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setLocation("/employee/attendance")}
            data-testid="kpi-role"
          >
            <User className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-sm font-black text-white truncate">{roleArabic}</p>
            <p className="text-[11px] text-white/40 mt-0.5">دورك اليوم</p>
          </div>
        </div>

        {/* Service grid */}
        <div>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">الخدمات</p>
          <div className="grid grid-cols-3 gap-2">
            {visibleServices.map((service) => {
              const Icon = service.icon;
              const isManagerOnly = !!service.roles;
              return (
                <button
                  key={service.path}
                  onClick={() => setLocation(service.path)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-3 h-[84px] transition-all border text-center ${
                    isManagerOnly
                      ? "bg-purple-500/10 border-purple-500/25 hover:bg-purple-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                  data-testid={`service-${service.path.replace(/\//g, '-')}`}
                >
                  <Icon className={`w-6 h-6 ${isManagerOnly ? "text-purple-400" : "text-white/70"}`} />
                  <div>
                    <p className={`text-[11px] font-bold leading-tight ${isManagerOnly ? "text-purple-300" : "text-white/80"}`}>{service.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent notifications */}
        {notifications.length > 0 && (
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">آخر الإشعارات</p>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/8 transition-colors"
                  onClick={() => notif.actionLink && setLocation(notif.actionLink)}
                  data-testid={`notif-command-${notif.id}`}
                >
                  {notif.type === 'order' && <ShoppingCart className="w-4 h-4 text-blue-400 shrink-0" />}
                  {notif.type === 'kitchen' && <ChefHat className="w-4 h-4 text-orange-400 shrink-0" />}
                  {notif.type === 'leave' && notif.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                  {notif.type === 'leave' && notif.status === 'rejected' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  {notif.type === 'leave' && notif.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400 shrink-0" />}
                  {notif.type === 'manager' && <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80 truncate">{notif.title}</p>
                    <p className="text-[11px] text-white/40 truncate">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}
