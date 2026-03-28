import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import blackroseLogo from "@assets/blackrose-logo.png";
import { useTranslation } from "react-i18next";
import { useTranslate } from "@/lib/useTranslate";

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto-show prompt after 3 seconds for new users
      const timer = setTimeout(() => {
        if (!isInstalled) setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
        setIsInstalled(true);
      }
    } else {
      // Manual instructions based on UA
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        toast({
          title: t("pwa.install_ios_title") || "تثبيت على iPhone",
          description: t("pwa.install_ios_desc") || "اضغط على أيقونة المشاركة (Share) ثم اختر 'إضافة إلى الشاشة الرئيسية'",
        });
      } else {
        toast({
          title: t("pwa.install_title") || "تثبيت التطبيق",
          description: t("pwa.install_desc") || "اضغط على القائمة (⋮) في المتصفح ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'",
        });
      }
    }
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[100] animate-in fade-in slide-in-from-top-10 duration-700">
      <Card className="border-primary/20 bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden rounded-[2rem]">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner border border-primary/10 bg-white p-1">
              <img src={blackroseLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-primary leading-tight">{t("pwa.prompt_title") || "ثبت تطبيق BLACK ROSE"}</h3>
              <p className="text-xs text-muted-foreground font-medium">{t("pwa.prompt_desc") || "استمتع بتجربة أسرع ووصول فوري"}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleInstall}
                className="rounded-xl h-10 px-6 font-bold bg-primary text-primary-foreground hover-elevate shadow-lg shadow-primary/20"
              >
                {t("pwa.install_btn") || "تثبيت الآن"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPrompt(false)}
                className="text-[10px] h-6 text-muted-foreground hover:bg-transparent"
              >
                {t("pwa.not_now") || "ليس الآن"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let _deferredPromptGlobal: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPromptGlobal = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });
}

export function PWAInstallBanner() {
  const tc = useTranslate();
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    if (isIOS && !isStandalone && !sessionStorage.getItem('pwa-ios-dismissed')) setShowIOS(true);
    if (_deferredPromptGlobal) setCanInstall(true);
    const handler = () => setCanInstall(true);
    window.addEventListener('pwa-installable', handler);
    return () => window.removeEventListener('pwa-installable', handler);
  }, []);

  if (isStandalone || dismissed) return null;

  if (showIOS) return (
    <Card className="fixed bottom-20 left-3 right-3 z-50 border-primary/30 shadow-2xl bg-background/95 backdrop-blur-md md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-bold text-sm flex items-center gap-1">
              <Smartphone className="w-4 h-4 text-primary" />{tc("ثبّت التطبيق على iPhone", "Install on iPhone")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{tc('اضغط "مشاركة" ثم "أضف إلى الشاشة الرئيسية"', 'Tap "Share" then "Add to Home Screen"')}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { sessionStorage.setItem('pwa-ios-dismissed','1'); setShowIOS(false); }}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!canInstall) return null;

  return (
    <Card className="fixed bottom-20 left-3 right-3 z-50 border-primary/30 shadow-2xl bg-background/95 backdrop-blur-md md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-bold text-sm">{tc("ثبّت تطبيق Blackrose", "Install Blackrose App")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{tc("يعمل بدون إنترنت وبسرعة أكبر", "Works offline and faster")}</p>
          </div>
          <div className="flex gap-1">
            <Button size="sm" onClick={async () => {
              if (!_deferredPromptGlobal) return;
              await _deferredPromptGlobal.prompt();
              const { outcome } = await _deferredPromptGlobal.userChoice;
              if (outcome === 'accepted') { _deferredPromptGlobal = null; setCanInstall(false); }
              else setDismissed(true);
            }}>
              <Download className="w-3.5 h-3.5 ml-1" />{tc("تثبيت", "Install")}
            </Button>
            <Button size="sm" variant="ghost" className="px-2" onClick={() => setDismissed(true)}><X className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
