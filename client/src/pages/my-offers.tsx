import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Star, Crown, Zap, Coffee, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoyaltyCard {
  id: string;
  points: number;
  tier: string;
  stamps: number;
  freeCupsEarned: number;
  freeCupsRedeemed: number;
  totalSpent: number;
}

interface CustomerOffer {
  id: string;
  nameAr: string;
  nameEn: string;
  description: string;
  pointsCost: number;
  discountPercentage?: number;
  requiredTier: string;
  imageUrl?: string;
  itemId?: string;
  expiryDate?: string;
  type: 'discount' | 'free_item' | 'upgrade' | 'special';
}

export default function MyOffersPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { toast } = useToast();
  
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);
  const [offers, setOffers] = useState<CustomerOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const customerPhone = localStorage.getItem('customerPhone');
      if (!customerPhone) {
        toast({
          title: isRTL ? "خطأ" : "Error",
          description: isRTL ? "يرجى تسجيل الدخول أولاً" : "Please login first",
          variant: "destructive",
        });
        return;
      }

      // Fetch loyalty card
      const response = await fetch(`/api/loyalty/cards/phone/${customerPhone}`);
      if (response.ok) {
        const card = await response.json();
        setLoyaltyCard(card);
        
        // Generate offers based on tier and points
        generateOffersForCustomer(card);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOffersForCustomer = (card: LoyaltyCard) => {
    const generatedOffers: CustomerOffer[] = [];
    
    // Tier-based offers
    const tierOffers = {
      bronze: [
        {
          id: 'bronze-1',
          nameAr: 'قهوة مجانية',
          nameEn: 'Free Coffee',
          description: isRTL ? 'احصل على قهوة مجانية من اختيارك' : 'Get a free coffee of your choice',
          pointsCost: 50,
          requiredTier: 'bronze',
          type: 'free_item' as const,
        },
        {
          id: 'bronze-2',
          nameAr: 'خصم 10%',
          nameEn: '10% Discount',
          description: isRTL ? 'خصم 10% على طلبك القادم' : '10% off your next order',
          pointsCost: 30,
          discountPercentage: 10,
          requiredTier: 'bronze',
          type: 'discount' as const,
        },
      ],
      silver: [
        {
          id: 'silver-1',
          nameAr: 'قهوتان مجانيتان',
          nameEn: 'Two Free Coffees',
          description: isRTL ? 'احصل على قهوتين مجانيتين' : 'Get two free coffees',
          pointsCost: 80,
          requiredTier: 'silver',
          type: 'free_item' as const,
        },
        {
          id: 'silver-2',
          nameAr: 'خصم 15%',
          nameEn: '15% Discount',
          description: isRTL ? 'خصم 15% على طلبك القادم' : '15% off your next order',
          pointsCost: 50,
          discountPercentage: 15,
          requiredTier: 'silver',
          type: 'discount' as const,
        },
        {
          id: 'silver-3',
          nameAr: 'ترقية حجم مجانية',
          nameEn: 'Free Size Upgrade',
          description: isRTL ? 'ترقية مجانية للحجم الأكبر' : 'Free upgrade to larger size',
          pointsCost: 20,
          requiredTier: 'silver',
          type: 'upgrade' as const,
        },
      ],
      gold: [
        {
          id: 'gold-1',
          nameAr: '3 قهوات مجانية',
          nameEn: 'Three Free Coffees',
          description: isRTL ? 'احصل على 3 قهوات مجانية' : 'Get three free coffees',
          pointsCost: 100,
          requiredTier: 'gold',
          type: 'free_item' as const,
        },
        {
          id: 'gold-2',
          nameAr: 'خصم 20%',
          nameEn: '20% Discount',
          description: isRTL ? 'خصم 20% على طلبك القادم' : '20% off your next order',
          pointsCost: 70,
          discountPercentage: 20,
          requiredTier: 'gold',
          type: 'discount' as const,
        },
        {
          id: 'gold-3',
          nameAr: 'عرض خاص ذهبي',
          nameEn: 'Gold Special Offer',
          description: isRTL ? 'اشترِ 2 واحصل على 1 مجاناً' : 'Buy 2 Get 1 Free',
          pointsCost: 60,
          requiredTier: 'gold',
          type: 'special' as const,
        },
      ],
      platinum: [
        {
          id: 'platinum-1',
          nameAr: '5 قهوات مجانية',
          nameEn: 'Five Free Coffees',
          description: isRTL ? 'احصل على 5 قهوات مجانية' : 'Get five free coffees',
          pointsCost: 150,
          requiredTier: 'platinum',
          type: 'free_item' as const,
        },
        {
          id: 'platinum-2',
          nameAr: 'خصم 25%',
          nameEn: '25% Discount',
          description: isRTL ? 'خصم 25% على طلبك القادم' : '25% off your next order',
          pointsCost: 100,
          discountPercentage: 25,
          requiredTier: 'platinum',
          type: 'discount' as const,
        },
        {
          id: 'platinum-3',
          nameAr: 'عرض البلاتيني الحصري',
          nameEn: 'Exclusive Platinum Offer',
          description: isRTL ? 'وجبة كاملة مجانية مع قهوتك' : 'Free meal with your coffee',
          pointsCost: 120,
          requiredTier: 'platinum',
          type: 'special' as const,
        },
      ],
    };

    const currentTier = card.tier.toLowerCase();
    
    // Add offers for current tier
    if (tierOffers[currentTier as keyof typeof tierOffers]) {
      generatedOffers.push(...tierOffers[currentTier as keyof typeof tierOffers]);
    }
    
    // Add offers from lower tiers too
    if (currentTier === 'silver' || currentTier === 'gold' || currentTier === 'platinum') {
      generatedOffers.push(...tierOffers.bronze);
    }
    if (currentTier === 'gold' || currentTier === 'platinum') {
      generatedOffers.push(...tierOffers.silver);
    }
    if (currentTier === 'platinum') {
      generatedOffers.push(...tierOffers.gold);
    }

    setOffers(generatedOffers);
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return <Award className="w-5 h-5 text-orange-600" />;
      case 'silver': return <Star className="w-5 h-5 text-gray-400" />;
      case 'gold': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'platinum': return <Zap className="w-5 h-5 text-purple-500" />;
      default: return <Coffee className="w-5 h-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <TrendingUp className="w-4 h-4" />;
      case 'free_item': return <Coffee className="w-4 h-4" />;
      case 'upgrade': return <Zap className="w-4 h-4" />;
      case 'special': return <Gift className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const handleRedeemOffer = async (offer: CustomerOffer) => {
    if (!loyaltyCard) return;

    if (loyaltyCard.points < offer.pointsCost) {
      toast({
        title: isRTL ? "نقاط غير كافية" : "Insufficient Points",
        description: isRTL ? `تحتاج إلى ${offer.pointsCost} نقطة لاستبدال هذا العرض` : `You need ${offer.pointsCost} points to redeem this offer`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isRTL ? "جاري الاستبدال..." : "Redeeming...",
      description: isRTL ? "يتم استبدال العرض الآن" : "Redeeming your offer now",
    });

    // TODO: Implement actual redemption API call
    // For now, just show success message
    setTimeout(() => {
      toast({
        title: isRTL ? "تم الاستبدال بنجاح!" : "Redeemed Successfully!",
        description: isRTL 
          ? `تم استبدال ${offer.nameAr}. استخدمه في طلبك القادم!` 
          : `${offer.nameEn} has been redeemed. Use it on your next order!`,
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-4 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className={isRTL ? "text-right" : "text-left"}>{isRTL ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Gift className="w-8 h-8" />
          {isRTL ? "عروضي الخاصة" : "My Special Offers"}
        </h1>
        <p className="text-amber-100">
          {isRTL ? "استبدل نقاطك واحصل على مكافآت رائعة!" : "Redeem your points and get amazing rewards!"}
        </p>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Loyalty Card Summary */}
        {loyaltyCard && (
          <Card className="mb-6 overflow-hidden border-2 shadow-lg">
            <div className={`bg-gradient-to-r ${
              loyaltyCard.tier === 'platinum' ? 'from-purple-500 to-purple-600' :
              loyaltyCard.tier === 'gold' ? 'from-yellow-500 to-yellow-600' :
              loyaltyCard.tier === 'silver' ? 'from-gray-400 to-gray-500' :
              'from-orange-500 to-orange-600'
            } text-white p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTierIcon(loyaltyCard.tier)}
                  <div>
                    <p className="text-sm opacity-90">{isRTL ? "المستوى" : "Tier"}</p>
                    <p className="text-xl font-bold capitalize">{loyaltyCard.tier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">{isRTL ? "إجمالي الإنفاق" : "Total Spent"}</p>
                  <p className="text-xl font-bold">{loyaltyCard.totalSpent.toFixed(2)} {isRTL ? "ريال" : "SAR"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs opacity-90 mb-1">{isRTL ? "النقاط" : "Points"}</p>
                  <p className="text-2xl font-bold">{loyaltyCard.points}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs opacity-90 mb-1">{isRTL ? "الأختام" : "Stamps"}</p>
                  <p className="text-2xl font-bold">{loyaltyCard.stamps}/6</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs opacity-90 mb-1">{isRTL ? "قهوة مجانية" : "Free Cups"}</p>
                  <p className="text-2xl font-bold">{loyaltyCard.freeCupsEarned - loyaltyCard.freeCupsRedeemed}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Offers Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-600" />
            {isRTL ? "العروض المتاحة لك" : "Available Offers for You"}
          </h2>
          
          {offers.length === 0 ? (
            <Card className="p-8 text-center">
              <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">{isRTL ? "لا توجد عروض متاحة حالياً" : "No offers available at the moment"}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => {
                const canAfford = loyaltyCard && loyaltyCard.points >= offer.pointsCost;
                
                return (
                  <Card key={offer.id} className={`overflow-hidden border-2 transition-all hover:shadow-lg ${
                    canAfford ? 'border-amber-200' : 'border-gray-200 opacity-75'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getTierColor(offer.requiredTier)} variant="outline">
                          {getTierIcon(offer.requiredTier)}
                          <span className={`${isRTL ? 'mr-1' : 'ml-1'} capitalize`}>{offer.requiredTier}</span>
                        </Badge>
                        <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-semibold">
                          {getOfferTypeIcon(offer.type)}
                          <span>{offer.pointsCost} {isRTL ? "نقطة" : "pts"}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">
                        {isRTL ? offer.nameAr : offer.nameEn}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
                      
                      {offer.discountPercentage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
                          <p className="text-green-800 font-semibold text-sm text-center">
                            {offer.discountPercentage}% {isRTL ? "خصم" : "OFF"}
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => handleRedeemOffer(offer)}
                        disabled={!canAfford}
                        className="w-full"
                        variant={canAfford ? "default" : "secondary"}
                      >
                        {canAfford 
                          ? (isRTL ? "استبدل الآن" : "Redeem Now")
                          : (isRTL ? `تحتاج ${offer.pointsCost - (loyaltyCard?.points || 0)} نقطة إضافية` : `Need ${offer.pointsCost - (loyaltyCard?.points || 0)} more points`)
                        }
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* How to Earn More Points */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-amber-600" />
              {isRTL ? "كيف تكسب المزيد من النقاط؟" : "How to Earn More Points?"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                {isRTL ? "احصل على 10 نقاط مع كل مشروب تشتريه" : "Get 10 points with every drink you buy"}
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-600" />
                {isRTL ? "اجمع 6 أختام للحصول على قهوة مجانية" : "Collect 6 stamps to get a free coffee"}
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600" />
                {isRTL ? "ارتقِ إلى مستويات أعلى لفتح المزيد من العروض" : "Level up to unlock more exclusive offers"}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
