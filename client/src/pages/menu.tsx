import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PWAInstallButton } from "@/components/pwa-install";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLocation } from "wouter";
import { Coffee, ShoppingCart, Flame, Snowflake, Star, Cake, User, Plus, Search, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import clunyLogo from "@/assets/cluny-logo.png";
import type { CoffeeItem, IProductAddon } from "@shared/schema";
import { AddToCartModal } from "@/components/add-to-cart-modal";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuPage() {
  const { cartItems, addToCart } = useCartStore();
  const { isAuthenticated, customer } = useCustomer();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<CoffeeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrollingFromNav, setIsScrollingFromNav] = useState(false);

  // Scroll spy logic
  useEffect(() => {
    if (isScrollingFromNav) return;

    const handleScroll = () => {
      const sections = categories.filter(c => c.id !== "all").map(cat => ({
        id: cat.id,
        element: document.getElementById(`category-${cat.id}`)
      }));

      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        if (section.element) {
          const offsetTop = section.element.offsetTop;
          const height = section.element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
            setSelectedCategory(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrollingFromNav]);

  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      setIsScrollingFromNav(true);
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      setTimeout(() => setIsScrollingFromNav(false), 1000);
    }
  };

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
    queryFn: async () => {
      const res = await fetch("/api/coffee-items");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
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

  // Group items by base name (first word or manually specified)
  const groupedItems = coffeeItems.reduce((acc: Record<string, CoffeeItem[]>, item) => {
    // Normalize base name: use nameAr directly for grouping or first word
    // Logic: "V60" and "V60 M" both start with "V60"
    const baseName = item.nameAr.trim().split(/\s+/)[0];
    if (!acc[baseName]) acc[baseName] = [];
    acc[baseName].push(item);
    return acc;
  }, {});

  // For display, we use the first item of each group as representative
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
      // If grouped, show the first variant but modal should handle selection
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
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 h-16 flex items-center justify-between shadow-sm">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img src={clunyLogo} className="w-10 h-10 rounded-2xl shadow-md border-2 border-background" alt="Logo" />
          </div>
          <div>
            <h1 className="font-amiri text-xl font-black leading-none text-primary">CLUNY</h1>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Premium Coffee</span>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={() => setLocation("/my-card")} className="h-10 w-10 bg-primary/5 rounded-xl">
              <QrCode className="w-5 h-5 text-primary" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setLocation("/cart")} className="relative h-10 w-10 bg-primary/10 rounded-xl">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full border-2 border-background"
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
              // Ensure we check both context and localStorage for maximum robustness
              const storedCustomer = localStorage.getItem("qahwa-customer") || localStorage.getItem("currentCustomer");
              if (isAuthenticated || customer || storedCustomer) {
                setLocation("/profile");
              } else {
                setLocation("/auth");
              }
            }} 
            className="h-10 w-10 bg-muted rounded-xl"
            data-testid="button-user-profile"
          >
            <User className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-8">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="ابحث عن مشروبك المفضل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pr-10 pl-4 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* Categories - Compact Chips */}
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border -mx-4 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat, idx) => (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  selectedCategory === cat.id 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                <cat.icon className={`w-3.5 h-3.5 ${selectedCategory === cat.id ? "text-primary-foreground" : "text-primary"}`} />
                {cat.nameAr}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        <section className="space-y-4 overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-amiri text-2xl font-black flex items-center gap-2">
              الأكثر مبيعاً <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </h2>
          </div>
          
          <div className="relative flex overflow-x-hidden group">
            <motion.div 
              className="flex gap-4 py-4 whitespace-nowrap"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
              whileHover={{ transition: { duration: 0.5 }, opacity: 0.9 }}
            >
              {[...representativeItems, ...representativeItems, ...representativeItems, ...representativeItems].map((item, idx) => (
                <motion.div 
                  key={`${item.id}-${idx}`} 
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 w-[160px] bg-card rounded-[2rem] border border-border p-3 space-y-3 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden cursor-pointer"
                  onClick={() => handleAddToCartDirect(item)}
                >
                  <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-muted">
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      src={item.imageUrl} 
                      className="w-full h-full object-cover transition-transform duration-700" 
                      alt={item.nameAr} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-coffee.png";
                      }}
                    />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-xs font-black truncate">{item.nameAr}</h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-black text-primary">{item.price} <small className="text-[10px] font-normal">ر.س</small></span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Gradient Overlays for smooth fade effect */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          </div>
        </section>

        {/* Full Menu */}
        <section className="space-y-8">
          <h2 className="font-amiri text-2xl font-black px-1">قائمة المشروبات</h2>
          
          {categories.filter(c => c.id !== "all").map((category) => (
            <div key={category.id} id={`category-${category.id}`} className="space-y-4 scroll-mt-40">
              <h3 className="font-amiri text-xl font-bold px-1 flex items-center gap-2">
                <category.icon className="w-5 h-5 text-primary" />
                {category.nameAr}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {representativeItems
                    .filter(item => item.category === category.id)
                    .map((item) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        key={item.id} 
                        className="bg-card rounded-3xl border border-border p-2.5 flex gap-4 items-center shadow-sm hover:shadow-md active:scale-98 transition-all group cursor-pointer"
                        onClick={() => handleAddToCartDirect(item)}
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                          <img 
                            src={item.imageUrl} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt={item.nameAr} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder-coffee.png";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black truncate text-foreground leading-tight mb-1">{item.nameAr}</h3>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mb-2">تجربة غنية ومميزة</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-black text-primary">{item.price} <small className="text-[9px] font-normal">ر.س</small></p>
                            <div className="bg-primary/10 p-1.5 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <Plus className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </section>
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
            title: "تمت الإضافة 🎉", 
            description: `تم إضافة ${selectedItem?.nameAr} إلى سلتك بنجاح`,
            className: "bg-card border-primary/20 text-foreground font-bold"
          });
        }}
      />

      {/* Floating Cart Summary */}
      {totalItems > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 inset-x-4 z-50"
        >
          <Button 
            onClick={() => setLocation("/cart")}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <div className="bg-background/20 p-2 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold opacity-80 leading-none">عرض السلة</p>
                <p className="text-sm font-black">{totalItems} منتجات</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">
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
