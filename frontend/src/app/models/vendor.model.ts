export interface VendorCategory {
  id: string;
  name: string;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  categoryId: string;
  category: VendorCategory;
  location: string | null;
  discount: string;
  imageUrl: string | null;
  mapsUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicVendor {
  id: string;
  name: string;
  categoryName: string;
  categoryIcon: string | null;
  location: string | null;
  discount: string;
  imageUrl: string | null;
  mapsUrl: string | null;
  createdAt: string;
}

export interface CreateVendorDto {
  name: string;
  categoryId: string;
  discount: string;
  location?: string;
  imageUrl?: string;
  mapsUrl?: string;
}

export interface UpdateVendorDto {
  name?: string;
  categoryId?: string;
  discount?: string;
  location?: string;
  imageUrl?: string;
  mapsUrl?: string;
}

export interface CreateCategoryDto {
  name: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
}
