import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clunyLogo from "@/assets/cluny-logo.png";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setLocation("/welcome"), 1000);
    }, 3500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="fixed inset-0 bg-[#1a1410] flex items-center justify-center z-50 overflow-hidden font-ibm-arabic">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#9FB2B3] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B58B5A] rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo Container */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse" />
              <img
                src={clunyLogo}
                alt="CLUNY CAFE"
                className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              />
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-playfair tracking-[0.2em] text-white mb-2 font-light">
                CLUNY
              </h1>
              <div className="h-[1px] w-12 bg-[#B58B5A] mx-auto mb-4" />
              <p className="text-[#9FB2B3] text-sm md:text-base tracking-[0.3em] uppercase font-light">
                Exquisite Coffee Experience
              </p>
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ duration: 2.5, ease: "easeInOut", delay: 0.8 }}
              className="mt-12 h-[2px] bg-gradient-to-r from-transparent via-[#B58B5A] to-transparent opacity-50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Particle Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%"
            }}
            animate={{ 
              opacity: [0, 0.3, 0],
              y: ["-10%", "110%"]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>
    </div>
  );
}
