import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, ShoppingCart, User, CreditCard, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface CustomerLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  title?: string;
}

export function CustomerLayout({ 
  children, 
  showNav = true, 
  showHeader = false,
  title 
}: CustomerLayoutProps) {
  const [location] = useLocation();
  const { cartItems, showCart } = useCartStore();
  const { t, i18n } = useTranslation();
  const cartItemCount = cartItems.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);

  const navItems = [
    { path: "/menu", icon: Home, label: t("nav.menu") || "القائمة", testId: "nav-menu" },
    { path: "/my-orders", icon: ClipboardList, label: t("nav.my_orders") || "طلباتي", testId: "nav-my-orders" },
    { path: "/my-card", icon: CreditCard, label: t("nav.my_card") || "بطاقتي", testId: "nav-my-card" },
    { path: "/profile", icon: User, label: t("nav.profile") || "حسابي", testId: "nav-profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {showHeader && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container flex h-14 items-center justify-between gap-2">
            <h1 className="text-lg font-semibold">{title}</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={showCart}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </header>
      )}

      <main className="flex-1 pb-20">
        {children}
      </main>

      <footer className="bg-muted/30 py-8 border-t mb-16">
        <div className="container px-4 flex flex-col items-center gap-6">
          <a 
            href="https://qr.saudibusiness.gov.sa/viewcr?nCrNumber=9AhyCS491ZPTmJxSxD96YA==" 
            target="_blank" 
            rel="noreferrer" 
            className="flex flex-col items-center gap-2 hover:scale-110 transition-transform text-center"
          >
            <img 
              src="https://assets.zid.store/themes/f9f0914d-3c58-493b-bd83-260ed3cb4e82/business_center.png" 
              loading="lazy" 
              alt="Saudi Business Center Certification" 
              className="h-12 w-auto object-contain" 
            />
            <div className="text-xs text-muted-foreground font-semibold">{t("legal.cr")}</div>
          </a>
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm font-bold text-primary">{t("legal.vat")}</div>
          </div>
          <div className="text-[10px] text-muted-foreground/60 text-center">
            &copy; {new Date().getFullYear()} BLACK ROSE. {t("legal.rights")}
          </div>
        </div>
      </footer>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="container flex h-16 items-center justify-around">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Button
                  key={item.path}
                  asChild
                  variant="ghost"
                  className={`flex flex-col gap-1 h-auto py-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  data-testid={item.testId}
                >
                  <Link href={item.path}>
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
            <Button
              variant="ghost"
              className="flex flex-col gap-1 h-auto py-2 text-muted-foreground relative"
              onClick={showCart}
              data-testid="nav-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">{t("nav.cart") || "السلة"}</span>
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -left-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
