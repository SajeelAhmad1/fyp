export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discount: number;
  stock: number;
  sku?: string;
  images?: string[];
  colors?: string[];
  size?: string[];
  category?: Category;
  vendor?: Vendor;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  video?: string;
  salesEndTime?: string | null;
}