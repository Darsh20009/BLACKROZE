type Lang = 'ar' | 'en';

type TranslateFn = (ar: string, en?: string) => string;

function getLang(): Lang {
  const lang = typeof navigator !== 'undefined' ? navigator.language : 'ar';
  return lang.startsWith('en') ? 'en' : 'ar';
}

export function useTranslate(): TranslateFn {
  const lang = getLang();
  return (ar: string, en?: string): string => {
    if (lang === 'en' && en) return en;
    return ar;
  };
}

export const tc: TranslateFn = (ar: string, en?: string): string => {
  const lang = getLang();
  if (lang === 'en' && en) return en;
  return ar;
};

export default useTranslate;
