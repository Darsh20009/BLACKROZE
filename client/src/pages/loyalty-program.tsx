import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Gift,
  Star,
  Crown,
  Trophy,
  Award,
  Users,
  Coins,
  Percent,
  Coffee,
  TrendingUp,
  Settings,
  Plus,
  Search,
  Edit,
  Eye,
  Send,
  RefreshCw,
  Sparkles,
  Heart,
  Target,
  Zap,
  Medal,
  Gem,
  ShieldCheck,
  PartyPopper,
  Calendar,
  Clock,
  Loader2,
  QrCode
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface LoyaltyTier {
  id: string;
  name: string;
  nameEn: string;
  minPoints: number;
  maxPoints?: number;
  color: string;
  icon: string;
  benefits: string[];
  multiplier: number;
}

interface LoyaltyMember {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email?: string;
  points: number;
  lifetimePoints: number;
  tier: string;
  joinedAt: string;
  lastActivity?: string;
  totalOrders: number;
  totalSpent: number;
}

interface Reward {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_item' | 'upgrade' | 'exclusive';
  value: number;
  isActive: boolean;
  redemptions: number;
  expiresAt?: string;
}

interface PointsTransaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'adjust';
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

const loyaltyTiers: LoyaltyTier[] = [
  { id: "bronze", name: "برونزي", nameEn: "Bronze", minPoints: 0, maxPoints: 499, color: "from-amber-700 to-amber-800", icon: "☕", benefits: ["1 نقطة لكل ريال", "عروض حصرية"], multiplier: 1 },
  { id: "silver", name: "فضي", nameEn: "Silver", minPoints: 500, maxPoints: 1499, color: "from-slate-400 to-slate-500", icon: "⭐", benefits: ["1.25 نقطة لكل ريال", "مشروب مجاني شهرياً", "أولوية الطلب"], multiplier: 1.25 },
  { id: "gold", name: "ذهبي", nameEn: "Gold", minPoints: 1500, maxPoints: 4999, color: "from-amber-400 to-background0", icon: "👑", benefits: ["1.5 نقطة لكل ريال", "مشروبين مجانيين شهرياً", "ترقية مجانية للحجم", "دعوات VIP"], multiplier: 1.5 },
  { id: "platinum", name: "بلاتيني", nameEn: "Platinum", minPoints: 5000, color: "from-slate-700 to-slate-900", icon: "💎", benefits: ["2 نقطة لكل ريال", "مشروبات غير محدودة", "وصول مبكر للمنتجات الجديدة", "هدايا حصرية", "خط ساخن للدعم"], multiplier: 2 },
];

const mockMembers: LoyaltyMember[] = [
  { id: "1", customerId: "c1", customerName: "أحمد محمد", phone: "0501234567", email: "ahmed@email.com", points: 2450, lifetimePoints: 5200, tier: "gold", joinedAt: "2024-01-15", lastActivity: "2025-12-28", totalOrders: 89, totalSpent: 3245 },
  { id: "2", customerId: "c2", customerName: "سارة علي", phone: "0559876543", points: 890, lifetimePoints: 1500, tier: "silver", joinedAt: "2024-06-20", lastActivity: "2025-12-27", totalOrders: 45, totalSpent: 1650 },
  { id: "3", customerId: "c3", customerName: "خالد العمري", phone: "0541112233", points: 5680, lifetimePoints: 8900, tier: "platinum", joinedAt: "2023-08-10", lastActivity: "2025-12-29", totalOrders: 156, totalSpent: 5890 },
  { id: "4", customerId: "c4", customerName: "نورة الحربي", phone: "0551234567", points: 320, lifetimePoints: 450, tier: "bronze", joinedAt: "2025-10-05", lastActivity: "2025-12-25", totalOrders: 12, totalSpent: 450 },
];

const mockRewards: Reward[] = [
  { id: "1", name: "مشروب مجاني", description: "أي مشروب بالحجم المتوسط", pointsCost: 150, type: "free_item", value: 0, isActive: true, redemptions: 234 },
  { id: "2", name: "خصم 20%", description: "خصم على الطلب التالي", pointsCost: 200, type: "discount", value: 20, isActive: true, redemptions: 156 },
  { id: "3", name: "ترقية الحجم", description: "ترقية مجانية للحجم الأكبر", pointsCost: 50, type: "upgrade", value: 0, isActive: true, redemptions: 389 },
  { id: "4", name: "كوب حصري", description: "كوب CLUNY CAFE الخاص", pointsCost: 500, type: "exclusive", value: 0, isActive: true, redemptions: 45 },
  { id: "5", name: "خصم 50%", description: "خصم نصف السعر على طلبك", pointsCost: 400, type: "discount", value: 50, isActive: true, redemptions: 89 },
];

