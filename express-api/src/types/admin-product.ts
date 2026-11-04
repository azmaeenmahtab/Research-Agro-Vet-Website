export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export type ProductFormFactor =
  | 'POWDER'
  | 'LIQUID'
  | 'SACHET'
  | 'BOLUS'
  | 'SOLUTION'
  | 'OINTMENT'
  | 'INJECTION'
  | 'OTHER';

export interface AdminVariant {
  id?: string;
  sku: string;
  packSize: string;
  weightGrams: number;
  packagingInfo?: string | null;
  unitsPerBox?: number | null;
  tradePrice: number;
  mrpPrice: number;
  sellingPrice: number;
  minWholesaleQty?: number | null;
  minWholesaleAmount?: number | null;
  stockQuantity: number;
  inStock: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export interface AdminProduct {
  id: string;
  legacyCatalogId?: number | null;
  nameEn: string;
  nameBn?: string | null;
  slug: string;
  formFactor: ProductFormFactor;
  speciesTags: string[];
  dlsLicenseNo?: string | null;
  bangladeshPatentNo?: string | null;
  manufacturer?: string | null;
  thumbnail: string;
  images: string[];
  shortDescription?: string | null;

  // Clinical / AI Reference Data
  composition?: string | null;
  indication?: string | null;
  dosageAndAdministration?: string | null;
  withdrawalPeriod?: string | null;
  contraindications?: string | null;
  storageInstructions?: string | null;
  searchKeywords: string[];

  // Merchandising & Visibility
  isFeatured: boolean;
  isBestSeller: boolean;
  status: ProductStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;

  categoryId?: string | null;
  category?: {
    id: string;
    nameEn: string;
    nameBn?: string | null;
    slug: string;
  } | null;
  categories?: {
    id: string;
    nameEn: string;
    nameBn?: string | null;
    slug: string;
  }[];
  categoryIds?: string[];

  variants: AdminVariant[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ClinicalDataPayload {
  composition?: string | null;
  indication?: string | null;
  dosageAndAdministration?: string | null;
  withdrawalPeriod?: string | null;
  contraindications?: string | null;
  storageInstructions?: string | null;
  searchKeywords?: string[];
}

export interface ProductSummaryStats {
  totalProducts: number;
  activeVariants: number;
  outOfStockVariants: number;
  averageMarginPercentage: number;
}
