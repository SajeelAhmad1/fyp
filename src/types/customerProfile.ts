// types/customerProfile.ts
export interface CustomerProfile {
  id?: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  imageUrl?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}