const mockTransactions: PointsTransaction[] = [
  { id: "1", memberId: "1", memberName: "أحمد محمد", type: "earn", points: 45, description: "طلب #1234", orderId: "1234", createdAt: "2025-12-29T10:30:00" },
  { id: "2", memberId: "3", memberName: "خالد العمري", type: "redeem", points: -150, description: "مشروب مجاني", createdAt: "2025-12-29T09:15:00" },
  { id: "3", memberId: "2", memberName: "سارة علي", type: "bonus", points: 100, description: "مكافأة عيد ميلاد", createdAt: "2025-12-28T14:00:00" },
  { id: "4", memberId: "1", memberName: "أحمد محمد", type: "earn", points: 68, description: "طلب #1235", orderId: "1235", createdAt: "2025-12-28T11:45:00" },
];

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
  earn: { label: "اكتساب", color: "bg-green-500", icon: Plus },
  redeem: { label: "استبدال", color: "bg-blue-500", icon: Gift },
  bonus: { label: "مكافأة", color: "bg-purple-500", icon: Sparkles },
  expire: { label: "انتهاء", color: "bg-red-500", icon: Clock },
  adjust: { label: "تعديل", color: "bg-background0", icon: Edit },
};

export default function LoyaltyProgramPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);

  const members = mockMembers;
  const rewards = mockRewards;
  const transactions = mockTransactions;

  const totalMembers = members.length;
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
  const activeRewards = rewards.filter(r => r.isActive).length;
  const totalRedemptions = rewards.reduce((sum, r) => sum + r.redemptions, 0);

  const getTierInfo = (tierId: string) => loyaltyTiers.find(t => t.id === tierId) || loyaltyTiers[0];

  const filteredMembers = members.filter(m =>
    m.customerName.includes(searchQuery) || m.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900" dir="rtl">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/manager/dashboard")}
            className="text-purple-200 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            {t("loyalty.back")}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Crown className="w-8 h-8 text-accent" />
            {t("loyalty.program_title")}
          </h1>
          <Button onClick={() => setIsSettingsOpen(true)} variant="outline" className="border-purple-400 text-purple-200">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">{t("loyalty.total_members")}</p>
                  <p className="text-3xl font-bold mt-1">{totalMembers}</p>
                  <p className="text-purple-300 text-xs mt-1">{t("loyalty.this_month_new", { count: 12 })}</p>
                </div>
                <Users className="w-12 h-12 text-purple-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent text-sm">{t("loyalty.available_points")}</p>
                  <p className="text-3xl font-bold mt-1">{totalPoints.toLocaleString()}</p>
                  <p className="text-accent text-xs mt-1">{t("loyalty.points_unit")}</p>
                </div>
                <Coins className="w-12 h-12 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">{t("loyalty.active_rewards")}</p>
                  <p className="text-3xl font-bold mt-1">{activeRewards}</p>
                  <p className="text-pink-200 text-xs mt-1">{t("loyalty.reward")}</p>
                </div>
                <Gift className="w-12 h-12 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">{t("loyalty.redemptions")}</p>
                  <p className="text-3xl font-bold mt-1">{totalRedemptions}</p>
                  <p className="text-teal-200 text-xs mt-1">{t("loyalty.this_month")}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-teal-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-purple-800/50 border-purple-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 text-white">{t("loyalty.tab_overview")}</TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-purple-600 text-white">{t("loyalty.tab_members")}</TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-purple-600 text-white">{t("loyalty.tab_rewards")}</TabsTrigger>
            <TabsTrigger value="card" className="data-[state=active]:bg-purple-600 text-white">{t("loyalty.tab_card")}</TabsTrigger>
            <TabsTrigger value="tiers" className="data-[state=active]:bg-purple-600 text-white">{t("loyalty.tab_tiers")}</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-600 text-white">{t("loyalty.tab_transactions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-6">
            <Card className="bg-purple-800/30 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-accent" />
                  {t("loyalty.barcode_link")}
                </CardTitle>
                <CardDescription className="text-purple-300">
                  {t("loyalty.barcode_link_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-900/50 rounded-xl border border-purple-700 flex items-center justify-between">
                  <code className="text-accent font-mono text-sm">{window.location.origin}/my-card</code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-purple-500 text-purple-200"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/my-card`);
                      toast({ title: t("loyalty.link_copied") });
                    }}
                  >
                    {t("loyalty.copy_link")}
                  </Button>
                </div>
                <Button 
                  className="w-full bg-accent text-white"
                  onClick={() => setLocation("/my-card")}
                >
                  {t("loyalty.go_to_my_card")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-purple-800/30 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    {t("loyalty.tier_distribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loyaltyTiers.map((tier) => {
                      const count = members.filter(m => m.tier === tier.id).length;
                      const percentage = (count / members.length) * 100;
                      return (
                        <div key={tier.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{tier.icon}</span>
                              <span className="text-white font-medium">{tier.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-300">{count} {t("loyalty.member")}</span>
                              <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>
                                {percentage.toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-800/30 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" />
                    {t("loyalty.top_members")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.slice(0, 5).sort((a, b) => b.lifetimePoints - a.lifetimePoints).map((member, idx) => {
                      const tier = getTierInfo(member.tier);
                      return (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-purple-900/30 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? 'bg-background0 text-white' :
                            idx === 1 ? 'bg-slate-400 text-white' :
                            idx === 2 ? 'bg-primary text-white' :
                            'bg-purple-700 text-purple-300'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{member.customerName}</span>
                              <span className="text-lg">{tier.icon}</span>
                            </div>
                            <p className="text-purple-400 text-sm">{member.lifetimePoints.toLocaleString()} {t("loyalty.total_points_label")}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-accent font-bold">{member.points.toLocaleString()}</p>
                            <p className="text-purple-400 text-xs">{t("loyalty.available_points_label")}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-purple-800/30 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-400" />
                  {t("loyalty.most_popular_rewards")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rewards.slice(0, 3).sort((a, b) => b.redemptions - a.redemptions).map((reward, idx) => (
                    <div key={reward.id} className={`p-4 rounded-lg border ${
                      idx === 0 ? 'bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-primary' :
                      idx === 1 ? 'bg-gradient-to-br from-card/50 to-slate-700/50 border-slate-500' :
                      'bg-gradient-to-br from-amber-800/30 to-amber-700/30 border-primary'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Medal className={`w-5 h-5 ${idx === 0 ? 'text-accent' : idx === 1 ? 'text-slate-400' : 'text-accent'}`} />
                        <span className="text-white font-medium">{reward.name}</span>
                      </div>
                      <p className="text-purple-300 text-sm mb-2">{reward.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-purple-600">{reward.pointsCost} {t("loyalty.points_unit")}</Badge>
                        <span className="text-purple-400 text-sm">{reward.redemptions} {t("loyalty.redemption")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input 
                  placeholder={t("loyalty.search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-purple-800/30 border-purple-700 text-white placeholder:text-purple-400"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-purple-800/30 border-purple-700 text-white">
                  <SelectValue placeholder={t("loyalty.tier_label")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("loyalty.all_tiers")}</SelectItem>
                  {loyaltyTiers.map(tier => (
                    <SelectItem key={tier.id} value={tier.id}>{tier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-purple-800/30 border-purple-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-700">
                      <TableHead className="text-right text-purple-300">{t("loyalty.member")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.tier_label")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.available_points")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.total_points")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.orders")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.last_activity")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => {
                      const tier = getTierInfo(member.tier);
                      return (
                        <TableRow key={member.id} className="border-purple-700">
                          <TableCell>
                            <div>
                              <p className="text-white font-medium">{member.customerName}</p>
                              <p className="text-purple-400 text-sm" dir="ltr">{member.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>
                              {tier.icon} {tier.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-accent font-bold">{member.points.toLocaleString()}</TableCell>
                          <TableCell className="text-purple-300">{member.lifetimePoints.toLocaleString()}</TableCell>
                          <TableCell className="text-purple-300">{member.totalOrders}</TableCell>
                          <TableCell className="text-purple-400 text-sm">
                            {member.lastActivity && format(new Date(member.lastActivity), "dd/MM/yyyy", { locale: ar })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-300 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-300 hover:text-white">
                                <Gift className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{t("loyalty.available_rewards")}</h2>
              <Button onClick={() => setIsAddRewardOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 ml-2" />
                {t("loyalty.new_reward")}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="bg-purple-800/30 border-purple-700 overflow-hidden">
                  <div className={`h-2 ${reward.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold">{reward.name}</h3>
                        <p className="text-purple-400 text-sm mt-1">{reward.description}</p>
                      </div>
                      <Badge className={reward.type === 'discount' ? 'bg-blue-600' : reward.type === 'free_item' ? 'bg-green-600' : reward.type === 'upgrade' ? 'bg-primary' : 'bg-purple-600'}>
                        {reward.type === 'discount' ? t("loyalty.type_discount") : reward.type === 'free_item' ? t("loyalty.type_free") : reward.type === 'upgrade' ? t("loyalty.type_upgrade") : t("loyalty.type_exclusive")}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-accent" />
                        <span className="text-xl font-bold text-accent">{reward.pointsCost}</span>
                        <span className="text-purple-400 text-sm">{t("loyalty.points_unit")}</span>
                      </div>
                      <div className="text-purple-400 text-sm">
                        {reward.redemptions} {t("loyalty.redemption")}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 border-purple-600 text-purple-300">
                        <Edit className="w-4 h-4 ml-1" />
                        {t("loyalty.edit")}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-purple-400">
                        <Switch checked={reward.isActive} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tiers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loyaltyTiers.map((tier, idx) => (
                <Card key={tier.id} className={`bg-gradient-to-br ${tier.color} border-0 text-white overflow-hidden`}>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <span className="text-4xl">{tier.icon}</span>
                      <h3 className="text-xl font-bold mt-2">{tier.name}</h3>
                      <p className="text-white/70 text-sm">{tier.nameEn}</p>
                    </div>
                    
                    <div className="text-center mb-4 p-3 bg-white/10 rounded-lg">
                      <p className="text-white/80 text-sm">{t("loyalty.required_points")}</p>
                      <p className="text-xl font-bold">
                        {tier.minPoints.toLocaleString()}
                        {tier.maxPoints && ` - ${tier.maxPoints.toLocaleString()}`}
                        {!tier.maxPoints && '+'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-white/10 rounded">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">{tier.multiplier}x {t("loyalty.points_unit")}</span>
                      </div>
                      {tier.benefits.slice(0, 3).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white/90">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/20 text-center">
                      <p className="text-white/70 text-sm">
                        {members.filter(m => m.tier === tier.id).length} {t("loyalty.member")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-purple-800/30 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white">{t("loyalty.points_log")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-700">
                      <TableHead className="text-right text-purple-300">{t("loyalty.member")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.type")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.points_unit")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.description")}</TableHead>
                      <TableHead className="text-right text-purple-300">{t("loyalty.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => {
                      const config = typeConfig[tx.type];
                      const Icon = config.icon;
                      return (
                        <TableRow key={tx.id} className="border-purple-700">
                          <TableCell className="text-white">{tx.memberName}</TableCell>
                          <TableCell>
                            <Badge className={`${config.color} text-white`}>
                              <Icon className="w-3 h-3 ml-1" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className={`font-bold ${tx.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.points >= 0 ? '+' : ''}{tx.points}
                          </TableCell>
                          <TableCell className="text-purple-300">{tx.description}</TableCell>
                          <TableCell className="text-purple-400 text-sm">
                            {format(new Date(tx.createdAt), "dd/MM HH:mm", { locale: ar })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isAddRewardOpen} onOpenChange={setIsAddRewardOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                {t("loyalty.add_new_reward")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("loyalty.reward_name")}</Label>
                <Input placeholder={t("loyalty.reward_name_placeholder")} />
              </div>
              <div>
                <Label>{t("loyalty.description")}</Label>
                <Input placeholder={t("loyalty.reward_desc_placeholder")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("loyalty.required_points")}</Label>
                  <Input type="number" placeholder="150" />
                </div>
                <div>
                  <Label>{t("loyalty.reward_type")}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t("loyalty.select_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">{t("loyalty.type_discount")}</SelectItem>
                      <SelectItem value="free_item">{t("loyalty.type_free_product")}</SelectItem>
                      <SelectItem value="upgrade">{t("loyalty.type_upgrade")}</SelectItem>
                      <SelectItem value="exclusive">{t("loyalty.type_exclusive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>{t("loyalty.activate_reward")}</Label>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRewardOpen(false)}>{t("common.cancel")}</Button>
              <Button className="bg-purple-600 hover:bg-purple-700">{t("loyalty.save_reward")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
