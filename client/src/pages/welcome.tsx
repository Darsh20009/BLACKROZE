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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-slate-100">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CLUNY CAFE" className="w-10 h-10 rounded-full" />
            <span className="text-xl font-playfair font-semibold text-slate-800">CLUNY CAFE</span>
          </div>
          <Button onClick={() => setLocation("/menu")} className="bg-slate-600 hover:bg-slate-700 text-white">
            اطلب الآن
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <div className="mb-8 animate-fade-in">
            <img src="/logo.png" alt="CLUNY CAFE Logo" className="w-40 h-40 mx-auto mb-6 drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl md:text-7xl font-playfair font-light text-slate-800 mb-4 animate-slide-up">
            CLUNY CAFE
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 font-cairo font-light animate-slide-up" style={{animationDelay: "0.2s"}}>
            تجربة قهوة فاخرة وأصيلة
          </p>
          <p className="text-lg text-slate-500 mb-12 font-cairo animate-slide-up" style={{animationDelay: "0.4s"}}>
            استمتع بأفضل قهوة محضرة بعناية فائقة
          </p>
          <Button
            onClick={() => setLocation("/menu")}
            size="lg"
            className="bg-slate-600 hover:bg-slate-700 text-white px-12 py-3 rounded-xl text-lg shadow-xl animate-slide-up"
            style={{animationDelay: "0.6s"}}
          >
            استكشف قائمتنا
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-playfair text-center text-slate-800 mb-16">لماذا تختار CLUNY؟</h2>
          
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
                <div key={i} className="text-center p-8 rounded-2xl bg-slate-50/50 hover:bg-slate-100/50 transition-all duration-300">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-xl font-playfair text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 font-cairo">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-playfair mb-6">جاهز لتجربة CLUNY؟</h2>
          <p className="text-xl mb-8 text-slate-100 font-cairo">انضم إلينا واستمتع بأفضل القهوة في المدينة</p>
          <Button
            onClick={() => setLocation("/menu")}
            size="lg"
            className="bg-white hover:bg-slate-100 text-slate-700 px-12 py-3 rounded-xl text-lg shadow-xl"
          >
            ابدأ الآن
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-playfair text-lg mb-4">CLUNY CAFE</h4>
              <p className="text-slate-400 font-cairo">تجربة قهوة فاخرة وأصيلة</p>
            </div>
            <div>
              <h4 className="font-playfair text-lg mb-4">الفروع</h4>
              <p className="text-slate-400 font-cairo">الرياض - جدة - الدمام</p>
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
