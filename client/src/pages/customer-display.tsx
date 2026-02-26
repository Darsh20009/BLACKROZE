import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrderWebSocket } from "@/lib/websocket";
import { CheckCircle, Loader2 } from "lucide-react";
import type { CoffeeItem } from "@shared/schema";
import blackroseLogo from "@assets/blackrose-logo.png";

interface DisplayItem {
  nameAr: string;
  nameEn?: string;
  price: number;
  quantity: number;
  lastAdded?: number;
}

interface DisplayState {
  mode: "idle" | "order_review" | "payment_processing" | "payment_success";
  items?: DisplayItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  orderNumber?: string;
  discount?: number;
}

function useQRCode(text: string) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!text) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(text, {
        width: 200,
        margin: 1,
        color: { dark: "#ffffff", light: "#00000000" },
      }).then(setDataUrl).catch(() => {});
    });
  }, [text]);

  return dataUrl;
}

function ProductStrip({ products }: { products: CoffeeItem[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!products.length) return;
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % products.length;
      const el = listRef.current?.children[indexRef.current] as HTMLElement;
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 3000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (!products.length) return null;

  return (
    <div className="flex flex-col gap-2 overflow-hidden" style={{ width: 120 }}>
      <div
        ref={listRef}
        className="flex flex-col gap-2 overflow-hidden"
        style={{ maxHeight: "100%", pointerEvents: "none" }}
      >
        {[...products, ...products].map((p, idx) => (
          <div
            key={`${p.id}-${idx}`}
            className="flex-shrink-0 rounded-xl overflow-hidden bg-white/10 border border-white/10"
            style={{ width: 112, height: 112 }}
          >
            {(p as any).imageUrl ? (
              <img
                src={(p as any).imageUrl}
                alt={p.nameAr}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-900/40 to-amber-700/30 gap-1 p-2">
                <span className="text-2xl">☕</span>
                <span className="text-white/50 text-center leading-tight" style={{ fontSize: 9 }}>
                  {p.nameAr}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IdleMode({ products, businessConfig }: { products: CoffeeItem[]; businessConfig: any }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featured = products[featuredIndex];
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
  );

  const siteUrl = window.location.origin;
  const qrDataUrl = useQRCode(siteUrl);

  const logoSrc = businessConfig?.logoUrl || blackroseLogo;
  const businessName = businessConfig?.tradeNameEn || businessConfig?.tradeNameAr || businessConfig?.businessName || "BLACK ROSE CAFÉ";

  useEffect(() => {
    const t = setInterval(
      () => setTime(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })),
      10000
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!products.length) return;
    timeRef.current = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % products.length);
    }, 4000);
    return () => { if (timeRef.current) clearInterval(timeRef.current); };
  }, [products.length]);

  return (
    <div className="flex h-full" style={{ pointerEvents: "none" }}>
      {/* Left: QR code panel */}
      <div
        className="flex flex-col items-center justify-center gap-5 border-l border-white/10"
        style={{ width: 220, background: "rgba(0,0,0,0.4)", flexShrink: 0 }}
      >
        {/* Café logo */}
        <img
          src={logoSrc}
          alt={businessName}
          style={{ width: 110, height: 110, objectFit: "contain", borderRadius: "50%", border: "2px solid rgba(245,158,11,0.3)" }}
        />

        {/* QR code */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-2xl p-3 border border-white/10"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR" style={{ width: 140, height: 140 }} />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ width: 140, height: 140 }}
              >
                <Loader2 className="text-white/20 animate-spin" style={{ width: 32, height: 32 }} />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-amber-400/80 text-xs font-semibold tracking-wider mb-1">
              اطلب من موبايلك
            </p>
            <p className="text-white/30 text-xs">Order Online</p>
          </div>
        </div>

        {/* Time */}
        <div className="text-white/30 text-sm font-mono">{time}</div>
      </div>

      {/* Center: main content */}
      <div className="flex-1 flex flex-col items-center justify-between py-10 px-8">
        {/* Header */}
        <div className="text-center">
          <h1
            className="font-black text-white tracking-widest mb-2"
            style={{ fontSize: 52, letterSpacing: "0.15em" }}
          >
            {businessName}
          </h1>
          <p className="text-amber-400/60 text-xl tracking-widest">أهلاً وسهلاً • Welcome</p>
        </div>

        {/* Featured product showcase */}
        {featured ? (
          <div
            key={featuredIndex}
            className="text-center flex flex-col items-center"
            style={{ animation: "fadeInUp 0.6s ease forwards" }}
          >
            <div
              className="rounded-3xl overflow-hidden mb-5 border-2 border-amber-500/30 shadow-2xl"
              style={{ width: 260, height: 260 }}
            >
              {(featured as any).imageUrl ? (
                <img
                  src={(featured as any).imageUrl}
                  alt={featured.nameAr}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/60 to-amber-700/40">
                  <span style={{ fontSize: 80 }}>☕</span>
                </div>
              )}
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">{featured.nameAr}</h2>
            {featured.nameEn && (
              <p className="text-amber-300/50 text-xl mb-4">{featured.nameEn}</p>
            )}
            <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl px-8 py-3">
              <span className="text-amber-400 text-3xl font-bold">
                {Number(featured.price).toFixed(2)}
                <span className="text-xl mr-2"> ر.س</span>
              </span>
            </div>
          </div>
        ) : (
          /* No products yet — show welcome illustration */
          <div className="text-center flex flex-col items-center gap-6">
            <div
              className="rounded-full flex items-center justify-center border-2 border-amber-500/20"
              style={{ width: 240, height: 240, background: "rgba(245,158,11,0.06)" }}
            >
              <span style={{ fontSize: 100 }}>☕</span>
            </div>
            <p className="text-white/30 text-2xl">مرحباً بكم في {businessName}</p>
          </div>
        )}

        {/* Bottom dot indicators */}
        <div className="flex gap-3 justify-center items-center">
          {(products.length > 0 ? products : [0, 1, 2, 3, 4]).slice(0, 5).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === featuredIndex % 5 ? 24 : 8,
                height: 8,
                backgroundColor: i === featuredIndex % 5 ? "#f59e0b" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Right: product strip */}
      <div
        className="flex flex-col py-6 px-2 border-l border-white/10 overflow-hidden"
        style={{ width: 136, background: "rgba(0,0,0,0.3)", flexShrink: 0 }}
      >
        <ProductStrip products={products} />
      </div>
    </div>
  );
}

function OrderReviewMode({ state }: { state: DisplayState }) {
  const items = state.items || [];
  const total = state.total ?? 0;
  const subtotal = state.subtotal ?? total / 1.15;
  const tax = state.tax ?? total - subtotal;

  return (
    <div className="flex h-full" style={{ pointerEvents: "none" }}>
      {/* Left: order items */}
      <div className="flex-1 flex flex-col p-8" dir="rtl">
        <div className="mb-6 pb-4 border-b border-white/10">
          <h2 className="text-3xl font-bold text-amber-400 mb-1">مراجعة طلبك</h2>
          <p className="text-white/40 text-base">Order Review</p>
        </div>

        <div className="flex-1 overflow-hidden space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-2xl px-5 py-4 border transition-all duration-500"
              style={{
                background: item.lastAdded ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                borderColor: item.lastAdded ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.08)",
                animation: item.lastAdded ? "pulseItem 0.5s ease" : undefined,
              }}
            >
              <div
                className="rounded-full flex items-center justify-center font-black text-amber-400 border border-amber-400/50 bg-amber-400/10"
                style={{ minWidth: 52, height: 52, fontSize: 26 }}
              >
                {item.quantity}
              </div>
              <div className="flex-1 mx-4">
                <p className="text-white text-xl font-semibold leading-tight">{item.nameAr}</p>
                {item.nameEn && <p className="text-white/40 text-sm">{item.nameEn}</p>}
              </div>
              <div className="text-right">
                <p className="text-amber-400 text-2xl font-bold">
                  {(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-white/40 text-sm">{item.price.toFixed(2)} / واحدة</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
          <div className="flex justify-between text-white/60 text-lg">
            <span>المجموع قبل الضريبة</span>
            <span>{subtotal.toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between text-white/60 text-lg">
            <span>ضريبة القيمة المضافة (15%)</span>
            <span>{tax.toFixed(2)} ر.س</span>
          </div>
          {(state.discount ?? 0) > 0 && (
            <div className="flex justify-between text-green-400 text-lg">
              <span>خصم</span>
              <span>- {(state.discount ?? 0).toFixed(2)} ر.س</span>
            </div>
          )}
          <div
            className="flex justify-between items-center rounded-2xl px-6 py-5 mt-2"
            style={{ background: "rgba(245,158,11,0.15)", border: "1.5px solid rgba(245,158,11,0.4)" }}
          >
            <span className="text-white text-2xl font-bold">الإجمالي</span>
            <span className="text-amber-400 font-black" style={{ fontSize: 42 }}>
              {total.toFixed(2)} <span className="text-2xl">ر.س</span>
            </span>
          </div>
        </div>
      </div>

      <div className="w-px bg-white/10" />

      <div
        className="flex flex-col items-center justify-center py-8 px-3 gap-4"
        style={{ width: 90, background: "rgba(0,0,0,0.2)" }}
      >
        <div className="text-white/20 text-xs rotate-90 whitespace-nowrap tracking-widest mb-4">
          BLACK ROSE CAFÉ
        </div>
        {items.slice(0, 5).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(245,158,11,0.5)" }} />
        ))}
      </div>
    </div>
  );
}

function PaymentProcessingMode() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8" style={{ pointerEvents: "none" }}>
      <div
        className="rounded-full flex items-center justify-center border-2 border-amber-400/40"
        style={{ width: 160, height: 160 }}
      >
        <Loader2 className="text-amber-400 animate-spin" style={{ width: 80, height: 80 }} />
      </div>
      <div className="text-center">
        <h2 className="text-5xl font-black text-white mb-3">جاري الدفع...</h2>
        <p className="text-amber-400/60 text-2xl">Processing Payment</p>
      </div>
      <div className="flex gap-3">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-4 h-4 rounded-full bg-amber-400"
            style={{ animation: `bounce 1.2s ease ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function PaymentSuccessMode({ state }: { state: DisplayState }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-8"
      style={{ pointerEvents: "none", animation: "scaleIn 0.5s ease forwards" }}
    >
      <div
        className="rounded-full flex items-center justify-center border-2 border-green-400/60 bg-green-400/10"
        style={{ width: 180, height: 180 }}
      >
        <CheckCircle className="text-green-400" style={{ width: 100, height: 100 }} />
      </div>
      <div className="text-center">
        <h2 className="text-5xl font-black text-white mb-3">تمت العملية بنجاح</h2>
        <p className="text-green-400/70 text-2xl mb-6">Payment Successful</p>
        {state.orderNumber && (
          <div className="rounded-2xl px-10 py-4 border border-green-400/30 bg-green-400/10">
            <p className="text-white/50 text-lg mb-1">رقم الطلب</p>
            <p className="text-green-400 font-black text-4xl">#{state.orderNumber}</p>
          </div>
        )}
        {state.total && (
          <p className="text-amber-400 text-3xl font-bold mt-6">
            {state.total.toFixed(2)} ر.س
          </p>
        )}
      </div>
      <p className="text-white/30 text-lg">شكراً لزيارتكم • Thank you</p>
    </div>
  );
}

export default function CustomerDisplay() {
  const [displayState, setDisplayState] = useState<DisplayState>({ mode: "idle" });

  const { data: products = [] } = useQuery<CoffeeItem[]>({
    queryKey: ["/api/coffee-items"],
    refetchInterval: 30000,
  });

  const { data: businessConfig } = useQuery<any>({
    queryKey: ["/api/business-config"],
    refetchInterval: 60000,
  });

  const handleDisplayState = useCallback((payload: DisplayState) => {
    if (payload?.mode) setDisplayState(payload);
  }, []);

  const { isConnected } = useOrderWebSocket({
    clientType: "customer-display",
    onCustomerDisplayState: handleDisplayState,
    enabled: true,
  });

  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    const blockKey = (e: KeyboardEvent) => {
      if (
        e.key === "F5" || e.key === "F11" ||
        (e.ctrlKey && ["r", "R", "w", "W", "t", "T"].includes(e.key))
      ) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("keydown", blockKey);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("keydown", blockKey);
    };
  }, []);

  const availableProducts = (products as any[]).filter(
    (p: any) => p.availabilityStatus === "available" || !p.availabilityStatus
  );

  return (
    <>
      <style>{`
        * { user-select: none; -webkit-user-select: none; }
        body { cursor: none !important; overflow: hidden; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseItem {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-12px); opacity: 1; }
        }
      `}</style>
      <div
        className="fixed inset-0 overflow-hidden select-none"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0f0a 50%, #0d0d0d 100%)",
          cursor: "none",
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: "'Segoe UI', 'Tajawal', sans-serif",
        }}
      >
        {/* Connection dot */}
        <div className="absolute top-4 right-4 z-50" style={{ pointerEvents: "none" }}>
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: isConnected ? "#22c55e" : "#ef4444",
              boxShadow: isConnected ? "0 0 8px #22c55e" : "0 0 8px #ef4444",
            }}
          />
        </div>

        {/* Main display */}
        <div className="absolute inset-0">
          {displayState.mode === "idle" && (
            <IdleMode products={availableProducts} businessConfig={businessConfig} />
          )}
          {displayState.mode === "order_review" && (
            <OrderReviewMode state={displayState} />
          )}
          {displayState.mode === "payment_processing" && <PaymentProcessingMode />}
          {displayState.mode === "payment_success" && (
            <PaymentSuccessMode state={displayState} />
          )}
        </div>

        {/* Bottom branding bar */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-3 border-t border-white/5"
          style={{ background: "rgba(0,0,0,0.6)", height: 48 }}
        >
          <div className="flex items-center gap-3">
            <img
              src={blackroseLogo}
              alt="logo"
              style={{ width: 28, height: 28, objectFit: "contain", opacity: 0.5 }}
            />
            <span className="text-white/25 text-xs tracking-widest">BLACK ROSE SYSTEMS</span>
          </div>
          <span className="text-white/25 text-xs tracking-widest">
            {new Date().toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>
      </div>
    </>
  );
}
