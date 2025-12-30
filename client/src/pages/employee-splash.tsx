import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Coffee, Zap } from "lucide-react";

export default function EmployeeSplash() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setLocation("/employee/gateway"), 600);
    }, 4000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 rounded-full bg-amber-900/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-amber-800/10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
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
        {/* Logo */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 p-2 shadow-2xl shadow-amber-500/50">
            <img
              src="/logo.png"
              alt="CLUNY CAFE"
              className="w-full h-full object-contain rounded-full bg-slate-900"
            />
          </div>
          <motion.div
            className="absolute -top-4 -right-4 bg-amber-500 text-slate-900 rounded-full p-2 shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-6 h-6 fill-current" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-amber-50 mb-2 font-playfair">
            CLUNY CAFE
          </h1>
          <p className="text-amber-200/80 text-lg font-cairo">نظام إدارة الموظفين</p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-amber-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Status text */}
        <motion.p
          className="text-amber-200/60 text-sm font-mono tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          {isLoading ? "جاري التحضير..." : "جاهز للعمل"}
        </motion.p>
      </motion.div>

      {/* Welcome message */}
      <motion.div
        className="absolute bottom-8 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <p className="text-amber-100/70 font-cairo text-sm">
          أهلاً وسهلاً بك في نظام الموظفين
        </p>
      </motion.div>
    </div>
  );
}
