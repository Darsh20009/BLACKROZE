import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, Calendar, Activity, Settings, ShoppingCart, BarChart3, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

interface AnalyticsSummary {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    uniqueCustomers: number;
    revenueChange: number;
    ordersChange: number;
    avgOrderChange: number;
    customersChange: number;
    changeLabel: string;
  };
  revenueTrend: Array<{ date: string; current: number; orders: number }>;
  topProducts: Array<{ id: string; nameAr: string; qty: number; revenue: number }>;
  paymentBreakdown: Array<{ method: string; amount: number; percentage: number }>;
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  online: 'أونلاين',
  loyalty: 'ولاء',
  other: 'أخرى',
};

const ChangeIndicator = ({ value, label }: { value: number; label: string }) => {
  const isPositive = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      <span>{Math.abs(value)}%</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "لوحة تحكم الإدارة - BLACK ROSE CAFE | إحصائيات شاملة";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'لوحة تحكم الإدارة في BLACK ROSE CAFE - إحصائيات المبيعات والموظفين والطلبات');
  }, []);

  const { data: employees } = useQuery<any[]>({
    queryKey: ['/api/employees'],
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/analytics/advanced', 'week'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/advanced?period=week');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const summary = analyticsData?.summary;
  const revenueTrend = analyticsData?.revenueTrend || [];
  const topProducts = analyticsData?.topProducts?.slice(0, 5) || [];
  const paymentBreakdown = analyticsData?.paymentBreakdown || [];

  const activeEmployees = (employees || []).filter((e: any) => e.isActivated === 1).length;
  const totalEmployees = employees?.length || 0;

  const StatCard = ({ icon: Icon, label, value, subtext, change, changeLabel, color = 'primary' }: any) => (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/90 shadow-md hover:shadow-lg transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold font-playfair mt-2 text-foreground">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
            {change !== undefined && (
              <div className="mt-2">
                <ChangeIndicator value={change} label={changeLabel || ''} />
              </div>
            )}
          </div>
          <div className="bg-accent/20 dark:bg-accent/10 p-3 rounded-lg flex-shrink-0">
            <Icon className="w-6 h-6 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8 bg-gradient-to-b from-background via-primary/5 to-background min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-playfair text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-2 font-cairo">مرحباً بك في نظام الإدارة</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/settings')}>
          <Settings className="w-4 h-4 ml-2" />
          الإعدادات
        </Button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          label="إيرادات الأسبوع"
          value={analyticsLoading ? '...' : `${(summary?.totalRevenue || 0).toFixed(0)} ر.س`}
          subtext={summary?.changeLabel}
          change={summary?.revenueChange}
          changeLabel="مقارنة بالأسبوع السابق"
        />
        <StatCard
          icon={ShoppingCart}
          label="طلبات الأسبوع"
          value={analyticsLoading ? '...' : (summary?.totalOrders || 0).toLocaleString()}
          subtext={`متوسط ${(summary?.avgOrderValue || 0).toFixed(1)} ر.س / طلب`}
          change={summary?.ordersChange}
          changeLabel=""
        />
        <StatCard
          icon={Users}
          label="إجمالي الموظفين"
          value={totalEmployees}
          subtext={`${activeEmployees} نشطين`}
        />
        <StatCard
          icon={Activity}
          label="عملاء هذا الأسبوع"
          value={analyticsLoading ? '...' : (summary?.uniqueCustomers || 0).toLocaleString()}
          subtext="عميل فريد"
          change={summary?.customersChange}
          changeLabel=""
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2 border-0 bg-white dark:bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              اتجاه الإيرادات — آخر 7 أيام
            </CardTitle>
            <CardDescription>الإيرادات اليومية بالريال السعودي</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : revenueTrend.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>لا توجد بيانات متاحة</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D9B6E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2D9B6E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toFixed(2)} ر.س`, 'الإيرادات']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      direction: 'rtl',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#2D9B6E"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={{ fill: '#2D9B6E', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 bg-white dark:bg-card">
          <CardHeader className="pb-4">
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => navigate('/admin/employees')}
              className="w-full bg-accent hover:bg-accent/90 text-white"
              data-testid="button-manage-employees"
            >
              <Users className="w-4 h-4 ml-2" />
              إدارة الموظفين
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/attendance')}
              className="w-full"
              data-testid="button-view-attendance"
            >
              <Calendar className="w-4 h-4 ml-2" />
              الحضور والغياب
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/reports')}
              className="w-full"
              data-testid="button-view-reports"
            >
              <TrendingUp className="w-4 h-4 ml-2" />
              التقارير
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/manager/analytics')}
              className="w-full"
              data-testid="button-view-analytics"
            >
              <BarChart3 className="w-4 h-4 ml-2" />
              التحليلات المتقدمة
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-0 bg-white dark:bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              أفضل المنتجات مبيعاً
            </CardTitle>
            <CardDescription>هذا الأسبوع</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="nameAr"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(v: any) => [`${v} مبيعة`, 'الكمية']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      direction: 'rtl',
                    }}
                  />
                  <Bar dataKey="qty" fill="#2196F3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-0 bg-white dark:bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              طرق الدفع
            </CardTitle>
            <CardDescription>توزيع المدفوعات هذا الأسبوع</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : paymentBreakdown.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {paymentBreakdown.map((p, idx) => (
                  <div key={p.method} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{PAYMENT_LABELS[p.method] || p.method}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{p.amount.toFixed(0)} ر.س</span>
                        <Badge variant="outline" className="text-xs">{p.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${p.percentage}%`,
                          backgroundColor: ['#2D9B6E', '#2196F3', '#FF9800', '#9C27B0', '#607D8B'][idx % 5],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees */}
      <Card className="border-0 bg-white dark:bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>الموظفون</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/employees')}
              data-testid="button-view-all-employees"
            >
              عرض الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {employees && employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-semibold">الاسم</th>
                    <th className="text-right p-3 font-semibold">الدور</th>
                    <th className="text-right p-3 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 6).map((emp: any) => (
                    <tr key={emp.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-3">{emp.fullName}</td>
                      <td className="p-3 text-muted-foreground">{emp.jobTitle}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          emp.isActivated === 1
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-muted-foreground'
                        }`}>
                          {emp.isActivated === 1 ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted-foreground">لا توجد موظفون</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
