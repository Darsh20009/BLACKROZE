import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, ArrowRight, MessageSquare, Trash2, Reply, TrendingUp, ThumbsUp } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Review {
  _id: string;
  productId: string;
  productName?: string;
  customerId: string;
  rating: number;
  comment?: string;
  adminReply?: string;
  adminReplyDate?: string;
  isVerifiedPurchase: number;
  helpful: number;
  createdAt: string;
}

interface ReviewStats {
  total: number;
  unreplied: number;
  avgRating: string;
  byRating: Record<string, number>;
}

function StarRating({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-${size} h-${size} ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

export default function ManagerReviews() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [repliedFilter, setRepliedFilter] = useState("all");

  const params = new URLSearchParams();
  if (ratingFilter !== "all") params.set("rating", ratingFilter);
  if (repliedFilter !== "all") params.set("replied", repliedFilter);

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/manager/reviews", ratingFilter, repliedFilter],
    queryFn: async () => {
      const res = await fetch(`/api/manager/reviews?${params.toString()}`, { credentials: 'include' });
      return res.json();
    },
  });

  const { data: stats } = useQuery<ReviewStats>({ queryKey: ["/api/manager/reviews/stats"] });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: any) => apiRequest("PATCH", `/api/manager/reviews/${id}/reply`, { reply }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/reviews/stats"] });
      setReplyingTo(null);
      setReplyText("");
      toast({ title: "تم إضافة الرد" });
    },
    onError: (e: any) => toast({ title: e.message || "فشل", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/manager/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/reviews/stats"] });
      toast({ title: "تم حذف التقييم" });
    },
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating === 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 pb-20" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/manager/dashboard")} data-testid="button-back">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">تقييمات العملاء</h1>
            <p className="text-muted-foreground text-sm">إدارة والرد على تقييمات المنتجات</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{stats.avgRating}</p>
                <StarRating rating={Math.round(Number(stats.avgRating))} size={4} />
                <p className="text-xs text-muted-foreground mt-1">متوسط التقييم</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" data-testid="text-total-reviews">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">إجمالي التقييمات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-bold ${stats.unreplied > 0 ? "text-orange-600" : "text-green-600"}`}>{stats.unreplied}</p>
                <p className="text-xs text-muted-foreground mt-1">بانتظار الرد</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex justify-center gap-1 mb-1">
                  {[5,4,3,2,1].map(r => (
                    <div key={r} className="text-center">
                      <div className="text-xs font-bold">{stats.byRating[r] || 0}</div>
                      <div className={`w-1 rounded-full ${r >= 4 ? 'bg-green-400' : r === 3 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ height: `${Math.max(4, ((stats.byRating[r] || 0) / Math.max(stats.total, 1)) * 40)}px` }} />
                      <div className="text-xs text-muted-foreground">{r}★</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">توزيع التقييمات</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-36" data-testid="select-rating-filter"><SelectValue placeholder="التقييم" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل التقييمات</SelectItem>
              {[5,4,3,2,1].map(r => <SelectItem key={r} value={String(r)}>{r} نجوم</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={repliedFilter} onValueChange={setRepliedFilter}>
            <SelectTrigger className="w-36" data-testid="select-replied-filter"><SelectValue placeholder="الرد" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="no">بانتظار الرد</SelectItem>
              <SelectItem value="yes">تم الرد</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-center py-12 text-muted-foreground">جارٍ التحميل...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد تقييمات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <Card key={review._id} data-testid={`card-review-${review._id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={review.rating} />
                        <span className={`text-sm font-bold ${getRatingColor(review.rating)}`}>{review.rating}/5</span>
                        {review.isVerifiedPurchase === 1 && (
                          <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                            <ThumbsUp className="w-3 h-3 ml-1" /> مشتري موثق
                          </Badge>
                        )}
                      </div>
                      {review.productName && <p className="text-sm text-primary font-medium">{review.productName}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="flex gap-1">
                      {!review.adminReply && (
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => { setReplyingTo(review); setReplyText(""); }} data-testid={`button-reply-${review._id}`}>
                          <Reply className="w-3 h-3 ml-1" /> رد
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500" onClick={() => deleteMutation.mutate(review._id)} data-testid={`button-delete-${review._id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {review.comment && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        {review.comment}
                      </p>
                    </div>
                  )}

                  {review.adminReply && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Reply className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">رد الإدارة</span>
                        {review.adminReplyDate && <span className="text-xs text-muted-foreground mr-auto">{new Date(review.adminReplyDate).toLocaleDateString('ar-SA')}</span>}
                      </div>
                      <p className="text-sm">{review.adminReply}</p>
                      <Button variant="ghost" size="sm" className="text-xs mt-1 h-6" onClick={() => { setReplyingTo(review); setReplyText(review.adminReply || ""); }} data-testid={`button-edit-reply-${review._id}`}>تعديل الرد</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!replyingTo} onOpenChange={(open) => { if (!open) setReplyingTo(null); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Reply className="w-5 h-5" /> الرد على التقييم</DialogTitle>
          </DialogHeader>
          {replyingTo && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded p-3">
                <StarRating rating={replyingTo.rating} />
                <p className="text-sm mt-1">{replyingTo.comment || "لا يوجد تعليق"}</p>
              </div>
              <div>
                <Label className="mb-2 block">ردك على العميل *</Label>
                <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="اكتب ردك هنا..." rows={4} data-testid="input-reply-text" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => replyMutation.mutate({ id: replyingTo._id, reply: replyText })} disabled={replyMutation.isPending || !replyText.trim()} data-testid="button-submit-reply">
                  {replyMutation.isPending ? "جارٍ الإرسال..." : "إرسال الرد"}
                </Button>
                <Button variant="outline" onClick={() => setReplyingTo(null)}>إلغاء</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
