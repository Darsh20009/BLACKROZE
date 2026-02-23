import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import blackroseLogoStaff from "@assets/blackrose-logo.png";
import bannerBg from "@assets/Screenshot_2026-02-04_200214_1771877547580.png";

export default function EmployeeSplash() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    document.title = "نظام الموظفين - BLACK ROSE | نظام إدارة متكامل";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'نظام إدارة الموظفين في BLACK ROSE - نظام متكامل لإدارة الطلبات والمبيعات');

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden relative bg-black">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={bannerBg}
          alt="Black Rose Cafe"
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Animated background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl"
          animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="z-10 flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative top line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-20 h-px bg-white/30"
        />

        {/* Logo */}
        <motion.div
          className="relative"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            <img
              src={blackroseLogoStaff}
              alt="BLACK ROSE"
              className="w-24 h-24 object-contain brightness-0 invert"
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold tracking-[0.2em] text-white mb-1">BLACK ROSE</h1>
          <p className="text-white/40 text-xs tracking-[0.4em] uppercase mb-2">C A F E</p>
          <p className="text-white/60 text-sm">نظام إدارة الموظفين</p>
        </motion.div>

        {/* Action Buttons */}
        {!isLoading && (
          <motion.div
            className="flex flex-col gap-3 w-full max-w-[280px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              size="lg"
              onClick={() => setLocation("/employee/gateway")}
              className="bg-white text-black hover:bg-white/90 font-bold h-14 rounded-2xl shadow-2xl transition-all hover:scale-[1.02]"
            >
              الدخول للنظام
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={async () => {
                const manifestTag = document.getElementById('main-manifest') as HTMLLinkElement;
                if (manifestTag) manifestTag.href = '/employee-manifest.json';
                const newManifest = manifestTag?.cloneNode(true) as HTMLLinkElement;
                if (newManifest) {
                  newManifest.href = '/employee-manifest.json?v=' + Date.now();
                  manifestTag?.parentNode?.replaceChild(newManifest, manifestTag);
                }
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') setDeferredPrompt(null);
                } else {
                  const ua = navigator.userAgent.toLowerCase();
                  if (/iphone|ipad|ipod/.test(ua)) {
                    alert("لتثبيت النظام على iPhone: اضغط على زر 'مشاركة' ثم 'إضافة إلى الشاشة الرئيسية'");
                  } else {
                    alert("لتثبيت النظام: اضغط على القائمة (⋮) ثم 'تثبيت التطبيق'");
                  }
                }
              }}
              className="border-white/20 text-white bg-white/5 backdrop-blur-sm font-bold h-14 rounded-2xl hover:bg-white/10"
            >
              <Download className="ml-2 h-5 w-5" />
              تحميل نظام الموظفين
            </Button>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/60"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}

        {/* Decorative bottom line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-20 h-px bg-white/20"
        />
      </motion.div>

      {/* Welcome message */}
      <motion.div
        className="absolute bottom-8 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <p className="text-white/40 text-sm tracking-wider">
          أهلاً وسهلاً بك في BLACK ROSE
        </p>
      </motion.div>
    </div>
  );
}
