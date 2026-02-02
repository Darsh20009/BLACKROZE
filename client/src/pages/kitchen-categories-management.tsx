import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChefHat, 
  Coffee,
  UtensilsCrossed,
  Cake,
  ArrowLeft,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  _id: string;
  id: string;
  nameAr: string;
  nameEn?: string;
  description?: string;
  isActive: number;
  sortOrder?: number;
}

interface KitchenDepartment {
  _id: string;
  id: string;
  nameAr: string;
  nameEn?: string;
  description?: string;
  type: 'drinks' | 'food' | 'desserts' | 'other';
  isActive: number;
  categories?: string[];
  sortOrder?: number;
}

export default function KitchenCategoriesManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [kitchens, setKitchens] = useState<KitchenDepartment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Category form
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    nameAr: "",
    nameEn: "",
    description: "",
  });

  // Kitchen form
  const [showKitchenDialog, setShowKitchenDialog] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<KitchenDepartment | null>(null);
  const [kitchenForm, setKitchenForm] = useState({
    nameAr: "",
    nameEn: "",
    description: "",
    type: "other" as 'drinks' | 'food' | 'desserts' | 'other',
    categories: [] as string[],
  });

  useEffect(() => {
    fetchCategories();
    fetchKitchens();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchKitchens = async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      const response = await fetch("/api/kitchen-departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setKitchens(data);
      }
    } catch (error) {
      console.error("Error fetching kitchens:", error);
    }
  };

  const handleSaveCategory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("employeeToken");
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}` 
        : "/api/categories";
      
      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...categoryForm,
          isActive: 1,
        }),
      });

      if (response.ok) {
        toast({
          title: "نجح الحفظ",
          description: editingCategory ? "تم تحديث القسم بنجاح" : "تم إضافة القسم بنجاح",
          className: "bg-green-600 text-white",
        });
        fetchCategories();
        setShowCategoryDialog(false);
        resetCategoryForm();
      } else {
        throw new Error("Failed to save category");
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ القسم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;

    try {
      const token = localStorage.getItem("employeeToken");
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: "تم الحذف",
          description: "تم حذف القسم بنجاح",
          className: "bg-green-600 text-white",
        });
        fetchCategories();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف القسم",
        variant: "destructive",
      });
    }
  };

  const handleSaveKitchen = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("employeeToken");
      const url = editingKitchen 
        ? `/api/kitchen-departments/${editingKitchen.id}` 
        : "/api/kitchen-departments";
      
      const response = await fetch(url, {
        method: editingKitchen ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...kitchenForm,
          isActive: 1,
        }),
      });

      if (response.ok) {
        toast({
          title: "نجح الحفظ",
          description: editingKitchen ? "تم تحديث المطبخ بنجاح" : "تم إضافة المطبخ بنجاح",
          className: "bg-green-600 text-white",
        });
        fetchKitchens();
        setShowKitchenDialog(false);
        resetKitchenForm();
      } else {
        throw new Error("Failed to save kitchen");
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ المطبخ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKitchen = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المطبخ؟")) return;

    try {
      const token = localStorage.getItem("employeeToken");
      const response = await fetch(`/api/kitchen-departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: "تم الحذف",
          description: "تم حذف المطبخ بنجاح",
          className: "bg-green-600 text-white",
        });
        fetchKitchens();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف المطبخ",
        variant: "destructive",
      });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ nameAr: "", nameEn: "", description: "" });
    setEditingCategory(null);
  };

  const resetKitchenForm = () => {
    setKitchenForm({ 
      nameAr: "", 
      nameEn: "", 
      description: "", 
      type: "other",
      categories: [],
    });
    setEditingKitchen(null);
  };

  const getKitchenIcon = (type: string) => {
    switch (type) {
      case "drinks": return <Coffee className="w-5 h-5" />;
      case "food": return <UtensilsCrossed className="w-5 h-5" />;
      case "desserts": return <Cake className="w-5 h-5" />;
      default: return <ChefHat className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/employee/dashboard")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <ChefHat className="w-8 h-8" />
                إدارة المطابخ والأقسام
              </h1>
              <p className="text-amber-100 mt-1">إدارة أقسام المشروبات والمطابخ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Section */}
          <div>
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Coffee className="w-6 h-6 text-blue-600" />
                    أقسام المشروبات والمنتجات
                  </CardTitle>
                  <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={resetCategoryForm} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة قسم جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>الاسم بالعربية *</Label>
                          <Input
                            value={categoryForm.nameAr}
                            onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                            placeholder="مثال: القهوة الساخنة"
                          />
                        </div>
                        <div>
                          <Label>الاسم بالإنجليزية</Label>
                          <Input
                            value={categoryForm.nameEn}
                            onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                            placeholder="Example: Hot Coffee"
                          />
                        </div>
                        <div>
                          <Label>الوصف</Label>
                          <Input
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            placeholder="وصف القسم..."
                          />
                        </div>
                        <Button 
                          onClick={handleSaveCategory} 
                          disabled={!categoryForm.nameAr || loading}
                          className="w-full"
                        >
                          <Save className="w-4 h-4 ml-2" />
                          حفظ
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Coffee className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>لا توجد أقسام. أضف قسماً جديداً!</p>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <Card key={category._id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{category.nameAr}</h3>
                              {category.nameEn && (
                                <p className="text-sm text-gray-600">{category.nameEn}</p>
                              )}
                              {category.description && (
                                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={category.isActive ? "default" : "secondary"}>
                                {category.isActive ? "نشط" : "غير نشط"}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryForm({
                                    nameAr: category.nameAr,
                                    nameEn: category.nameEn || "",
                                    description: category.description || "",
                                  });
                                  setShowCategoryDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kitchens Section */}
          <div>
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-100 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-orange-600" />
                    المطابخ والأقسام
                  </CardTitle>
                  <Dialog open={showKitchenDialog} onOpenChange={setShowKitchenDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={resetKitchenForm} className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة مطبخ جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingKitchen ? "تعديل المطبخ" : "إضافة مطبخ جديد"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>الاسم بالعربية *</Label>
                          <Input
                            value={kitchenForm.nameAr}
                            onChange={(e) => setKitchenForm({ ...kitchenForm, nameAr: e.target.value })}
                            placeholder="مثال: مطبخ القهوة"
                          />
                        </div>
                        <div>
                          <Label>الاسم بالإنجليزية</Label>
                          <Input
                            value={kitchenForm.nameEn}
                            onChange={(e) => setKitchenForm({ ...kitchenForm, nameEn: e.target.value })}
                            placeholder="Example: Coffee Kitchen"
                          />
                        </div>
                        <div>
                          <Label>النوع *</Label>
                          <Select
                            value={kitchenForm.type}
                            onValueChange={(value: any) => setKitchenForm({ ...kitchenForm, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="drinks">مشروبات</SelectItem>
                              <SelectItem value="food">أطعمة</SelectItem>
                              <SelectItem value="desserts">حلويات</SelectItem>
                              <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>الوصف</Label>
                          <Input
                            value={kitchenForm.description}
                            onChange={(e) => setKitchenForm({ ...kitchenForm, description: e.target.value })}
                            placeholder="وصف المطبخ..."
                          />
                        </div>
                        <Button 
                          onClick={handleSaveKitchen} 
                          disabled={!kitchenForm.nameAr || loading}
                          className="w-full"
                        >
                          <Save className="w-4 h-4 ml-2" />
                          حفظ
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {kitchens.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ChefHat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>لا توجد مطابخ. أضف مطبخاً جديداً!</p>
                    </div>
                  ) : (
                    kitchens.map((kitchen) => (
                      <Card key={kitchen._id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                {getKitchenIcon(kitchen.type)}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{kitchen.nameAr}</h3>
                                {kitchen.nameEn && (
                                  <p className="text-sm text-gray-600">{kitchen.nameEn}</p>
                                )}
                                {kitchen.description && (
                                  <p className="text-sm text-gray-500 mt-1">{kitchen.description}</p>
                                )}
                                <Badge variant="outline" className="mt-2">
                                  {kitchen.type === 'drinks' && 'مشروبات'}
                                  {kitchen.type === 'food' && 'أطعمة'}
                                  {kitchen.type === 'desserts' && 'حلويات'}
                                  {kitchen.type === 'other' && 'أخرى'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={kitchen.isActive ? "default" : "secondary"}>
                                {kitchen.isActive ? "نشط" : "غير نشط"}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingKitchen(kitchen);
                                  setKitchenForm({
                                    nameAr: kitchen.nameAr,
                                    nameEn: kitchen.nameEn || "",
                                    description: kitchen.description || "",
                                    type: kitchen.type,
                                    categories: kitchen.categories || [],
                                  });
                                  setShowKitchenDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteKitchen(kitchen.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
