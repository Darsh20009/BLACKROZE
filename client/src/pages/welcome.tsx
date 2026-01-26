import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Coffee, Star, MapPin, ChevronLeft, LogOut, Sparkles } from "lucide-react";
import clunyLogo from "@/assets/cluny-logo.png";
import bannerImage1 from "@assets/banner-coffee-1.png";
import bannerImage2 from "@assets/banner-coffee-2.png";
import { useCustomer } from "@/contexts/CustomerContext";

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const { customer, isAuthenticated, logout } = useCustomer();

  const features = [
    { icon: Coffee, title: "قهوة مختصة", desc: "أجود أنواع الحبوب المحمصة بعناية", color: "from-primary to-primary/70" },
    { icon: Star, title: "تجربة فخمة", desc: "أجواء تجمع بين الرقي والراحة", color: "from-accent to-accent/70" },
    { icon: MapPin, title: "مواقعنا", desc: "متواجدون في أرقى أحياء الرياض", color: "from-primary to-accent" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 text-foreground overflow-hidden font-ibm-arabic">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[100dvh] flex flex-col">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bannerImage1} 
            alt="Coffee Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-40 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Header */}
        <header className="relative z-20 flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md p-1 border border-white/30">
              <img src={clunyLogo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide">CLUNY</span>
          </div>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-lg"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-28 h-28 mx-auto mb-8 p-2 rounded-2xl bg-white shadow-2xl"
            >
              <img src={clunyLogo} alt="Logo" className="w-full h-full object-contain" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white drop-shadow-lg">
                CLUNY CAFE
              </h1>
              <div className="flex items-center justify-center gap-2 mb-8">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-white/80 text-lg tracking-wider">Premium Coffee Experience</span>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            </motion.div>

            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-10"
              >
                <p className="text-white text-2xl mb-2 font-semibold">
                  مرحباً، {customer?.name} 👋
                </p>
                <p className="text-white/70 text-base">
                  اشتقنا لرائحة قهوتك المفضلة
                </p>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/80 text-xl mb-10"
              >
                حيث تبدأ حكايات القهوة الفاخرة
              </motion.p>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Button
                onClick={() => setLocation("/menu")}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isAuthenticated ? "اطلب الآن" : "استكشف القائمة"}
                <ChevronLeft className="mr-2 w-5 h-5" />
              </Button>
              
              {!isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/auth")}
                  className="w-full h-14 bg-white/10 backdrop-blur-md border-white/30 text-white rounded-2xl text-lg hover:bg-white/20"
                >
                  تسجيل الدخول
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/profile")}
                  className="w-full h-14 bg-white/10 backdrop-blur-md border-white/30 text-white rounded-2xl text-lg hover:bg-white/20"
                >
                  حسابي وطلباتي
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-20 pb-8 text-center"
        >
          <div className="w-6 h-10 mx-auto border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">لماذا كلوني؟</h2>
            <p className="text-muted-foreground">تجربة قهوة لا تُنسى</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow"
              >
                <div className={`w-14 h-14 mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br ${f.color}`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-lg"
            >
              <img src={bannerImage1} alt="Coffee" className="w-full h-48 object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-lg"
            >
              <img src={bannerImage2} alt="Coffee" className="w-full h-48 object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <img src={clunyLogo} alt="Logo" className="w-12 h-12 mb-4" />
          <p className="text-muted-foreground text-sm">
            © 2026 CLUNY CAFE. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
