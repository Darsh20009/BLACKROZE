import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, ArrowRight, Plus, Trash2, Calendar, Users, Edit2 } from "lucide-react";
import type { Employee } from "@shared/schema";

interface Shift {
  id: string;
  name: string;
  nameAr: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes: number;
  isOvernight: boolean;
  color: string;
  isActive: boolean;
}

interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  dayOfWeek: number;
  shift?: Shift;
}

const DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function EmployeeScheduling() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAddShift, setShowAddShift] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [shiftForm, setShiftForm] = useState({ name: "", nameAr: "", startTime: "08:00", endTime: "16:00", breakDurationMinutes: "60", isOvernight: false, color: "#9FB2B3" });
  const [assignForm, setAssignForm] = useState({ employeeId: "", shiftId: "", dayOfWeek: "0", effectiveFrom: new Date().toISOString().split('T')[0] });

  const { data: shifts = [] } = useQuery<Shift[]>({ queryKey: ["/api/shifts"] });
  const { data: assignments = [] } = useQuery<ShiftAssignment[]>({ queryKey: ["/api/shift-assignments"] });
  const { data: employees = [] } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });

  const createShiftMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/shifts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      setShowAddShift(false);
      setShiftForm({ name: "", nameAr: "", startTime: "08:00", endTime: "16:00", breakDurationMinutes: "60", isOvernight: false, color: "#9FB2B3" });
      toast({ title: "تمت إضافة الوردية" });
    },
    onError: (e: any) => toast({ title: e.message || "فشل", variant: "destructive" }),
  });

  const updateShiftMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PUT", `/api/shifts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      setEditShift(null);
      toast({ title: "تم تحديث الوردية" });
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/shifts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/shifts"] }),
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/shift-assignments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });
      setShowAssign(false);
      toast({ title: "تم تعيين الوردية للموظف" });
    },
    onError: (e: any) => toast({ title: e.message || "فشل", variant: "destructive" }),
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/shift-assignments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] }),
  });

  const getEmployeeName = (id: string) => {
    const emp = (employees as any[]).find((e: any) => e.id === id || e._id === id);
    return emp?.name || emp?.nameAr || id;
  };

  const getShiftDuration = (shift: Shift) => {
    const [sh, sm] = shift.startTime.split(':').map(Number);
    const [eh, em] = shift.endTime.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    mins -= shift.breakDurationMinutes || 0;
    return `${Math.floor(mins / 60)}س ${mins % 60 > 0 ? mins % 60 + 'د' : ''}`;
  };

  const openEdit = (shift: Shift) => {
    setEditShift(shift);
    setShiftForm({
      name: shift.name, nameAr: shift.nameAr,
      startTime: shift.startTime, endTime: shift.endTime,
      breakDurationMinutes: String(shift.breakDurationMinutes),
      isOvernight: shift.isOvernight, color: shift.color,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/manager/dashboard")} data-testid="button-back">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">جدولة المناوبات</h1>
            <p className="text-muted-foreground text-sm">إدارة ورديات الموظفين والجداول</p>
          </div>
        </div>

        <Tabs defaultValue="shifts">
          <TabsList className="mb-4">
            <TabsTrigger value="shifts" data-testid="tab-shifts"><Clock className="w-4 h-4 ml-1" /> الورديات</TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule"><Calendar className="w-4 h-4 ml-1" /> جدول الموظفين</TabsTrigger>
          </TabsList>

          <TabsContent value="shifts">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddShift(true)} data-testid="button-add-shift">
                <Plus className="w-4 h-4 ml-2" /> إضافة وردية
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map(shift => (
                <Card key={shift.id} data-testid={`card-shift-${shift.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color }} />
                        <div>
                          <p className="font-semibold">{shift.nameAr}</p>
                          <p className="text-xs text-muted-foreground">{shift.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(shift)} data-testid={`button-edit-shift-${shift.id}`}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500" onClick={() => deleteShiftMutation.mutate(shift.id)} data-testid={`button-delete-shift-${shift.id}`}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">من</span>
                        <span className="font-mono font-medium">{shift.startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">إلى</span>
                        <span className="font-mono font-medium">{shift.endTime} {shift.isOvernight && <Badge variant="secondary" className="text-xs mr-1">يمتد لليوم التالي</Badge>}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الراحة</span>
                        <span>{shift.breakDurationMinutes} دقيقة</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-muted-foreground">صافي ساعات العمل</span>
                        <span className="font-medium text-primary">{getShiftDuration(shift)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {shifts.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">لا توجد ورديات. أضف أول وردية.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAssign(true)} data-testid="button-assign-shift">
                <Plus className="w-4 h-4 ml-2" /> تعيين وردية لموظف
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {DAY_NAMES.map((day, dayIdx) => {
                const dayAssignments = assignments.filter(a => a.dayOfWeek === dayIdx);
                return (
                  <Card key={dayIdx}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium">{day}</div>
                        <div className="flex flex-wrap gap-2 flex-1">
                          {dayAssignments.length === 0 ? (
                            <span className="text-xs text-muted-foreground">لا يوجد تعيينات</span>
                          ) : (
                            dayAssignments.map(a => (
                              <div key={a.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs" data-testid={`badge-assignment-${a.id}`}>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.shift?.color || '#ccc' }} />
                                <span>{getEmployeeName(a.employeeId)}</span>
                                <span className="text-muted-foreground">({a.shift?.nameAr || '—'})</span>
                                <Button variant="ghost" size="icon" className="w-4 h-4 text-red-400 hover:text-red-600" onClick={() => removeAssignmentMutation.mutate(a.id)}>✕</Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddShift || !!editShift} onOpenChange={(open) => { if (!open) { setShowAddShift(false); setEditShift(null); } }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />{editShift ? "تعديل الوردية" : "إضافة وردية جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>اسم الوردية (عربي) *</Label>
                <Input value={shiftForm.nameAr} onChange={e => setShiftForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: الوردية الصباحية" data-testid="input-shift-name-ar" />
              </div>
              <div>
                <Label>اسم الوردية (إنجليزي)</Label>
                <Input value={shiftForm.name} onChange={e => setShiftForm(f => ({ ...f, name: e.target.value }))} placeholder="Morning Shift" data-testid="input-shift-name-en" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>وقت البدء</Label>
                <Input type="time" value={shiftForm.startTime} onChange={e => setShiftForm(f => ({ ...f, startTime: e.target.value }))} data-testid="input-shift-start" />
              </div>
              <div>
                <Label>وقت الانتهاء</Label>
                <Input type="time" value={shiftForm.endTime} onChange={e => setShiftForm(f => ({ ...f, endTime: e.target.value }))} data-testid="input-shift-end" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>مدة الراحة (دقيقة)</Label>
                <Input type="number" min="0" value={shiftForm.breakDurationMinutes} onChange={e => setShiftForm(f => ({ ...f, breakDurationMinutes: e.target.value }))} data-testid="input-shift-break" />
              </div>
              <div>
                <Label>لون الوردية</Label>
                <Input type="color" value={shiftForm.color} onChange={e => setShiftForm(f => ({ ...f, color: e.target.value }))} className="h-9" data-testid="input-shift-color" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="overnight" checked={shiftForm.isOvernight} onChange={e => setShiftForm(f => ({ ...f, isOvernight: e.target.checked }))} data-testid="checkbox-overnight" />
              <Label htmlFor="overnight">تمتد لليوم التالي (وردية ليلية)</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => editShift ? updateShiftMutation.mutate({ id: editShift.id, data: { ...shiftForm, breakDurationMinutes: Number(shiftForm.breakDurationMinutes) } }) : createShiftMutation.mutate({ ...shiftForm, breakDurationMinutes: Number(shiftForm.breakDurationMinutes) })} disabled={createShiftMutation.isPending || updateShiftMutation.isPending || !shiftForm.nameAr} data-testid="button-save-shift">
                {(createShiftMutation.isPending || updateShiftMutation.isPending) ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddShift(false); setEditShift(null); }}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> تعيين وردية لموظف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الموظف *</Label>
              <Select value={assignForm.employeeId} onValueChange={v => setAssignForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger data-testid="select-employee"><SelectValue placeholder="اختر موظفاً" /></SelectTrigger>
                <SelectContent>
                  {(employees as any[]).map((e: any) => (
                    <SelectItem key={e.id || e._id} value={e.id || e._id}>{e.name || e.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الوردية *</Label>
              <Select value={assignForm.shiftId} onValueChange={v => setAssignForm(f => ({ ...f, shiftId: v }))}>
                <SelectTrigger data-testid="select-shift"><SelectValue placeholder="اختر وردية" /></SelectTrigger>
                <SelectContent>
                  {shifts.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nameAr} ({s.startTime} - {s.endTime})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>اليوم *</Label>
              <Select value={assignForm.dayOfWeek} onValueChange={v => setAssignForm(f => ({ ...f, dayOfWeek: v }))}>
                <SelectTrigger data-testid="select-day"><SelectValue placeholder="اختر اليوم" /></SelectTrigger>
                <SelectContent>
                  {DAY_NAMES.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>تاريخ البدء</Label>
              <Input type="date" value={assignForm.effectiveFrom} onChange={e => setAssignForm(f => ({ ...f, effectiveFrom: e.target.value }))} data-testid="input-effective-from" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => assignMutation.mutate({ ...assignForm, dayOfWeek: Number(assignForm.dayOfWeek) })} disabled={assignMutation.isPending || !assignForm.employeeId || !assignForm.shiftId} data-testid="button-save-assignment">
                {assignMutation.isPending ? "جارٍ الحفظ..." : "تعيين"}
              </Button>
              <Button variant="outline" onClick={() => setShowAssign(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
