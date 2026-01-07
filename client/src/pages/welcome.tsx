import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Star, MapPin, ChevronLeft, LogOut } from "lucide-react";
import clunyLogo from "@/assets/cluny-logo.png";
import CoffeeAnimation from "@/components/coffee-animation";
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
    <div className="min-h-screen bg-[#233230] text-white overflow-hidden font-ibm-arabic">
      {/* Hero Section */}
      <div className="relative h-[100dvh] flex flex-col justify-center px-6">
        {/* Background Decorative Elements - Matching Brand */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#B58B5A]/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-20 max-w-lg mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-24 h-24 mx-auto mb-8 p-1 rounded-full border border-[#9FB2B3]/20 bg-white shadow-xl">
              <img src={clunyLogo} alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>

            <h1 className="text-5xl md:text-6xl font-playfair mb-4 tracking-tight leading-tight text-white">
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
                  <p className="text-white text-2xl md:text-3xl mb-2 font-playfair font-semibold">
                    مرحباً، {customer?.name}
                  </p>
                  <p className="text-white/80 text-lg font-light">
                    اشتقنا لرائحة قهوتك المفضلة
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="tagline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-white/80 text-lg md:text-xl mb-12 font-light tracking-wide"
                >
                  حيث تبدأ حكايات القهوة الفاخرة
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <Button
                  onClick={() => setLocation("/menu")}
                  className="w-full h-14 bg-white text-[#233230] hover:bg-white/90 rounded-xl text-xl font-medium shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group border-0 relative z-10 overflow-hidden"
                >
                  <span className="relative z-20 flex items-center justify-center">
                    {isAuthenticated ? "اطلب الآن" : "استكشف القائمة"}
                    <ChevronLeft className="mr-2 w-6 h-6 transition-transform group-hover:-translate-x-1" />
                  </span>
                  
                  {/* Embedded Coffee Animation in Button */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                    <CoffeeAnimation size="sm" className="w-12 h-12" />
                  </div>
                </Button>
              </div>
              
              {!isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/auth")}
                  className="w-full h-14 border-white/30 bg-white/10 text-white rounded-xl text-lg hover:bg-white/20"
                >
                  تسجيل الدخول
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/my-orders")}
                    className="flex-1 h-14 border-white/20 bg-white/10 text-white rounded-xl text-lg hover:bg-white/20"
                  >
                    طلباتي
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logout()}
                    className="h-14 w-14 rounded-xl border border-red-400/20 bg-red-400/10 text-red-200 hover:text-white hover:bg-red-500"
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
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#9FB2B3]/40 to-transparent" />
        </motion.div>
      </div>

      {/* Features Grid */}
      <section className="py-24 px-6 relative z-10 bg-white/5 backdrop-blur-md">
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
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 transition-all group-hover:border-white/50 group-hover:bg-white/20">
                <f.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-3 font-semibold text-white">{f.title}</h3>
              <p className="text-white/70 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="py-12 border-t border-white/10 px-6 bg-[#233230]">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <img src={clunyLogo} alt="Logo" className="w-12 h-12 opacity-50 mb-6 brightness-0 invert" />
          <p className="text-white/50 text-sm font-light uppercase tracking-widest">
            © 2026 CLUNY CAFE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
