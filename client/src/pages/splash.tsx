import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clunyLogo from "@/assets/cluny-logo.png";
import CoffeeAnimation from "@/components/coffee-animation";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);

  useEffect(() => {
    const hasSeenSplash = localStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShouldShow(false);
      setLocation("/welcome");
      return;
    }

    setShouldShow(true);
    localStorage.setItem("hasSeenSplash", "true");

    // الحركة تأخذ 3 ثوانٍ تقريباً، ثم الانتقال
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setLocation("/welcome"), 500);
    }, 3500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  if (shouldShow === false) return null;

  return (
    <div className="fixed inset-0 bg-[#F7F8F8] flex items-center justify-center z-50 overflow-hidden font-ibm-arabic">
      {/* Background Decorative Elements - Subtle Brand colors */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#9FB2B3] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B58B5A] rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo - Fades in first */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-8"
            >
              <img src={clunyLogo} alt="CLUNY" className="w-20 h-20 object-contain" />
            </motion.div>

            {/* Coffee Pouring Animation */}
            <CoffeeAnimation />

            {/* Brand Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-center mt-8"
            >
              <h1 className="text-3xl font-playfair tracking-[0.2em] text-[#1F2D2E] mb-1 font-semibold">
                CLUNY
              </h1>
              <p className="text-[#6B7C7D] text-xs tracking-[0.3em] uppercase font-medium">
                Crafting Your Moment
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
