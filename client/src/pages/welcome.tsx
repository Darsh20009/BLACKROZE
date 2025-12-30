import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, MapPin, Users, Award } from "lucide-react";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/menu");
    }, 3000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? "bg-card/80 backdrop-blur-md shadow-md" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CLUNY CAFE" className="w-10 h-10 rounded-full" />
            <span className="text-xl font-playfair font-semibold text-foreground">CLUNY CAFE</span>
          </div>
          <Button onClick={() => setLocation("/menu")} className="bg-primary hover:bg-primary/90 text-card">
            اطلب الآن
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{
          backgroundImage: 'url(/logo.png)',
          backgroundSize: '40%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundBlendMode: 'screen',
          opacity: 1
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-accent/5 pointer-events-none"></div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-4 pt-32">
          <h1 className="text-5xl md:text-7xl font-playfair font-light text-foreground mb-4 animate-slide-up">
            CLUNY CAFE
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-8 font-cairo font-light animate-slide-up" style={{animationDelay: "0.2s"}}>
            تجربة قهوة فاخرة وأصيلة
          </p>
          <p className="text-lg text-muted/70 mb-12 font-cairo animate-slide-up" style={{animationDelay: "0.4s"}}>
            استمتع بأفضل قهوة محضرة بعناية فائقة
          </p>
          <Button
            onClick={() => setLocation("/menu")}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-12 py-3 rounded-md text-lg shadow-xl animate-slide-up"
            style={{animationDelay: "0.6s"}}
          >
            استكشف قائمتنا
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-playfair text-center text-foreground mb-16">لماذا تختار CLUNY؟</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Coffee,
                title: "قهوة احترافية",
                description: "محضرة بعناية فائقة من أفضل أنواع حبوب القهوة"
              },
              {
                icon: MapPin,
                title: "فروع متعددة",
                description: "اختر الفرع الأقرب إليك والاستمتع بنفس الجودة"
              },
              {
                icon: Users,
                title: "خدمة ممتازة",
                description: "فريق محترف مكرس لإرضاء جميع العملاء"
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="text-center p-8 rounded-md bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-elevate">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-playfair text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground font-cairo">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-playfair mb-6 text-card">جاهز لتجربة CLUNY؟</h2>
          <p className="text-xl mb-8 text-card/90 font-cairo">انضم إلينا واستمتع بأفضل القهوة في المدينة</p>
          <Button
            onClick={() => setLocation("/menu")}
            size="lg"
            className="bg-card hover:bg-card/90 text-foreground px-12 py-3 rounded-md text-lg shadow-xl"
          >
            ابدأ الآن
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/10 py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-playfair text-lg mb-4 text-foreground">CLUNY CAFE</h4>
              <p className="text-muted font-cairo">تجربة قهوة فاخرة وأصيلة</p>
            </div>
            <div>
              <h4 className="font-playfair text-lg mb-4 text-foreground">الفروع</h4>
              <p className="text-muted font-cairo">الرياض - جدة - الدمام</p>
            </div>
            <div>
              <h4 className="font-playfair text-lg mb-4">التواصل</h4>
              <p className="text-slate-400 font-cairo">support@cluny-cafe.com</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p className="font-cairo">© 2025 CLUNY CAFE. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
