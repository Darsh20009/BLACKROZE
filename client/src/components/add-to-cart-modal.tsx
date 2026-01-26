import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { CoffeeItem, IProductAddon } from "@shared/schema";

interface AddToCartModalProps {
  item: CoffeeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (itemData: any) => void;
  variants?: CoffeeItem[];
}

export function AddToCartModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  variants = [],
}: AddToCartModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<CoffeeItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const { toast } = useToast();

  const resetModal = useCallback(() => {
    setQuantity(1);
    setSelectedSize(null);
    setSelectedAddons([]);
    setSelectedVariant(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen && item) {
      setSelectedVariant(item);
      setQuantity(1);
      setSelectedSize(null);
      setSelectedAddons([]);
    }
  }, [isOpen, item]);

  const activeItem = selectedVariant || item;

  const { data: allAddons = [] } = useQuery<IProductAddon[]>({
    queryKey: ["/api/product-addons"],
    enabled: isOpen && !!activeItem,
  });

  const itemAddons = useMemo(() => {
    if (!activeItem) return [];
    return allAddons.filter(addon => addon.isAvailable === 1);
  }, [activeItem, allAddons]);

  const handleAddToCart = () => {
    if (!activeItem) return;

    if (activeItem.availableSizes && activeItem.availableSizes.length > 0 && !selectedSize) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار حجم المشروب",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      coffeeItemId: activeItem.id,
      quantity,
      selectedSize: selectedSize || "default",
      selectedAddons: selectedAddons,
    };

    onAddToCart(cartItem);
    resetModal();
  };

  if (!activeItem) return null;

  const totalPrice =
    (selectedSize
      ? activeItem.availableSizes?.find((s) => s.nameAr === selectedSize)?.price ??
        activeItem.price
      : activeItem.price) * quantity +
    selectedAddons.reduce((sum, addonId) => {
      const addon = allAddons.find((a) => a.id === addonId);
      return sum + (addon?.price ?? 0);
    }, 0) * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetModal()}>
      <DialogContent className="max-w-sm bg-background border border-border rounded-2xl p-0 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
          {activeItem.imageUrl && (
            <img 
              src={activeItem.imageUrl.startsWith('/') ? activeItem.imageUrl : `/${activeItem.imageUrl}`} 
              alt={activeItem.nameAr} 
              className="w-24 h-24 rounded-xl object-cover border-4 border-background shadow-lg"
            />
          )}
        </div>
        
        <div className="px-4 pb-4 space-y-4">
          <DialogHeader className="pt-2">
            <DialogTitle className="text-xl font-bold text-center text-foreground">
              {activeItem.nameAr}
            </DialogTitle>
            {activeItem.description && (
              <p className="text-xs text-muted-foreground text-center line-clamp-2 mt-1">
                {activeItem.description}
              </p>
            )}
          </DialogHeader>

          {variants.length > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">اختر النوع</Label>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setSelectedSize(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedVariant?.id === variant.id 
                        ? "bg-primary text-white shadow-md" 
                        : "bg-secondary text-foreground border border-border hover:border-primary/50"
                    }`}
                  >
                    {variant.nameAr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeItem.availableSizes && activeItem.availableSizes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">اختر الحجم</Label>
              <div className="grid grid-cols-3 gap-2">
                {activeItem.availableSizes.map((size) => (
                  <button
                    key={size.nameAr}
                    onClick={() => setSelectedSize(size.nameAr)}
                    className={`p-2 rounded-xl text-center transition-all ${
                      selectedSize === size.nameAr
                        ? "bg-primary text-white shadow-md"
                        : "bg-secondary border border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xs font-semibold">{size.nameAr}</div>
                    <div className={`text-xs mt-0.5 ${selectedSize === size.nameAr ? "text-white/80" : "text-primary font-bold"}`}>
                      {size.price} ر.س
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {itemAddons.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">إضافات</Label>
              <div className="flex flex-wrap gap-2">
                {itemAddons.slice(0, 4).map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => {
                      setSelectedAddons((prev) =>
                        prev.includes(addon.id)
                          ? prev.filter((id) => id !== addon.id)
                          : [...prev, addon.id]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      selectedAddons.includes(addon.id)
                        ? "bg-accent text-white shadow-md"
                        : "bg-secondary text-foreground border border-border hover:border-accent/50"
                    }`}
                  >
                    {addon.nameAr}
                    <span className={selectedAddons.includes(addon.id) ? "text-white/80" : "text-accent"}>
                      +{addon.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-3">
            <Label className="text-sm font-semibold text-foreground">الكمية</Label>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 rounded-lg border-border"
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-6 text-center font-bold text-lg text-foreground">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 rounded-lg border-border"
                data-testid="button-increase-quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs text-muted-foreground">الإجمالي</span>
              <div className="text-2xl font-bold text-primary">
                {totalPrice.toFixed(2)} <span className="text-sm">ر.س</span>
              </div>
            </div>
            <Button
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-5 rounded-xl font-bold shadow-lg"
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-4 h-4 ml-2" />
              إضافة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
