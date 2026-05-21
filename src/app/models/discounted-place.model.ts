export type PlaceType = 'مطعم' | 'بقالة' | 'سياحة' | 'تعليم';
export type PlaceLocation =
  | 'سايبرجايا' | 'سيردانج' | 'كوالالمبور'
  | 'مالاكا' | 'جوهور' | 'غومباك' | 'قدح'
  | 'كاجانج' | 'أونلاين' | null;

export interface DiscountedPlace {
  id: number;
  name: string;
  type: PlaceType;
  location: PlaceLocation;
  discount: string;
  imageUrl: string;
  mapsUrl: string;
}