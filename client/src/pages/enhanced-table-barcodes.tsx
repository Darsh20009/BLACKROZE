import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { Download, QrCode, Printer, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Table {
  _id: string;
  id: string;
  tableNumber: string;
  qrToken: string;
  capacity: number;
  location?: string;
  isOccupied: boolean;
}

export default function EnhancedTableBarcodes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (tables.length > 0) {
      generateAllQRCodes();
    }
  }, [tables, selectedDesign]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("employeeToken");
      const response = await fetch("/api/tables", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل الطاولات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeURL = async (table: Table): Promise<string> => {
    const qrUrl = `${window.location.origin}/table-menu/${table.qrToken}`;
    return await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  };

  const generateAllQRCodes = async () => {
    for (const table of tables) {
      const canvas = canvasRefs.current[table.id];
      if (!canvas) continue;

      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;

      // Clear canvas
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      try {
        // Generate QR code
        const qrDataUrl = await generateQRCodeURL(table);
        const qrImage = new Image();
        
        await new Promise((resolve, reject) => {
          qrImage.onload = resolve;
          qrImage.onerror = reject;
          qrImage.src = qrDataUrl;
        });

        if (selectedDesign === 'modern') {
          // Modern design with gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#F59E0B');
          gradient.addColorStop(1, '#EA580C');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, 150);

          // Header text
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('BLACK ROSE', canvas.width / 2, 70);
          
          ctx.font = '32px Arial';
          ctx.fillText('امسح للطلب', canvas.width / 2, 120);

          // Table number badge
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.roundRect(canvas.width / 2 - 100, 170, 200, 80, 15);
          ctx.fill();
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 42px Arial';
          ctx.fillText(`طاولة ${table.tableNumber}`, canvas.width / 2, 225);

          // QR Code with shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 5;
          ctx.drawImage(qrImage, canvas.width / 2 - 150, 270, 300, 300);
          ctx.shadowColor = 'transparent';

        } else if (selectedDesign === 'classic') {
          // Classic design with border
          ctx.strokeStyle = '#92400E';
          ctx.lineWidth = 10;
          ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

          // Header
          ctx.fillStyle = '#92400E';
          ctx.font = 'bold 44px serif';
          ctx.textAlign = 'center';
          ctx.fillText('BLACK ROSE', canvas.width / 2, 80);

          // Decorative line
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - 150, 100);
          ctx.lineTo(canvas.width / 2 + 150, 100);
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Table number
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 38px serif';
          ctx.fillText(`طاولة رقم ${table.tableNumber}`, canvas.width / 2, 160);

          // QR Code
          ctx.drawImage(qrImage, canvas.width / 2 - 140, 190, 280, 280);

          // Footer
          ctx.font = '28px serif';
          ctx.fillStyle = '#666666';
          ctx.fillText('امسح الكود للطلب', canvas.width / 2, 510);

        } else {
          // Minimal design
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 36px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('BLACK ROSE', canvas.width / 2, 60);

          // Simple table number
          ctx.font = '32px Arial';
          ctx.fillText(`طاولة ${table.tableNumber}`, canvas.width / 2, 120);

          // Thin line
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - 100, 140);
          ctx.lineTo(canvas.width / 2 + 100, 140);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.stroke();

          // QR Code - centered and larger
          ctx.drawImage(qrImage, canvas.width / 2 - 160, 170, 320, 320);

          // Simple instruction
          ctx.font = '24px Arial';
          ctx.fillText('امسح للطلب', canvas.width / 2, 530);
        }

      } catch (error) {
        console.error('Error generating QR code for table', table.tableNumber, error);
      }
    }
  };

  const downloadQRCode = (table: Table) => {
    const canvas = canvasRefs.current[table.id];
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `table-${table.tableNumber}-qr.png`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "تم التحميل",
          description: `تم تحميل باركود الطاولة ${table.tableNumber}`,
          className: "bg-green-600 text-white",
        });
      }
    });
  };

  const downloadAllQRCodes = async () => {
    for (const table of tables) {
      await new Promise(resolve => setTimeout(resolve, 100));
      downloadQRCode(table);
    }
    
    toast({
      title: "جاري التحميل",
      description: "جاري تحميل جميع باركودات الطاولات...",
      className: "bg-blue-600 text-white",
    });
  };

  const printQRCode = (table: Table) => {
    const canvas = canvasRefs.current[table.id];
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>طباعة باركود - طاولة ${table.tableNumber}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 100%; height: auto; }
              @media print {
                body { margin: 0; }
                img { width: 100%; page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Table ${table.tableNumber} QR Code" />
            <script>
              window.onload = () => {
                window.print();
                setTimeout(() => window.close(), 100);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/manager/tables")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <QrCode className="w-8 h-8" />
                  باركود الطاولات المحسّن
                </h1>
                <p className="text-amber-100 mt-1">تصميمات جديدة ومحسّنة لباركود الطاولات</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={generateAllQRCodes}
                variant="outline"
                className="bg-white text-amber-600 hover:bg-amber-50"
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button
                onClick={downloadAllQRCodes}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 ml-2" />
                تحميل الكل
              </Button>
            </div>
          </div>

          {/* Design selector */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Label className="text-white font-semibold">اختر التصميم:</Label>
            <div className="flex gap-2">
              <Button
                variant={selectedDesign === 'modern' ? 'default' : 'outline'}
                onClick={() => setSelectedDesign('modern')}
                className={selectedDesign === 'modern' ? 'bg-white text-amber-600' : 'bg-white/20 text-white hover:bg-white/30'}
              >
                عصري
              </Button>
              <Button
                variant={selectedDesign === 'classic' ? 'default' : 'outline'}
                onClick={() => setSelectedDesign('classic')}
                className={selectedDesign === 'classic' ? 'bg-white text-amber-600' : 'bg-white/20 text-white hover:bg-white/30'}
              >
                كلاسيكي
              </Button>
              <Button
                variant={selectedDesign === 'minimal' ? 'default' : 'outline'}
                onClick={() => setSelectedDesign('minimal')}
                className={selectedDesign === 'minimal' ? 'bg-white text-amber-600' : 'bg-white/20 text-white hover:bg-white/30'}
              >
                بسيط
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-amber-600" />
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : tables.length === 0 ? (
          <Card className="p-12 text-center">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">لا توجد طاولات متاحة</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <Card key={table._id} className="shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">طاولة {table.tableNumber}</CardTitle>
                    <Badge variant={table.isOccupied ? "destructive" : "default"}>
                      {table.isOccupied ? "مشغولة" : "متاحة"}
                    </Badge>
                  </div>
                  {table.location && (
                    <p className="text-sm text-gray-600">الموقع: {table.location}</p>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-white rounded-lg p-2 mb-4 border-2 border-gray-200">
                    <canvas
                      ref={(el) => {
                        if (el) canvasRefs.current[table.id] = el;
                      }}
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadQRCode(table)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                      size="sm"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل
                    </Button>
                    <Button
                      onClick={() => printQRCode(table)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Printer className="w-4 h-4 ml-2" />
                      طباعة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
