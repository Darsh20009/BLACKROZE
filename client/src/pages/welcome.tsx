import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, MapPin, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Set metadata for welcome page
    document.title = "CLUNY CAFE | أفضل تجربة قهوة رقمية - اطلب قهوتك الآن";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'استمتع بأفضل قهوة محضرة بعناية فائقة من CLUNY CAFE - اطلب الآن واستمتع بتجربة قهوة استثنائية على cluny.ma3k.online');

    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome) {
      setShowWelcome(false);
      setLocation("/menu");
      return;
    }
    localStorage.setItem("hasSeenWelcome", "true");
  }, [setLocation]);

  if (!showWelcome) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-card/80 backdrop-blur-md shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CLUNY CAFE" className="w-10 h-10 rounded-full" />
            <span className="text-xl font-playfair font-semibold text-foreground">CLUNY CAFE</span>
          </div>
          <Button onClick={() => setLocation("/menu")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            اطلب الآن
          </Button>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/8 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.05, 1],
              x: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary to-primary/80 p-3 shadow-2xl">
              <img src="/logo.png" alt="CLUNY CAFE Logo" className="w-full h-full object-contain rounded-full bg-background" />
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl font-playfair font-light text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            CLUNY CAFE
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl text-muted mb-4 font-cairo font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            تجربة قهوة فاخرة وأصيلة
          </motion.p>

          <motion.p
            className="text-lg text-muted/80 mb-12 font-cairo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            استمتع بأفضل قهوة محضرة بعناية فائقة من أفضل أنواع الحبوب
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button
              onClick={() => setLocation("/menu")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 rounded-lg text-lg font-semibold shadow-lg"
            >
              استكشف قائمتنا
            </Button>
          </motion.div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-24 px-4 bg-card/40">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl md:text-6xl font-playfair text-center text-foreground mb-20 font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            لماذا تختار CLUNY؟
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Coffee,
                title: "قهوة احترافية",
                description: "محضرة بعناية فائقة من أفضل أنواع حبوب القهوة المختارة",
              },
              {
                icon: MapPin,
                title: "فروع متعددة",
                description: "اختر الفرع الأقرب إليك والاستمتع بنفس الجودة المميزة",
              },
              {
                icon: Users,
                title: "خدمة ممتازة",
                description: "فريق محترف مكرس لإرضاء جميع عملائنا الكرام",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  className="p-8 rounded-lg bg-background border border-border hover:border-primary/50 transition-all duration-300 hover-elevate"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Icon className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-playfair text-foreground mb-2 font-medium">{feature.title}</h3>
                  <p className="text-muted-foreground font-cairo text-center">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-5xl font-playfair text-foreground mb-8 font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            القصة وراء CLUNY
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground font-cairo leading-relaxed mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            في CLUNY، نؤمن بأن القهوة الممتازة هي أكثر من مجرد مشروب.
            إنها تجربة حسية تبدأ برائحة الحبوب الطازجة وتنتهي بذوق لا ينسى.
          </motion.p>

          <motion.p
            className="text-lg text-muted-foreground font-cairo leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            اختيارنا المتميز للحبوب العالية الجودة وفريقنا المتخصص في إعداد القهوة
            يضمنان أن تحصل على أفضل كوب قهوة في كل مرة.
          </motion.p>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary to-primary/90">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-5xl font-playfair mb-6 text-primary-foreground font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            جاهز لتجربة CLUNY؟
          </motion.h2>

          <motion.p
            className="text-xl mb-10 text-primary-foreground/90 font-cairo"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            انضم إلينا واستمتع بأفضل تجربة قهوة في المدينة
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={() => setLocation("/menu")}
              size="lg"
              className="bg-background hover:bg-background/90 text-foreground px-12 py-6 rounded-lg text-lg font-semibold shadow-lg"
            >
              ابدأ الآن
            </Button>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-foreground/5 py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 font-playfair">عن CLUNY</h4>
              <p className="text-sm text-muted-foreground font-cairo">قهوة فاخرة وأصيلة بأفضل جودة</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 font-playfair">القائمة</h4>
              <a href="/menu" className="text-sm text-muted-foreground hover:text-primary font-cairo">استكشف القائمة</a>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 font-playfair">الموقع</h4>
              <p className="text-sm text-muted-foreground font-cairo">Olaya St, العام، Riyadh 12211</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 font-playfair">التواصل</h4>
              <p className="text-sm text-muted-foreground font-cairo">cluny.cafe2026@gmail.com</p>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p className="font-cairo text-sm">© 2025 CLUNY CAFE. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
