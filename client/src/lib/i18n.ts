import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app.name": "CLUNY",
      "app.tagline": "Premium Coffee",
      "nav.cart": "Cart",
      "nav.profile": "Profile",
      "nav.my_card": "My Card",
      "menu.title": "Menu",
      "menu.search_placeholder": "Search for your favorite drink...",
      "menu.categories.all": "All",
      "menu.categories.hot": "Hot",
      "menu.categories.cold": "Cold",
      "menu.categories.specialty": "Special",
      "menu.categories.desserts": "Desserts",
      "menu.featured": "Best Sellers",
      "menu.all_items": "Drinks List",
      "menu.view_all": "View All",
      "menu.add_to_cart": "Add",
      "menu.added_to_cart": "Added to cart",
      "menu.added_to_cart_desc": "Product has been successfully added to your cart",
      "menu.view_cart": "View Cart",
      "menu.items_count": "{{count}} items",
      "currency": "SAR",
      "location.riyadh": "Riyadh",
      "status.open": "Open Now",
      "banner.1.title": "Exceptional Coffee",
      "banner.1.subtitle": "Discover unique flavors from the finest coffee beans",
      "banner.1.badge": "Special Offers",
      "banner.2.title": "Unforgettable Moments",
      "banner.2.subtitle": "Enjoy a unique coffee experience with us",
      "banner.2.badge": "New",
      "nav.menu": "Menu",
      "nav.my_orders": "Orders",
      "legal.cr": "CR: 1010731557",
      "legal.vat": "VAT: 311813963900003",
      "legal.rights": "All rights reserved",
      "pwa.install_ios_title": "Install on iPhone",
      "pwa.install_ios_desc": "Tap the Share icon and then choose 'Add to Home Screen'",
      "pwa.install_title": "Install App",
      "pwa.install_desc": "Tap the Browser Menu and then choose 'Install App' or 'Add to Home Screen'",
      "pwa.prompt_title": "Install Cluny App",
      "pwa.prompt_desc": "Enjoy a faster experience and instant access",
      "pwa.install_btn": "Install Now",
      "pwa.not_now": "Not now"
    }
  },
  ar: {
    translation: {
      "app.name": "كلوني",
      "app.tagline": "قهوة فاخرة",
      "nav.cart": "السلة",
      "nav.profile": "الملف الشخصي",
      "nav.my_card": "بطاقتي",
      "nav.menu": "القائمة",
      "nav.my_orders": "طلباتي",
      "menu.title": "القائمة",
      "menu.search_placeholder": "ابحث عن مشروبك المفضل...",
      "menu.categories.all": "الكل",
      "menu.categories.hot": "ساخن",
      "menu.categories.cold": "بارد",
      "menu.categories.specialty": "مميز",
      "menu.categories.desserts": "حلويات",
      "menu.featured": "الأكثر مبيعاً",
      "menu.all_items": "قائمة المشروبات",
      "menu.view_all": "عرض الكل",
      "menu.add_to_cart": "إضافة",
      "menu.added_to_cart": "تمت الإضافة للسلة",
      "menu.added_to_cart_desc": "تمت إضافة المنتج بنجاح إلى سلة مشترياتك",
      "menu.view_cart": "عرض السلة",
      "menu.items_count": "{{count}} منتجات",
      "currency": "ر.س",
      "location.riyadh": "الرياض",
      "status.open": "مفتوح الآن",
      "banner.1.title": "قهوة استثنائية",
      "banner.1.subtitle": "اكتشف نكهات مميزة من أجود حبوب البن",
      "banner.1.badge": "عروض خاصة",
      "banner.2.title": "لحظات لا تُنسى",
      "banner.2.subtitle": "استمتع بتجربة قهوة فريدة معنا",
      "banner.2.badge": "جديد",
      "legal.cr": "السجل التجاري: 1010731557",
      "legal.vat": "الرقم الضريبي: 311813963900003",
      "legal.rights": "جميع الحقوق محفوظة",
      "pwa.install_ios_title": "تثبيت على iPhone",
      "pwa.install_ios_desc": "اضغط على أيقونة المشاركة (Share) ثم اختر 'إضافة إلى الشاشة الرئيسية'",
      "pwa.install_title": "تثبيت التطبيق",
      "pwa.install_desc": "اضغط على القائمة (⋮) في المتصفح ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'",
      "pwa.prompt_title": "ثبت تطبيق كلووني",
      "pwa.prompt_desc": "استمتع بتجربة أسرع ووصول فوري",
      "pwa.install_btn": "تثبيت الآن",
      "pwa.not_now": "ليس الآن"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
