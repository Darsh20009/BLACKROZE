import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Coffee, Star, MapPin, ChevronLeft, LogOut } from "lucide-react";
import clunyLogo from "@/assets/cluny-logo.png";
import { useCustomer } from "@/contexts/CustomerContext";

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const { customer, isAuthenticated, logout } = useCustomer();

  const features = [
    { icon: Coffee, title: "قهوة مختصة", desc: "أجود أنواع الحبوب المحمصة بعناية" },
    { icon: Star, title: "تجربة فخمة", desc: "أجواء تجمع بين الرقي والراحة" },
    { icon: MapPin, title: "مواقعنا", desc: "متواجدون في أرقى أحياء الرياض" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1410] text-white overflow-hidden font-ibm-arabic">
      {/* Hero Section */}
      <div className="relative h-[100dvh] flex flex-col justify-center px-6">
        {/* Background Wash */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#1a1410] z-10" />
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80')] bg-cover bg-center"
          />
        </div>

        <div className="relative z-20 max-w-lg mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-24 h-24 mx-auto mb-8 p-1 rounded-full border border-white/20 backdrop-blur-sm">
              <img src={clunyLogo} alt="Logo" className="w-full h-full object-contain rounded-full bg-white/5" />
            </div>

            <h1 className="text-5xl md:text-6xl font-playfair mb-4 tracking-tight leading-tight">
              CLUNY CAFE
            </h1>
            
            <AnimatePresence mode="wait">
              {isAuthenticated ? (
                <motion.div
                  key="welcome-user"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-12"
                >
                  <p className="text-[#9FB2B3] text-2xl md:text-3xl mb-2 font-playfair font-light">
                    مرحباً، {customer?.name}
                  </p>
                  <p className="text-white/60 text-lg font-light">
                    اشتقنا لرائحة قهوتك المفضلة
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="tagline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[#9FB2B3] text-lg md:text-xl mb-12 font-light tracking-wide"
                >
                  حيث تبدأ حكايات القهوة الفاخرة
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <Button
                onClick={() => setLocation("/menu")}
                className="w-full h-14 bg-[#B58B5A] hover:bg-[#B58B5A]/90 text-white rounded-full text-xl font-medium shadow-2xl shadow-[#B58B5A]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
              >
                {isAuthenticated ? "اطلب الآن" : "استكشف القائمة"}
                <ChevronLeft className="mr-2 w-6 h-6 transition-transform group-hover:-translate-x-1" />
              </Button>
              
              {!isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/auth")}
                  className="w-full h-14 border-white/20 bg-white/5 backdrop-blur-md text-white rounded-full text-lg hover:bg-white/10"
                >
                  تسجيل الدخول
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/my-orders")}
                    className="flex-1 h-14 border-white/10 bg-white/5 backdrop-blur-md text-white rounded-full text-lg hover:bg-white/10"
                  >
                    طلباتي
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logout()}
                    className="h-14 w-14 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-red-500/20"
                  >
                    <LogOut className="w-6 h-6" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </div>

      {/* Features Grid */}
      <section className="py-24 px-6 relative z-10 bg-[#1a1410]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 transition-colors group-hover:border-[#B58B5A]/50 group-hover:bg-[#B58B5A]/5">
                <f.icon className="w-8 h-8 text-[#B58B5A]" />
              </div>
              <h3 className="text-2xl mb-3 font-medium">{f.title}</h3>
              <p className="text-white/60 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <img src={clunyLogo} alt="Logo" className="w-12 h-12 opacity-50 mb-6 grayscale" />
          <p className="text-white/40 text-sm font-light">
            © 2026 CLUNY CAFE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { AnimatePresence } from "framer-motion";
