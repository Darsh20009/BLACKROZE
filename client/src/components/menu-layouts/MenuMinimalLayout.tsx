import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ShoppingCart, Coffee, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoffeeItem } from "@shared/schema";

interface Category {
  id: string;
  name: string;
  icon: any;
}

interface MenuMinimalLayoutProps {
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

export function MenuMinimalLayout({
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
}: MenuMinimalLayoutProps) {
  const itemName = (item: CoffeeItem) =>
    i18n.language === "ar" ? item.nameAr : item.nameEn || item.nameAr;

  const isRtl = i18n.language === "ar";

  return (
    <div className="min-h-screen bg-background pb-28" dir={isRtl ? "rtl" : "ltr"}>
      {/* Compact top bar */}
      <div className="sticky top-0 z-30 bg-background/98 backdrop-blur border-b border-border/50">
        {/* Search */}
        <div className="px-4 pt-3 pb-2 relative">
          <Search className={`absolute ${isRtl ? "right-7" : "left-7"} top-1/2 translate-y-0.5 w-4 h-4 text-muted-foreground`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("menu.search_placeholder") || "ابحث عن مشروبك..."}
            className={`w-full h-9 ${isRtl ? "pr-9 pl-4" : "pl-9 pr-4"} bg-muted/40 border-0 rounded-lg text-sm focus:outline-none focus:bg-muted/70 transition-colors`}
            data-testid="input-search-minimal"
          />
        </div>

        {/* Scrollable tab categories */}
        <div className="flex gap-0 overflow-x-auto no-scrollbar border-t border-border/30">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                selectedCategory === cat.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`button-category-minimal-${cat.id}`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items list */}
      <div className="divide-y divide-border/50">
        <AnimatePresence mode="popLayout">
          {sortedFilteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground"
            >
              <Coffee className="w-10 h-10 opacity-20" />
              <p className="text-sm">{t("menu.no_items") || "لا توجد عناصر"}</p>
            </motion.div>
          ) : (
            sortedFilteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-muted/30 hover:bg-muted/20 transition-colors group"
                onClick={() => handleAddToCartDirect(item)}
                data-testid={`card-minimal-${item.id}`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={itemName(item)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-coffee.png";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{itemName(item)}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
                  )}
                  <p className="text-primary font-bold text-sm mt-1">
                    {item.price} <span className="text-xs font-normal text-muted-foreground">{t("currency") || "ر.س"}</span>
                  </p>
                </div>

                {/* Add button */}
                <button
                  className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-colors group-hover:bg-primary shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCartDirect(item);
                  }}
                  data-testid={`button-add-minimal-${item.id}`}
                >
                  <Plus className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                </button>

                {/* Chevron indicator */}
                <ChevronLeft className={`w-4 h-4 text-border group-hover:text-primary transition-colors ${isRtl ? "" : "rotate-180"}`} />
              </motion.div>
            ))
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
            data-testid="button-view-cart-minimal"
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
