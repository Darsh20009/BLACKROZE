import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { ArrowRight, Plus, Minus, Check, X, Coffee, Heart, Share2, Info } from "lucide-react";
import { useState } from "react";
import type { CoffeeItem, Branch } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getCoffeeImage } from "@/lib/coffee-data-clean";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isSavingBranches, setIsSavingBranches] = useState(false);
  const { toast } = useToast();

  const { data: item, isLoading, refetch } = useQuery<CoffeeItem>({
    queryKey: ["/api/coffee-items", params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/coffee-items/${params?.id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch product");
      }
      return response.json();
    },
    enabled: !!params?.id,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: ingredientsData = [] } = useQuery<Array<{ingredient: any}>>({
    queryKey: ["/api/coffee-items", params?.id, "ingredients"],
    queryFn: async () => {
      const response = await fetch(`/api/coffee-items/${params?.id}/ingredients`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!params?.id,
  });

  const { data: addonsData = [] } = useQuery<any[]>({
    queryKey: ["/api/coffee-items", params?.id, "addons"],
    queryFn: async () => {
      const response = await fetch(`/api/coffee-items/${params?.id}/addons`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!params?.id,
  });

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });
  
  const ingredients = ingredientsData.map(item => item.ingredient).filter(Boolean);

  const saveBranchAvailability = async () => {
    if (!item || selectedBranches.length === 0) return;
    
    setIsSavingBranches(true);
    try {
      const response = await fetch(`/api/coffee-items/${item.id}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchIds: selectedBranches }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "تم الحفظ بنجاح",
          description: `تم إضافة المشروب إلى ${selectedBranches.length} فرع`,
        });
        setSelectedBranches([]);
        setTimeout(() => refetch(), 100);
      } else {
        const errorData = await response.text();
        console.error('Save error:', errorData);
        toast({
          title: "خطأ",
          description: "فشل حفظ الفروع",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    } finally {
      setIsSavingBranches(false);
    }
  };

  const handleAddToCart = () => {
    if (item) {
      addToCart(item.id, quantity, selectedSize, selectedAddons);
      toast({
        title: "تمت الإضافة للسلة",
        description: `تم إضافة ${item.nameAr} بنجاح`,
      });
      setLocation("/menu");
    }
  };

  const handleGoBack = () => {
    setLocation("/menu");
  };

  // Calculate dynamic price
  const getPrice = () => {
    if (!item) return 0;
    let basePrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0));
    
    // Add selected size price
    if (selectedSize && item.availableSizes) {
      const size = item.availableSizes.find(s => s.nameAr === selectedSize);
      if (size) {
        basePrice = typeof size.price === 'number' ? size.price : parseFloat(String(size.price || 0));
      }
    }
    
    // Add selected addons prices
    let addonsTotal = 0;
    selectedAddons.forEach(addonId => {
      const addon = addonsData.find(a => a.id === addonId);
      if (addon) {
        const price = typeof addon.price === 'number' ? addon.price : parseFloat(String(addon.price || 0));
        addonsTotal += price;
      }
    });
    
    return basePrice + addonsTotal;
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">المنتج غير موجود</p>
            <Button onClick={handleGoBack} variant="outline">
              العودة للمنيو
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const oldPriceNum = typeof item.oldPrice === 'number' ? item.oldPrice : parseFloat(String(item.oldPrice || 0));
  const priceNum = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0));
  const discount = oldPriceNum > 0 ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0;
  const currentPrice = getPrice();
  const totalPrice = currentPrice * quantity;

  // Group addons by category
  const addonsByCategory = addonsData.reduce((acc: any, addon: any) => {
    const category = addon.category || 'أخرى';
    if (!acc[category]) acc[category] = [];
    acc[category].push(addon);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background" data-testid="page-product-details">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          onClick={handleGoBack}
          variant="ghost" 
          className="mb-6 hover-elevate"
          data-testid="button-back"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للمنيو
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Product Image */}
          <div className="relative" data-testid="section-product-image">
            {item.imageUrl || getCoffeeImage(item.id) ? (
              <img 
                src={item.imageUrl || getCoffeeImage(item.id)}
                alt={item.nameAr}
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl shadow-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = parent.querySelector('[data-testid="image-placeholder"]') as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }
                }}
                data-testid="img-product"
              />
            ) : null}
            <div
              data-testid="image-placeholder"
              className={`w-full h-96 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 ${(item.imageUrl || getCoffeeImage(item.id)) ? 'hidden' : ''}`}
            >
              <Coffee className="w-20 h-20 text-primary/40" />
              <p className="text-lg font-medium text-muted-foreground">صورة المشروب</p>
            </div>
            {/* Status and Discount Badges */}
            <div className="flex gap-2 flex-wrap absolute top-4 left-4">
              {oldPriceNum > 0 && (
                <Badge className="bg-red-500 text-white" data-testid="badge-discount">
                  خصم {discount}%
                </Badge>
              )}

              {item.availabilityStatus && item.availabilityStatus !== 'available' && (
                <Badge 
                  className={
                    item.availabilityStatus === 'out_of_stock' ? "bg-red-500" :
                    item.availabilityStatus === 'coming_soon' ? "bg-blue-500" :
                    "bg-background0"
                  }
                  data-testid="badge-availability"
                >
                  {item.availabilityStatus === 'out_of_stock' && " نفذت الكمية "}
                  {item.availabilityStatus === 'coming_soon' && " قريباً"}
                  {item.availabilityStatus === 'temporarily_unavailable' && "⏸ غير متوفر مؤقتاً"}
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6" data-testid="section-product-info">
            <div>
              <h1 className="font-amiri text-4xl font-bold text-foreground mb-2" data-testid="text-product-name">
                {item.nameAr}
              </h1>
              {item.nameEn && (
                <p className="text-lg text-muted-foreground" data-testid="text-product-name-en">
                  {item.nameEn}
                </p>
              )}
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-product-description">
              {item.description}
            </p>

            {/* Category Badge */}
            <Badge variant="outline" className="w-fit" data-testid="badge-category">
              {item.category === 'basic' && 'قهوة أساسية'}
              {item.category === 'hot' && 'قهوة ساخنة'}
              {item.category === 'cold' && 'قهوة باردة'}
            </Badge>

            {/* Ingredients Section */}
            {ingredients.length > 0 && (
              <div className="space-y-3" data-testid="section-ingredients">
                <h3 className="text-lg font-semibold text-foreground">المكونات</h3>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing: any, index: number) => (
                    <Badge 
                      key={ing.id || index}
                      variant="secondary"
                      className={`${ing.isAvailable === 0 ? 'opacity-50 line-through' : ''}`}
                      data-testid={`badge-ingredient-${ing.id || index}`}
                    >
                      {ing.nameAr}
                      {ing.isAvailable === 0 && ' (غير متوفر)'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Section */}
            <div className="space-y-3" data-testid="section-sizes">
              <h3 className="text-lg font-semibold text-foreground">الحجم</h3>
              {item.availableSizes && item.availableSizes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {item.availableSizes.map((size, index) => (
                    <Button
                      key={index}
                      variant={selectedSize === size.nameAr ? "default" : "outline"}
                      onClick={() => setSelectedSize(size.nameAr)}
                      className="text-sm h-11 sm:h-10 justify-between px-4"
                      data-testid={`button-size-${size.nameAr}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{size.nameAr}</span>
                        {size.sizeML && <span className="text-[10px] opacity-70">({size.sizeML} مل)</span>}
                      </div>
                      {size.price !== item.price && (
                        <span className="text-xs font-bold">+{(size.price - (typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0)))).toFixed(2)} ر.س</span>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">حجم واحد متاح</p>
              )}
            </div>

            {/* Add-ons Section */}
            <div className="space-y-4" data-testid="section-addons">
              <h3 className="text-lg font-semibold text-foreground">الإضافات</h3>
              {Object.keys(addonsByCategory).length > 0 ? (
                Object.entries(addonsByCategory).map(([category, addons]: [string, any]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{category}</p>
                    <div className="space-y-2">
                      {addons.map((addon: any) => (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            selectedAddons.includes(addon.id)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary hover:bg-muted'
                          }`}
                          data-testid={`button-addon-${addon.id}`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selectedAddons.includes(addon.id) 
                              ? 'bg-primary-foreground' 
                              : 'border-border'
                          }`}>
                            {selectedAddons.includes(addon.id) && (
                              <Check className="w-3 h-3 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 text-right">
                            <p className="font-medium">{addon.nameAr}</p>
                          </div>
                          {addon.price > 0 && (
                            <span className="text-sm font-medium">+{addon.price.toFixed(2)} ر.س</span>
                          )}
                          {addon.isFree && addon.price === 0 && (
                            <Badge variant="secondary" className="text-xs">مجاني</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد إضافات متاحة</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2" data-testid="section-pricing">
              <div className="flex items-center space-x-3">
                {item.oldPrice && (
                  <span className="price-old text-lg line-through" data-testid="text-old-price">
                    {item.oldPrice} ريال
                  </span>
                )}
                <span className="text-3xl font-bold text-primary" data-testid="text-current-price">
                  {currentPrice.toFixed(2)} ريال
                </span>
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600" data-testid="text-savings">
                  توفير {(oldPriceNum - priceNum).toFixed(2)} ريال
                </p>
              )}
            </div>

            {/* Branch Availability Section */}
            {branches.length > 0 && (
              <div className="space-y-3" data-testid="section-branches">
                <label className="text-sm font-semibold text-foreground">اختر الفروع المتاحة (اختياري)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                  {branches.map((branch) => {
                    const isInItem = item?.branchAvailability?.some((b: any) => b.branchId === branch.id && b.isAvailable === 1);
                    const isSelected = selectedBranches.includes(branch.id || "");
                    
                    return (
                      <div
                        key={branch.id}
                        className="flex items-center p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => {
                          setSelectedBranches(prev =>
                            prev.includes(branch.id || "")
                              ? prev.filter(id => id !== branch.id)
                              : [...prev, branch.id || ""]
                          );
                        }}
                      >
                        <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="flex-1">{branch.nameAr}</span>
                        {isInItem && <Badge variant="outline" className="text-xs">موجود</Badge>}
                      </div>
                    );
                  })}
                </div>
                {selectedBranches.length > 0 && (
                  <Button
                    onClick={saveBranchAvailability}
                    disabled={isSavingBranches}
                    className="w-full"
                    variant="outline"
                    data-testid="button-save-branches"
                  >
                    {isSavingBranches ? "جاري الحفظ..." : `حفظ للفروع المختارة (${selectedBranches.length})`}
                  </Button>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3" data-testid="section-quantity">
              <label className="text-sm font-semibold text-foreground">الكمية</label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={item.isAvailable === 0 || (item.availabilityStatus !== undefined && item.availabilityStatus !== 'available')}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-card rounded-xl p-4 border" data-testid="section-total">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">المجموع:</span>
                <span className="text-2xl font-bold text-primary" data-testid="text-total-price">
                  {totalPrice.toFixed(2)} ريال
                </span>
              </div>
            </div>

            {/* Add to Cart Button - Mobile Sticky */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-50 lg:relative lg:p-0 lg:bg-transparent lg:border-0">
              <Button
                onClick={handleAddToCart}
                size="lg"
                disabled={item.isAvailable === 0 || (item.availabilityStatus !== undefined && item.availabilityStatus !== 'available')}
                className="w-full btn-primary text-accent-foreground py-6 sm:py-7 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl lg:shadow-none"
                data-testid="button-add-to-cart"
              >
                <Plus className="w-5 h-5 ml-2" />
                {item.availabilityStatus === 'out_of_stock' ? ' نفذت الكمية ' :
                item.availabilityStatus === 'coming_soon' ? ' قريباً' :
                item.availabilityStatus === 'temporarily_unavailable' ? '⏸ غير متوفر مؤقتاً' :
                'أضف للسلة '}
              </Button>
            </div>
            
            {/* Spacer for sticky button on mobile */}
            <div className="h-20 lg:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
