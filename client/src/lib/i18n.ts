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
      "banner.2.badge": "New"
    }
  },
  ar: {
    translation: {
      "app.name": "كلوني",
      "app.tagline": "قهوة فاخرة",
      "nav.cart": "السلة",
      "nav.profile": "الملف الشخصي",
      "nav.my_card": "بطاقتي",
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
      "banner.2.badge": "جديد"
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
