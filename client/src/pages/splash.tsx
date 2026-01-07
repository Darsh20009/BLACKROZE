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
      setLocation("/menu");
      return;
    }

    setShouldShow(true);
    localStorage.setItem("hasSeenSplash", "true");

    // Coffee pouring takes ~3.5 seconds, then redirect directly to menu
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setLocation("/menu"), 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  if (shouldShow === false) return null;

  return (
    <div className="fixed inset-0 bg-[#233230] flex items-center justify-center z-50 overflow-hidden font-ibm-arabic">
      {/* Background Decorative Elements - Subtle Glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
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
            {/* Logo - Elegant appearance */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-12"
            >
              <img src={clunyLogo} alt="CLUNY" className="w-24 h-24 object-contain brightness-0 invert" />
            </motion.div>

            {/* Coffee Pouring Animation */}
            <CoffeeAnimation size="lg" />

            {/* Brand Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-center mt-12"
            >
              <h1 className="text-4xl font-playfair tracking-[0.2em] text-white mb-2 font-semibold">
                CLUNY
              </h1>
              <p className="text-white/70 text-sm tracking-[0.3em] uppercase font-medium">
                Crafting Your Moment
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
