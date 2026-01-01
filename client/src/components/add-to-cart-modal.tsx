import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Checkbox,
} from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Plus, Minus, ShoppingCart, Coffee } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CoffeeItem, IProductAddon } from "@shared/schema";

interface AddToCartModalProps {
  item: CoffeeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (itemData: any) => void;
}

export function AddToCartModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: allAddons = [] } = useQuery<IProductAddon[]>({
    queryKey: ["/api/product-addons"],
    enabled: isOpen && !!item,
  });

  const itemAddons = useMemo(() => {
    if (!item) return [];
    return allAddons.filter(addon => addon.isAvailable === 1);
  }, [item, allAddons]);

  const handleAddToCart = () => {
    if (!item) return;

    if (item.availableSizes && item.availableSizes.length > 0 && !selectedSize) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار حجم المشروب",
        variant: "destructive",
      });
      return;
    }

    const sizeData = selectedSize
      ? item.availableSizes?.find((s) => s.nameAr === selectedSize)
      : null;

    const cartItem = {
      coffeeItemId: item.id,
      quantity,
      selectedSize: selectedSize || "default",
      selectedAddons: selectedAddons.map((addonId) => {
        const addon = allAddons.find((a) => a.id === addonId);
        return addon?.nameAr;
      }).filter(Boolean),
    };

    onAddToCart(cartItem);
    resetModal();
  };

  const resetModal = () => {
    setQuantity(1);
    setSelectedSize(null);
    setSelectedAddons([]);
    onClose();
  };

  if (!item) return null;

  const totalPrice =
    (selectedSize
      ? item.availableSizes?.find((s) => s.nameAr === selectedSize)?.price ??
        item.price
      : item.price) * quantity +
    selectedAddons.reduce((sum, addonId) => {
      const addon = allAddons.find((a) => a.id === addonId);
      return sum + (addon?.price ?? 0);
    }, 0) * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetModal()}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-slate-950 to-slate-900 dark:bg-slate-950 max-h-[90vh] overflow-y-auto border-primary/20">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold text-right text-primary mb-2">
                {item.nameAr}
              </DialogTitle>
              <p className="text-sm text-secondary text-right">{item.description}</p>
            </div>
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-primary/20 bg-slate-800">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.nameAr} className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Image */}
          {item.imageUrl && (
            <div className="w-full h-64 rounded-lg overflow-hidden border border-primary/20 shadow-lg">
              <img
                src={item.imageUrl}
                alt={item.nameAr}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Sizes Selection - Creative Card Layout */}
          {item.availableSizes && item.availableSizes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-lg font-bold text-primary">✨ اختر الحجم المفضل</Label>
              <RadioGroup value={selectedSize || ""} onValueChange={setSelectedSize}>
                <div className="grid grid-cols-3 gap-3">
                  {item.availableSizes.map((size) => (
                    <div key={size.nameAr}>
                      <RadioGroupItem
                        value={size.nameAr}
                        id={`size-${size.nameAr}`}
                        className="hidden"
                      />
                      <Label
                        htmlFor={`size-${size.nameAr}`}
                        className={`block p-4 rounded-xl border-2 cursor-pointer text-center transition transform hover:scale-105 ${
                          selectedSize === size.nameAr
                            ? "border-primary bg-primary/20 shadow-lg shadow-primary/50"
                            : "border-slate-700 hover:border-primary/50 bg-slate-800/50"
                        }`}
                      >
                        {size.imageUrl && (
                          <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
                            <img src={size.imageUrl} alt={size.nameAr} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="font-bold text-primary">{size.nameAr}</div>
                        {size.sizeML && <div className="text-xs text-secondary">{size.sizeML} مل</div>}
                        <div className="text-sm text-accent mt-1 font-semibold">
                          {size.price.toFixed(2)} ر.س
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Addons Selection - Creative Grid */}
          {itemAddons.length > 0 && (
            <div className="space-y-3">
              <Label className="text-lg font-bold text-primary">🎨 الإضافات الإبداعية</Label>
              <div className="grid grid-cols-2 gap-3">
                {itemAddons.map((addon) => (
                  <Card
                    key={addon.id}
                    className={`p-3 cursor-pointer border-2 transition transform hover:scale-105 ${
                      selectedAddons.includes(addon.id)
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/30"
                        : "border-slate-700 hover:border-primary/50 bg-slate-800/50"
                    }`}
                    onClick={() => {
                      setSelectedAddons((prev) =>
                        prev.includes(addon.id)
                          ? prev.filter((id) => id !== addon.id)
                          : [...prev, addon.id]
                      );
                    }}
                  >
                    <div className="space-y-2">
                      {addon.imageUrl && (
                        <div className="w-full h-24 rounded-lg overflow-hidden">
                          <img src={addon.imageUrl} alt={addon.nameAr} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-white">{addon.nameAr}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {addon.category}
                          </Badge>
                        </div>
                        <Checkbox
                          checked={selectedAddons.includes(addon.id)}
                          onCheckedChange={() => {}}
                          className="cursor-pointer mt-1"
                        />
                      </div>
                      <div className="text-sm font-bold text-primary">
                        +{addon.price.toFixed(2)} ر.س
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
            <Label className="font-semibold text-primary">الكمية</Label>
            <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 hover:bg-primary/20"
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-4 h-4 text-primary" />
              </Button>
              <span className="w-8 text-center font-bold text-lg text-primary">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 hover:bg-primary/20"
                data-testid="button-increase-quantity"
              >
                <Plus className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </div>

          {/* Total Price - Highlighted */}
          <Card className="p-4 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                <span className="text-sm text-secondary">الإجمالي</span>
              </div>
              <span className="text-3xl font-bold text-primary">
                {totalPrice.toFixed(2)} ر.س
              </span>
            </div>
          </Card>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white py-6 text-lg font-bold rounded-lg shadow-lg"
            data-testid="button-add-to-cart"
          >
            <ShoppingCart className="w-5 h-5 ml-2" />
            إضافة إلى السلة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
