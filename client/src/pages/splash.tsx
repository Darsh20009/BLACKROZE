import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clunyLogo from "@/assets/cluny-logo.png";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تقليل وقت التحميل الكلي إلى ثانية واحدة (800ms للعرض + 200ms للانتقال)
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setLocation("/welcome"), 200);
    }, 800);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="fixed inset-0 bg-[#F7F8F8] flex items-center justify-center z-50 overflow-hidden font-ibm-arabic">
      {/* Background Decorative Elements - Updated to Brand Colors */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#9FB2B3] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B58B5A] rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo Container */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-[#9FB2B3]/20 rounded-full blur-2xl animate-pulse" />
              <img
                src={clunyLogo}
                alt="CLUNY CAFE"
                className="w-28 h-28 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(159,178,179,0.2)]"
              />
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-playfair tracking-[0.15em] text-[#1F2D2E] mb-1 font-semibold">
                CLUNY
              </h1>
              <div className="h-[2px] w-8 bg-[#B58B5A] mx-auto mb-3" />
              <p className="text-[#6B7C7D] text-xs md:text-sm tracking-[0.2em] uppercase font-medium">
                Exquisite Coffee
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Particle Effect - Subtler for Light Mode */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%"
            }}
            animate={{ 
              opacity: [0, 0.2, 0],
              y: ["-5%", "105%"]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-1 h-1 bg-[#9FB2B3] rounded-full blur-[1px]"
          />
        ))}
      </div>
    </div>
  );
}
