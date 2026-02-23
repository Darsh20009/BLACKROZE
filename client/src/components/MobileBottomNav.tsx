import { useLocation, Link } from "wouter";
import { Home, ClipboardList, CreditCard, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Coffee, ChefHat, Users, Settings, BarChart3, Wallet, Warehouse, 
  Table, ShoppingCart, Calendar, FileText, Utensils, Eye 
} from "lucide-react";

interface MobileBottomNavProps {
  employeeRole?: string;
  onLogout?: () => void;
}

export function MobileBottomNav({ employeeRole, onLogout }: MobileBottomNavProps) {
  const [location] = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const resolvedRole = employeeRole || (() => {
    try {
      const stored = localStorage.getItem("currentEmployee");
      if (stored) return JSON.parse(stored).role;
    } catch {}
    return '';
  })();

  const isManager = ['manager', 'owner', 'admin'].includes(resolvedRole || '');

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("currentEmployee");
      localStorage.removeItem("cluny-restore-key");
      window.location.href = "/employee/gateway";
    }
  };

  const allPages = [
    { path: "/employee/home", icon: Home, label: "الرئيسية" },
    { path: "/employee/dashboard", icon: BarChart3, label: "لوحة التحكم" },
    { path: "/employee/pos", icon: CreditCard, label: "نقطة البيع" },
    { path: "/employee/orders", icon: ClipboardList, label: "الطلبات" },
    { path: "/employee/cashier", icon: ShoppingCart, label: "الكاشير" },
    { path: "/employee/kitchen", icon: ChefHat, label: "المطبخ" },
    { path: "/employee/table-orders", icon: Table, label: "الطاولات" },
    { path: "/employee/loyalty", icon: Users, label: "الولاء" },
    { path: "/employee/attendance", icon: Calendar, label: "الحضور" },
    { path: "/employee/leave-request", icon: FileText, label: "إجازة" },
    ...(isManager ? [
      { path: "/employee/menu-management", icon: Coffee, label: "المشروبات" },
      { path: "/employee/menu-management?type=food", icon: Utensils, label: "المأكولات" },
      { path: "/admin/settings", icon: Settings, label: "الإعدادات" },
      { path: "/manager/accounting", icon: Wallet, label: "المحاسبة" },
      { path: "/manager/inventory", icon: Warehouse, label: "المخزون" },
    ] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background border-t shadow-lg" dir="rtl">
      <div className="flex items-center justify-around px-1 py-1.5">
        <Link href="/employee/home">
          <button className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] ${location === '/employee/home' ? 'text-primary font-bold' : 'text-muted-foreground'}`} data-testid="mobile-nav-home">
            <Home className="h-5 w-5" />
            <span>الرئيسية</span>
          </button>
        </Link>
        <Link href="/employee/orders">
          <button className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] ${location === '/employee/orders' ? 'text-primary font-bold' : 'text-muted-foreground'}`} data-testid="mobile-nav-orders">
            <ClipboardList className="h-5 w-5" />
            <span>الطلبات</span>
          </button>
        </Link>
        <Link href="/employee/pos">
          <button className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] ${location === '/employee/pos' ? 'text-primary font-bold' : 'text-muted-foreground'}`} data-testid="mobile-nav-pos">
            <CreditCard className="h-5 w-5" />
            <span>نقطة البيع</span>
          </button>
        </Link>
        
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] text-muted-foreground" data-testid="mobile-nav-menu">
              <Menu className="h-5 w-5" />
              <span>المزيد</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl" dir="rtl">
            <SheetHeader>
              <SheetTitle className="text-right">القائمة</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-3 py-4 overflow-y-auto">
              {allPages.map((item) => {
                const Icon = item.icon;
                const fullPath = location + window.location.search;
                const isActive = item.path.includes('?')
                  ? fullPath === item.path
                  : location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <button 
                      onClick={() => setShowMenu(false)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl w-full transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                      data-testid={`mobile-menu-${item.path.split('/').pop()}`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
            <div className="border-t pt-4 mt-2">
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogout}
                data-testid="mobile-menu-logout"
              >
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}