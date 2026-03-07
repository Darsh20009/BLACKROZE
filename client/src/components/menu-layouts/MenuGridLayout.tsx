import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ShoppingCart, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CoffeeItem } from "@shared/schema";

interface Category {
  id: string;
  name: string;
  icon: any;
}

interface MenuGridLayoutProps {
  sortedFilteredItems: CoffeeItem[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleAddToCartDirect: (item: CoffeeItem) => void;
  totalItems: number;
  totalPrice: string;
  onViewCart: () => void;
  t: any;
  i18n: any;
}

export function MenuGridLayout({
  sortedFilteredItems,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  handleAddToCartDirect,
  totalItems,
  totalPrice,
  onViewCart,
  t,
  i18n,
}: MenuGridLayoutProps) {
  const itemName = (item: CoffeeItem) =>
    i18n.language === "ar" ? item.nameAr : item.nameEn || item.nameAr;

  return (
    <div className="min-h-screen bg-background pb-28" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute ${i18n.language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("menu.search_placeholder") || "ابحث..."}
            className={`w-full h-10 ${i18n.language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"} bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20`}
            data-testid="input-search-grid"
          />
        </div>
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow"
                  : "bg-muted/40 border-border text-foreground/70 hover:border-primary/30"
              }`}
              data-testid={`button-category-grid-${cat.id}`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">
          {selectedCategory === "all" ? (t("menu.all_items") || "جميع المنتجات") : categories.find(c => c.id === selectedCategory)?.name || ""}
        </h2>
        <Badge variant="secondary" className="text-xs">{sortedFilteredItems.length}</Badge>
      </div>

      {/* 3-column Square Grid */}
      <div className="px-3">
        <AnimatePresence mode="popLayout">
          {sortedFilteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3"
            >
              <Coffee className="w-12 h-12 opacity-30" />
              <p className="text-sm">{t("menu.no_items") || "لا توجد عناصر"}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {sortedFilteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                  onClick={() => handleAddToCartDirect(item)}
                  data-testid={`card-grid-${item.id}`}
                >
                  {/* Square Image */}
                  <div className="aspect-square w-full overflow-hidden bg-muted/30 relative">
                    <img
                      src={item.imageUrl}
                      alt={itemName(item)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-coffee.png";
                      }}
                    />
                    {(item as any).isAvailable === false && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded-full">غير متاح</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">{itemName(item)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-xs">{item.price}</span>
                      <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                        <Plus className="w-3 h-3 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating cart */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-5 inset-x-4 z-50"
        >
          <Button
            onClick={onViewCart}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl flex items-center justify-between px-5"
            data-testid="button-view-cart-grid"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="font-bold">{totalItems} {t("menu.items") || "عناصر"}</span>
            </div>
            <span className="font-bold">{totalPrice} {t("currency") || "ر.س"}</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
