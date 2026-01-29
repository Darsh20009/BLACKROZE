import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PWAInstallButton } from "@/components/pwa-install";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLocation } from "wouter";
import { Coffee, ShoppingCart, Flame, Snowflake, Star, Cake, User, Plus, Search, QrCode, ChevronLeft, ChevronRight, MapPin, Clock, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import clunyLogo from "@assets/cluny-logo-customer.png";
import bannerImage1 from "@assets/banner-coffee-1.png";
import bannerImage2 from "@assets/banner-coffee-2.png";
import type { CoffeeItem, IProductAddon, IPromoOffer } from "@shared/schema";
import { AddToCartModal } from "@/components/add-to-cart-modal";
import { Tag, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export default function MenuPage() {
  const { cartItems, addToCart } = useCartStore();
  const { isAuthenticated, customer } = useCustomer();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<CoffeeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  const bannerSlides = [
    {
      image: bannerImage1,
      title: t("banner.1.title"),
      subtitle: t("banner.1.subtitle"),
      badge: t("banner.1.badge")
    },
    {
      image: bannerImage2,
      title: t("banner.2.title"),
      subtitle: t("banner.2.subtitle"),
      badge: t("banner.2.badge")
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerSlides.length]);

  const { data: coffeeItems = [], isLoading } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
  });

  const { data: allAddons = [] } = useQuery<IProductAddon[]>({
    queryKey: ["/api/product-addons"],
  });

  const { data: promoOffers = [] } = useQuery<IPromoOffer[]>({
    queryKey: ["/api/promo-offers"],
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { data: businessConfig } = useQuery<any>({
    queryKey: ["/api/business-config"],
  });

  const isBothModes = businessConfig?.activityType === "both";
  const [activeMode, setActiveMode] = useState<"drinks" | "food">("drinks");

  const categories = [
    { id: "all", name: t("menu.categories.all"), icon: Coffee },
    { id: "hot", name: t("menu.categories.hot"), icon: Flame },
    { id: "cold", name: t("menu.categories.cold"), icon: Snowflake },
    { id: "specialty", name: t("menu.categories.specialty"), icon: Star },
    { id: "desserts", name: t("menu.categories.desserts"), icon: Cake },
    ...(isBothModes ? [{ id: "food", name: t("menu.categories.food") || "المأكولات", icon: Utensils }] : []),
  ];

  // Group items by groupId if exists, otherwise treat as individual items
  const groupedItems = coffeeItems.reduce((acc: Record<string, CoffeeItem[]>, item) => {
    const groupKey = (item as any).groupId || `single_${(item as any).id || (item as any)._id}`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  const representativeItems = Object.values(groupedItems).map(group => group[0]);

  const drinkCategories = ['basic', 'hot', 'cold', 'specialty', 'desserts'];
  const foodCategoryIds = ['appetizers', 'main_courses', 'sandwiches', 'salads', 'breakfast', 'pastries'];

  const filteredItems = representativeItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const name = i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const itemMenuType = (item as any).menuType || 'drinks';
    const matchesMode = !isBothModes || (
      activeMode === "drinks" 
        ? (itemMenuType === 'drinks' || drinkCategories.includes(item.category))
        : (itemMenuType === 'food' || foodCategoryIds.includes(item.category))
    );
    
    return matchesCategory && matchesSearch && matchesMode;
  });

  const handleAddToCartDirect = (item: CoffeeItem) => {
    const name = i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr;
    const groupKey = (item as any).groupId || `single_${(item as any).id || (item as any)._id}`;
    const group = groupedItems[groupKey] || [item];
    const hasMultipleVariants = group.length > 1;
    const hasSizes = item.availableSizes && item.availableSizes.length > 0;
    const hasAddons = allAddons.filter(a => a.isAvailable === 1).length > 0;

    if (hasMultipleVariants || hasSizes || hasAddons) {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      addToCart((item as any).id || (item as any)._id, 1, "default", []);
      toast({
        title: t("menu.added_to_cart"),
        description: t("menu.added_to_cart_desc", { name }),
      });
    }
  };

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    // document.documentElement updates are now handled globally in App.tsx
  };

  if (isLoading) {
    return (
      <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-background flex items-center justify-center">
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
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-background pb-24 font-sans overflow-x-hidden text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={clunyLogo} className="w-10 h-10 rounded-2xl border-2 border-white/30 shadow-lg backdrop-blur-xl bg-[#a7b0b1]/30" alt="Logo" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-white drop-shadow-md">{t("app.name")}</h1>
            <span className="text-[9px] text-white/80 font-medium uppercase tracking-wider">{t("app.tagline")}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLanguage} 
            className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/20"
          >
            <Languages className="w-4 h-4 text-white" />
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={() => setLocation("/my-card")} className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/20">
              <QrCode className="w-4 h-4 text-white" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setLocation("/cart")} className="relative h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/20">
            <ShoppingCart className="w-4 h-4 text-white" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full border-2 border-white/50"
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
            className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/20"
            data-testid="button-user-profile"
          >
            <User className="w-4 h-4 text-white" />
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        <div ref={bannerRef} className="relative w-full overflow-hidden">
          <div className="relative h-[280px] sm:h-[320px] md:h-[380px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBannerIndex}
                initial={{ opacity: 0, x: i18n.language === 'ar' ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: i18n.language === 'ar' ? -100 : 100 }}
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
                  
                  <div className={`absolute bottom-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} left-0 right-0 p-6 text-white`}>
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
              className={`absolute ${i18n.language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors`}
              data-testid="button-prev-banner"
            >
              {i18n.language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button 
              onClick={nextBanner}
              className={`absolute ${i18n.language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors`}
              data-testid="button-next-banner"
            >
              {i18n.language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
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
          {isBothModes && (
            <div className="flex p-1 bg-secondary/30 rounded-2xl">
              <button
                onClick={() => setActiveMode("drinks")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeMode === "drinks" ? "bg-primary text-white shadow-lg" : "text-muted-foreground"
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>{t("menu.mode.drinks") || "المشروبات"}</span>
              </button>
              <button
                onClick={() => setActiveMode("food")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeMode === "food" ? "bg-primary text-white shadow-lg" : "text-muted-foreground"
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>{t("menu.mode.food") || "المأكولات"}</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t("location.riyadh")}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">{t("status.open")}</span>
            </div>
          </div>

          {promoOffers.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold text-foreground">{t("menu.offers") || "عروضنا"}</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-2">
                {promoOffers.map((offer) => (
                  <motion.div 
                    key={offer.id} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0 w-[200px] snap-start bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl border-2 border-accent/30 p-3 space-y-3 shadow-sm cursor-pointer group relative overflow-hidden"
                    data-testid={`card-offer-${offer.id}`}
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-accent text-white border-0 px-2 py-0.5 text-[10px]">
                        <Tag className="w-3 h-3 ml-1" />
                        {t("menu.offer_badge") || "عرض"}
                      </Badge>
                    </div>
                    {offer.imageUrl && (
                      <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
                        <img 
                          src={offer.imageUrl} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          alt={i18n.language === 'ar' ? offer.nameAr : offer.nameEn || offer.nameAr} 
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-semibold text-foreground">{i18n.language === 'ar' ? offer.nameAr : offer.nameEn || offer.nameAr}</h3>
                      {offer.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{offer.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-accent font-bold">{offer.offerPrice} <small className="text-xs font-normal">{t("currency")}</small></span>
                        <span className="text-xs text-muted-foreground line-through">{offer.originalPrice} {t("currency")}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <div className="relative group">
            <Search className={`absolute ${i18n.language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors`} />
            <input 
              type="text"
              placeholder={t("menu.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-12 ${i18n.language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm`}
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
                {cat.name}
              </button>
            ))}
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{t("menu.featured")}</h2>
              <Button variant="ghost" size="sm" className="text-primary text-sm">
                {t("menu.view_all")}
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
                      alt={i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-coffee.png";
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold truncate text-foreground">{i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">{item.price} <small className="text-xs font-normal text-muted-foreground">{t("currency")}</small></span>
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
            <h2 className="text-xl font-bold text-foreground">{t("menu.all_items")}</h2>
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
                        alt={i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-coffee.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-base font-semibold truncate text-foreground mb-1">{i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr}</h3>
                      <p className="text-xs text-muted-foreground truncate mb-2">{item.description || t("menu.default_desc")}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold text-lg">{item.price} <small className="text-xs font-normal text-muted-foreground">{t("currency")}</small></span>
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
        variants={selectedItem ? (groupedItems[(selectedItem as any).groupId || `single_${(selectedItem as any).id || (selectedItem as any)._id}`] || [selectedItem]) : []}
        onAddToCart={(data) => {
          addToCart(data.coffeeItemId, data.quantity, data.selectedSize, data.selectedAddons);
          setIsModalOpen(false);
          toast({ 
            title: t("menu.added_to_cart"), 
            description: t("menu.added_to_cart_desc", { name: i18n.language === 'ar' ? selectedItem?.nameAr : selectedItem?.nameEn || selectedItem?.nameAr }),
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
                <p className="text-xs font-medium opacity-80">{t("menu.view_cart")}</p>
                <p className="text-sm font-bold">{t("menu.items_count", { count: totalItems })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {cartItems.reduce((sum, i) => {
                  const price = (i as any).price || (i as any).coffeeItem?.price || 0;
                  return sum + price * i.quantity;
                }, 0)} {t("currency")}
              </span>
            </div>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
