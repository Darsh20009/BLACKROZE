import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DrinkImage {
  filename: string;
  url: string;
  uploadedAt: string;
}

interface ImageLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export function ImageLibraryModal({ open, onClose, onSelect, currentUrl }: ImageLibraryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string | null>(currentUrl || null);

  const { data: images = [], isLoading } = useQuery<DrinkImage[]>({
    queryKey: ["/api/drink-images"],
    enabled: open,
    staleTime: 0,
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload-drink-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل رفع الصورة");
      const data = await res.json();
      await queryClient.invalidateQueries({ queryKey: ["/api/drink-images"] });
      setSelected(data.url);
      toast({ title: "تم رفع الصورة", description: "الصورة محفوظة في المكتبة" });
    } catch {
      toast({ title: "خطأ", description: "فشل رفع الصورة", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            مكتبة الصور
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3 border-b">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            data-testid="input-image-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-10"
            variant="outline"
            data-testid="button-upload-image"
          >
            {uploading
              ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />جاري الرفع...</>
              : <><Upload className="w-4 h-4 ml-2" />رفع صورة جديدة</>
            }
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد صور في المكتبة</p>
              <p className="text-sm mt-1">ارفع صورة لتبدأ</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img) => {
                const isSelected = selected === img.url;
                return (
                  <button
                    key={img.filename}
                    type="button"
                    onClick={() => setSelected(img.url)}
                    data-testid={`button-img-${img.filename}`}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary shadow-lg scale-[0.97]"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-1">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel-image"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1"
            data-testid="button-confirm-image"
          >
            اختيار الصورة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
