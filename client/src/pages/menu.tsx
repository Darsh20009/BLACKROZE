import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PWAInstallButton } from "@/components/pwa-install";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLocation } from "wouter";
import { Coffee, ShoppingCart, Flame, Snowflake, Star, Cake, User, Plus, Search, QrCode, ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import clunyLogo from "@assets/cluny-logo-customer.png";
import bannerImage1 from "@assets/banner-coffee-1.png";
import bannerImage2 from "@assets/banner-coffee-2.png";
import type { CoffeeItem, IProductAddon } from "@shared/schema";
import { AddToCartModal } from "@/components/add-to-cart-modal";
import { motion, AnimatePresence } from "framer-motion";

const bannerSlides = [
  {
    image: bannerImage1,
    title: "قهوة استثنائية",
    subtitle: "اكتشف نكهات مميزة من أجود حبوب البن",
    badge: "عروض خاصة"
  },
  {
    image: bannerImage2,
    title: "لحظات لا تُنسى",
    subtitle: "استمتع بتجربة قهوة فريدة معنا",
    badge: "جديد"
  }
];

export default function MenuPage() {
  const { cartItems, addToCart } = useCartStore();
  const { isAuthenticated, customer } = useCustomer();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<CoffeeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const { data: allAddons = [] } = useQuery<IProductAddon[]>({
    queryKey: ["/api/product-addons"],
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { id: "all", nameAr: "الكل", icon: Coffee },
    { id: "hot", nameAr: "ساخن", icon: Flame },
    { id: "cold", nameAr: "بارد", icon: Snowflake },
    { id: "specialty", nameAr: "مميز", icon: Star },
    { id: "desserts", nameAr: "حلويات", icon: Cake },
  ];

  const groupedItems = coffeeItems.reduce((acc: Record<string, CoffeeItem[]>, item) => {
    const baseName = item.nameAr.trim().split(/\s+/)[0];
    if (!acc[baseName]) acc[baseName] = [];
    acc[baseName].push(item);
    return acc;
  }, {});

  const representativeItems = Object.values(groupedItems).map(group => group[0]);

  const filteredItems = representativeItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.nameAr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCartDirect = (item: CoffeeItem) => {
    const baseName = item.nameAr.trim().split(/\s+/)[0];
    const group = groupedItems[baseName] || [item];
    const hasMultipleVariants = group.length > 1;
    const hasSizes = item.availableSizes && item.availableSizes.length > 0;
    const hasAddons = allAddons.filter(a => a.isAvailable === 1).length > 0;

    if (hasMultipleVariants || hasSizes || hasAddons) {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      addToCart((item as any).id || (item as any)._id, 1, "default", []);
      toast({
        title: "تمت الإضافة",
        description: `تم إضافة ${item.nameAr} إلى السلة`,
      });
    }
  };

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Coffee className="w-10 h-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24 font-sans overflow-x-hidden text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={clunyLogo} className="w-9 h-9 rounded-xl border border-border" alt="Logo" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-primary">CLUNY</h1>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Premium Coffee</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={() => setLocation("/my-card")} className="h-9 w-9 rounded-xl bg-primary/5">
              <QrCode className="w-4 h-4 text-primary" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setLocation("/cart")} className="relative h-9 w-9 rounded-xl bg-primary/10">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              const storedCustomer = localStorage.getItem("qahwa-customer") || localStorage.getItem("currentCustomer");
              if (isAuthenticated || customer || storedCustomer) {
                setLocation("/profile");
              } else {
                setLocation("/auth");
              }
            }} 
            className="h-9 w-9 rounded-xl bg-secondary"
            data-testid="button-user-profile"
          >
            <User className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        <div ref={bannerRef} className="relative w-full overflow-hidden">
          <div className="relative h-[220px] sm:h-[260px] md:h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBannerIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="relative h-full w-full">
                  <img 
                    src={bannerSlides[currentBannerIndex].image} 
                    alt={bannerSlides[currentBannerIndex].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <Badge className="mb-3 bg-accent text-white border-0 px-3 py-1">
                      {bannerSlides[currentBannerIndex].badge}
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                      {bannerSlides[currentBannerIndex].title}
                    </h2>
                    <p className="text-sm sm:text-base opacity-90 max-w-md">
                      {bannerSlides[currentBannerIndex].subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button 
              onClick={prevBanner}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              data-testid="button-prev-banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextBanner}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              data-testid="button-next-banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {bannerSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentBannerIndex ? "w-6 bg-white" : "bg-white/50"
                  }`}
                  data-testid={`button-banner-dot-${idx}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          <div className="flex items-center gap-4 bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">الرياض</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">مفتوح الآن</span>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="ابحث عن مشروبك المفضل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 pl-4 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              data-testid="input-search"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  selectedCategory === cat.id 
                    ? "bg-primary text-primary-foreground border-primary shadow-md" 
                    : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-secondary/50"
                }`}
                data-testid={`button-category-${cat.id}`}
              >
                <cat.icon className={`w-4 h-4 ${selectedCategory === cat.id ? "text-primary-foreground" : "text-primary"}`} />
                {cat.nameAr}
              </button>
            ))}
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">الأكثر مبيعاً</h2>
              <Button variant="ghost" size="sm" className="text-primary text-sm">
                عرض الكل
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-2">
              {representativeItems.slice(0, 6).map((item) => (
                <motion.div 
                  key={item.id} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-shrink-0 w-[140px] snap-start bg-card rounded-2xl border border-border p-3 space-y-3 shadow-sm cursor-pointer group"
                  onClick={() => handleAddToCartDirect(item)}
                  data-testid={`card-featured-${item.id}`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary">
                    <img 
                      src={item.imageUrl} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={item.nameAr} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-coffee.png";
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold truncate text-foreground">{item.nameAr}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">{item.price} <small className="text-xs font-normal text-muted-foreground">ر.س</small></span>
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                        <Plus className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">قائمة المشروبات</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="bg-card rounded-2xl border border-border p-3 flex gap-4 items-center shadow-sm cursor-pointer group"
                    onClick={() => handleAddToCartDirect(item)}
                    data-testid={`card-menu-${item.id}`}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                      <img 
                        src={item.imageUrl} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        alt={item.nameAr} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-coffee.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-base font-semibold truncate text-foreground mb-1">{item.nameAr}</h3>
                      <p className="text-xs text-muted-foreground truncate mb-2">{item.description || "قهوة مميزة"}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold text-lg">{item.price} <small className="text-xs font-normal text-muted-foreground">ر.س</small></span>
                        <Button 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-lg bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCartDirect(item);
                          }}
                          data-testid={`button-add-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      <AddToCartModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variants={selectedItem ? (groupedItems[selectedItem.nameAr.trim().split(/\s+/)[0]] || [selectedItem]) : []}
        onAddToCart={(data) => {
          (addToCart as any)(data);
          setIsModalOpen(false);
          toast({ 
            title: "تمت الإضافة", 
            description: `تم إضافة ${selectedItem?.nameAr} إلى سلتك بنجاح`,
            className: "bg-card border-primary/20 text-foreground font-medium"
          });
        }}
      />

      {totalItems > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 inset-x-4 z-50"
        >
          <Button 
            onClick={() => setLocation("/cart")}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg flex items-center justify-between px-5"
            data-testid="button-view-cart"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium opacity-80">عرض السلة</p>
                <p className="text-sm font-bold">{totalItems} منتجات</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {cartItems.reduce((sum, i) => {
                  const price = (i as any).price || (i as any).coffeeItem?.price || 0;
                  return sum + price * i.quantity;
                }, 0)} ر.س
              </span>
            </div>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
