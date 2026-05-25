import {
  LucideUtensils,
  LucideShoppingCart,
  LucideGlobe,
  LucideGraduationCap,
  LucideCoffee,
  LucideHeart,
  LucideDumbbell,
  LucideShirt,
  LucideCar,
  LucideStore,
  LucideIcon,
} from '@lucide/angular';

export interface VendorIconOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const VENDOR_ICONS: VendorIconOption[] = [
  { key: 'utensils',       label: 'مطعم',    icon: LucideUtensils },
  { key: 'shopping-cart',  label: 'بقالة',    icon: LucideShoppingCart },
  { key: 'globe',          label: 'سياحة',    icon: LucideGlobe },
  { key: 'graduation-cap', label: 'تعليم',    icon: LucideGraduationCap },
  { key: 'coffee',         label: 'مقهى',     icon: LucideCoffee },
  { key: 'heart',          label: 'صحة',      icon: LucideHeart },
  { key: 'dumbbell',       label: 'رياضة',    icon: LucideDumbbell },
  { key: 'shirt',          label: 'ملابس',    icon: LucideShirt },
  { key: 'car',            label: 'مواصلات',  icon: LucideCar },
  { key: 'store',          label: 'متجر',     icon: LucideStore },
];

/** All Lucide icon components — pass to provideLucideIcons() in any component that renders vendor icons */
export const ALL_VENDOR_LUCIDE_ICONS = [
  LucideUtensils, LucideShoppingCart, LucideGlobe, LucideGraduationCap,
  LucideCoffee, LucideHeart, LucideDumbbell, LucideShirt, LucideCar, LucideStore,
] as const;

/** Returns the LucideIcon for a given key, or LucideStore as fallback */
export function getVendorIcon(key: string | null | undefined): LucideIcon {
  return VENDOR_ICONS.find(i => i.key === key)?.icon ?? LucideStore;
}
