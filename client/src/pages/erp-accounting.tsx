import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Receipt,
  FileText,
  Plus,
  ChevronRight,
  ChevronDown,
  Building2,
  PiggyBank,
  CreditCard,
  Banknote,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Settings,
  CheckCircle,
  Clock,
  XCircle,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Account {
  id: string;
  accountNumber: string;
  nameAr: string;
  nameEn?: string;
  accountType: string;
  normalBalance: string;
  currentBalance: number;
  isActive: number;
  level: number;
  children?: Account[];
}

interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashBalance: number;
  pendingExpenses: number;
  invoiceCount: number;
}

interface TrialBalanceItem {
  accountNumber: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

interface IncomeStatement {
  revenue: Array<{ accountName: string; amount: number }>;
  totalRevenue: number;
  expenses: Array<{ accountName: string; amount: number }>;
  totalExpenses: number;
  cogs: number;
  grossProfit: number;
  netIncome: number;
}

const accountTypeLabels: Record<string, string> = {
  asset: "أصول",
  liability: "خصوم",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
  contra: "حساب مقابل",
};

const accountTypeColors: Record<string, string> = {
  asset: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  liability: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  equity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  revenue: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  expense: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

function AccountTreeNode({ account, level = 0 }: { account: Account; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <div className="border-b border-border/50 last:border-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="flex items-center gap-2 py-2 px-3 hover-elevate cursor-pointer"
          style={{ paddingRight: `${level * 20 + 12}px` }}
        >
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6" />
          )}
          <span className="font-mono text-sm text-muted-foreground">{account.accountNumber}</span>
          <span className="flex-1 font-medium">{account.nameAr}</span>
          <Badge className={accountTypeColors[account.accountType] || "bg-gray-100"}>
            {accountTypeLabels[account.accountType]}
          </Badge>
          <span className="font-mono text-sm min-w-[100px] text-left">
            {account.currentBalance.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س
          </span>
        </div>
        {hasChildren && (
          <CollapsibleContent>
            {account.children?.map((child) => (
              <AccountTreeNode key={child.id} account={child} level={level + 1} />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  trend?: "up" | "down";
  trendValue?: string;
  color: string;
}) {
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {value.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س
            </p>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ErpAccountingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountNumber: "",
    nameAr: "",
    nameEn: "",
    accountType: "asset",
    normalBalance: "debit",
    openingBalance: 0,
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<{ success: boolean; summary: DashboardSummary }>({
    queryKey: ["/api/erp/dashboard"],
  });

  const { data: accountsData, isLoading: accountsLoading } = useQuery<{ success: boolean; tree: Account[] }>({
    queryKey: ["/api/erp/accounts/tree"],
  });

  const { data: trialBalanceData, isLoading: trialBalanceLoading } = useQuery<{ success: boolean; trialBalance: TrialBalanceItem[] }>({
    queryKey: ["/api/erp/reports/trial-balance"],
  });

  const { data: incomeStatementData, isLoading: incomeLoading } = useQuery<{ success: boolean; incomeStatement: IncomeStatement }>({
    queryKey: ["/api/erp/reports/income-statement"],
  });

  const initializeAccountsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/erp/accounts/initialize"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/erp/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/erp/accounts/tree"] });
      toast({ title: "تم إنشاء دليل الحسابات بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في إنشاء دليل الحسابات", variant: "destructive" });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: (data: typeof newAccount) => apiRequest("POST", "/api/erp/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/erp/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/erp/accounts/tree"] });
      setShowAddAccountDialog(false);
      setNewAccount({ accountNumber: "", nameAr: "", nameEn: "", accountType: "asset", normalBalance: "debit", openingBalance: 0 });
      toast({ title: "تم إنشاء الحساب بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "فشل في إنشاء الحساب", variant: "destructive" });
    },
  });

  const summary = dashboardData?.summary;
  const accounts = accountsData?.tree || [];
  const trialBalance = trialBalanceData?.trialBalance || [];
  const incomeStatement = incomeStatementData?.incomeStatement;

  const totalDebit = trialBalance.reduce((sum, item) => sum + item.debitBalance, 0);
  const totalCredit = trialBalance.reduce((sum, item) => sum + item.creditBalance, 0);

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-playfair text-foreground">نظام المحاسبة ERP</h1>
            <p className="text-muted-foreground mt-1">إدارة الحسابات والتقارير المالية</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/erp"] });
              }}
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
            <Button
              onClick={() => initializeAccountsMutation.mutate()}
              disabled={initializeAccountsMutation.isPending}
              data-testid="button-init-coa"
            >
              {initializeAccountsMutation.isPending ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 ml-2" />
              )}
              تهيئة دليل الحسابات
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <BarChart3 className="h-4 w-4 ml-2" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger value="accounts" data-testid="tab-accounts">
              <Building2 className="h-4 w-4 ml-2" />
              دليل الحسابات
            </TabsTrigger>
            <TabsTrigger value="trial-balance" data-testid="tab-trial-balance">
              <FileText className="h-4 w-4 ml-2" />
              ميزان المراجعة
            </TabsTrigger>
            <TabsTrigger value="income" data-testid="tab-income">
              <TrendingUp className="h-4 w-4 ml-2" />
              قائمة الدخل
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : summary ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SummaryCard
                    title="إجمالي الإيرادات"
                    value={summary.totalRevenue}
                    icon={TrendingUp}
                    color="bg-green-500"
                    trend="up"
                    trendValue="+12%"
                  />
                  <SummaryCard
                    title="إجمالي المصروفات"
                    value={summary.totalExpenses}
                    icon={TrendingDown}
                    color="bg-red-500"
                  />
                  <SummaryCard
                    title="صافي الدخل"
                    value={summary.netIncome}
                    icon={DollarSign}
                    color="bg-primary"
                    trend={summary.netIncome > 0 ? "up" : "down"}
                    trendValue={summary.netIncome > 0 ? "ربح" : "خسارة"}
                  />
                  <SummaryCard
                    title="رصيد الصندوق"
                    value={summary.cashBalance}
                    icon={Wallet}
                    color="bg-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الذمم المدينة</p>
                          <p className="text-lg font-bold">{summary.accountsReceivable.toLocaleString("ar-SA")} ر.س</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                          <Banknote className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الذمم الدائنة</p>
                          <p className="text-lg font-bold">{summary.accountsPayable.toLocaleString("ar-SA")} ر.س</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">مصروفات معلقة</p>
                          <p className="text-lg font-bold">{summary.pendingExpenses}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                          <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                          <p className="text-lg font-bold">{summary.invoiceCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="bg-card border-border/50">
                <CardContent className="p-12 text-center">
                  <PiggyBank className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد بيانات</h3>
                  <p className="text-muted-foreground mb-4">يرجى تهيئة دليل الحسابات أولاً</p>
                  <Button onClick={() => initializeAccountsMutation.mutate()} disabled={initializeAccountsMutation.isPending}>
                    تهيئة دليل الحسابات
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">دليل الحسابات</h2>
              <Button onClick={() => setShowAddAccountDialog(true)} data-testid="button-add-account">
                <Plus className="h-4 w-4 ml-2" />
                إضافة حساب
              </Button>
            </div>

            <Card className="bg-card border-border/50">
              {accountsLoading ? (
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </CardContent>
              ) : accounts.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <div className="p-4">
                    {accounts.map((account) => (
                      <AccountTreeNode key={account.id} account={account} />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <CardContent className="p-12 text-center">
                  <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا يوجد دليل حسابات</h3>
                  <p className="text-muted-foreground mb-4">اضغط على تهيئة دليل الحسابات لإنشاء الحسابات الافتراضية</p>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="trial-balance" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">ميزان المراجعة</h2>
              <Button variant="outline" data-testid="button-export-trial-balance">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>

            <Card className="bg-card border-border/50">
              {trialBalanceLoading ? (
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </CardContent>
              ) : trialBalance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-left">مدين</TableHead>
                      <TableHead className="text-left">دائن</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trialBalance.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{item.accountNumber}</TableCell>
                        <TableCell>{item.accountName}</TableCell>
                        <TableCell>
                          <Badge className={accountTypeColors[item.accountType] || "bg-gray-100"}>
                            {accountTypeLabels[item.accountType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left font-mono">
                          {item.debitBalance > 0 ? item.debitBalance.toLocaleString("ar-SA", { minimumFractionDigits: 2 }) : "-"}
                        </TableCell>
                        <TableCell className="text-left font-mono">
                          {item.creditBalance > 0 ? item.creditBalance.toLocaleString("ar-SA", { minimumFractionDigits: 2 }) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3} className="text-right">المجموع</TableCell>
                      <TableCell className="text-left font-mono">{totalDebit.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-left font-mono">{totalCredit.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد بيانات</h3>
                  <p className="text-muted-foreground">يرجى تهيئة دليل الحسابات وإضافة قيود</p>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">قائمة الدخل</h2>
              <Button variant="outline" data-testid="button-export-income">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>

            {incomeLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : incomeStatement ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      الإيرادات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {incomeStatement.revenue.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border/50">
                        <span>{item.accountName}</span>
                        <span className="font-mono text-green-600">{item.amount.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 font-bold bg-green-50 dark:bg-green-900/20 px-3 rounded">
                      <span>إجمالي الإيرادات</span>
                      <span className="font-mono text-green-600">{incomeStatement.totalRevenue.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      المصروفات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span>تكلفة البضاعة المباعة</span>
                      <span className="font-mono text-red-600">{incomeStatement.cogs.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س</span>
                    </div>
                    {incomeStatement.expenses.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border/50">
                        <span>{item.accountName}</span>
                        <span className="font-mono text-red-600">{item.amount.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 font-bold bg-red-50 dark:bg-red-900/20 px-3 rounded">
                      <span>إجمالي المصروفات</span>
                      <span className="font-mono text-red-600">{(incomeStatement.totalExpenses + incomeStatement.cogs).toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">إجمالي الربح</p>
                        <p className="text-2xl font-bold text-green-600">
                          {incomeStatement.grossProfit.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س
                        </p>
                      </div>
                      <div className="border-x border-border">
                        <p className="text-sm text-muted-foreground mb-1">مصروفات التشغيل</p>
                        <p className="text-2xl font-bold text-red-600">
                          {incomeStatement.totalExpenses.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">صافي الدخل</p>
                        <p className={`text-2xl font-bold ${incomeStatement.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {incomeStatement.netIncome.toLocaleString("ar-SA", { minimumFractionDigits: 2 })} ر.س
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-card border-border/50">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد بيانات</h3>
                  <p className="text-muted-foreground">يرجى تهيئة دليل الحسابات وإضافة قيود</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة حساب جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الحساب</Label>
                <Input
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                  placeholder="مثال: 1115"
                  data-testid="input-account-number"
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <Select
                  value={newAccount.accountType}
                  onValueChange={(value) => setNewAccount({ ...newAccount, accountType: value })}
                >
                  <SelectTrigger data-testid="select-account-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">أصول</SelectItem>
                    <SelectItem value="liability">خصوم</SelectItem>
                    <SelectItem value="equity">حقوق ملكية</SelectItem>
                    <SelectItem value="revenue">إيرادات</SelectItem>
                    <SelectItem value="expense">مصروفات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>اسم الحساب (عربي)</Label>
              <Input
                value={newAccount.nameAr}
                onChange={(e) => setNewAccount({ ...newAccount, nameAr: e.target.value })}
                placeholder="اسم الحساب"
                data-testid="input-account-name-ar"
              />
            </div>
            <div className="space-y-2">
              <Label>اسم الحساب (إنجليزي)</Label>
              <Input
                value={newAccount.nameEn}
                onChange={(e) => setNewAccount({ ...newAccount, nameEn: e.target.value })}
                placeholder="Account Name"
                data-testid="input-account-name-en"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الطبيعة</Label>
                <Select
                  value={newAccount.normalBalance}
                  onValueChange={(value) => setNewAccount({ ...newAccount, normalBalance: value })}
                >
                  <SelectTrigger data-testid="select-normal-balance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">مدين</SelectItem>
                    <SelectItem value="credit">دائن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الرصيد الافتتاحي</Label>
                <Input
                  type="number"
                  value={newAccount.openingBalance}
                  onChange={(e) => setNewAccount({ ...newAccount, openingBalance: parseFloat(e.target.value) || 0 })}
                  data-testid="input-opening-balance"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => createAccountMutation.mutate(newAccount)}
              disabled={createAccountMutation.isPending || !newAccount.accountNumber || !newAccount.nameAr}
              data-testid="button-submit-account"
            >
              {createAccountMutation.isPending ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : null}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
