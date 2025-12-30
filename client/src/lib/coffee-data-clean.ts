// Cleaned Coffee Data - All old references removed
// Using simple placeholders until proper images are added

export const defaultCoffeeMenu = [
  // Placeholder entries - to be populated from API
];

export const coffeeCategories = [
  { id: "basic" as const, nameAr: "قهوة أساسية", nameEn: "Basic Coffee" },
  { id: "hot" as const, nameAr: "قهوة ساخنة", nameEn: "Hot Coffee" },
  { id: "cold" as const, nameAr: "قهوة باردة", nameEn: "Cold Coffee" },
  { id: "specialty" as const, nameAr: "المشروبات الإضافية", nameEn: "Specialty Drinks" },
  { id: "desserts" as const, nameAr: "الحلويات", nameEn: "Desserts" },
];

export function getCoffeeImage(coffeeId: string): string {
  // Return CLUNY logo as placeholder for all images
  return "/logo.png";
}
