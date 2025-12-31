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
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
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
    // Filter addons that are associated with this item or are generic add-ons
    return allAddons.filter(addon => addon.isAvailable === 1);
  }, [item, allAddons]);

  const handleAddToCart = () => {
    if (!item) return;

    // Validate size selection if item has sizes
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
      itemId: item.id,
      name: item.nameAr,
      price: sizeData?.price ?? item.price,
      quantity,
      selectedSize: selectedSize || "default",
      sizePrice: sizeData?.price,
      addons: selectedAddons.map((addonId) => {
        const addon = allAddons.find((a) => a.id === addonId);
        return {
          id: addonId,
          name: addon?.nameAr,
          price: addon?.price ?? 0,
        };
      }),
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
      <DialogContent className="max-w-md bg-white dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-right">
                {item.nameAr}
              </DialogTitle>
              <p className="text-sm text-secondary mt-1">{item.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image */}
          {item.imageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.nameAr}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Sizes */}
          {item.availableSizes && item.availableSizes.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">
                اختر الحجم
              </Label>
              <RadioGroup value={selectedSize || ""} onValueChange={setSelectedSize}>
                <div className="grid grid-cols-2 gap-3">
                  {item.availableSizes.map((size) => (
                    <div key={size.nameAr}>
                      <RadioGroupItem
                        value={size.nameAr}
                        id={`size-${size.nameAr}`}
                        className="hidden"
                      />
                      <Label
                        htmlFor={`size-${size.nameAr}`}
                        className={`block p-3 rounded-lg border-2 cursor-pointer text-center transition ${
                          selectedSize === size.nameAr
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-semibold">{size.nameAr}</div>
                        <div className="text-sm text-secondary">
                          {size.price} ر.س
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Addons/Extras */}
          {itemAddons.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">
                إضافات إبداعية
              </Label>
              <div className="space-y-2">
                {itemAddons.map((addon) => (
                  <Card
                    key={addon.id}
                    className={`p-3 cursor-pointer border-2 transition ${
                      selectedAddons.includes(addon.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => {
                      setSelectedAddons((prev) =>
                        prev.includes(addon.id)
                          ? prev.filter((id) => id !== addon.id)
                          : [...prev, addon.id]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={selectedAddons.includes(addon.id)}
                          onCheckedChange={() => {}}
                          className="cursor-pointer"
                        />
                        <div>
                          <div className="font-semibold text-sm">
                            {addon.nameAr}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {addon.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        +{addon.price} ر.س
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <Label className="font-semibold">الكمية</Label>
            <div className="flex items-center gap-2 bg-secondary/20 rounded-lg p-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8"
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8"
                data-testid="button-increase-quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Total Price */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">السعر الإجمالي</span>
              <span className="text-2xl font-bold text-primary">
                {totalPrice.toFixed(2)} ر.س
              </span>
            </div>
          </Card>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-bold rounded-lg"
            data-testid="button-add-to-cart"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            إضافة إلى السلة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
