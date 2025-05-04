import { SequenceMatcher } from 'difflib';
import { Prisma } from '@prisma/client';

// Use Prisma.Decimal instead of importing from runtime
type Decimal = Prisma.Decimal;

// Interface matching your Prisma model
interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  color: string[];
  size: string[];
  price: Decimal;
  discount?: Decimal | null;
  isFeatured: boolean;
  isBestChoice: boolean;
  stock: number;
  sku: string;
  images: string[];
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  vendorId?: string | null;
  vendor?: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query || query.trim() === '') {
    return products;
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  
  // If no valid query terms, return all products
  if (queryTerms.length === 0) {
    return products;
  }

  return products
    .map(product => {
      // Calculate relevance score for each product
      let score = 0;
      const searchableFields = {
        // Primary fields (highest weight)
        name: product.name.toLowerCase(),
        sku: product.sku.toLowerCase(),
        
        // Secondary fields (medium weight)
        shortDescription: product.shortDescription.toLowerCase(),
        categoryName: product.category?.name?.toLowerCase() || '',
        color: product.color.join(' ').toLowerCase(),
        size: product.size.join(' ').toLowerCase(),
        vendorName: product.vendor?.name?.toLowerCase() || '',
        
        // Tertiary fields (lower weight but still important)
        description: product.description.toLowerCase()
      };

      // Calculate exact match scores
      for (const term of queryTerms) {
        // Primary fields (highest weight - exact matches)
        if (searchableFields.name.includes(term)) score += 10;
        if (searchableFields.sku === term) score += 15; // Exact SKU match is highest priority
        
        // Secondary fields (medium weight - exact matches)
        if (searchableFields.shortDescription.includes(term)) score += 6;
        if (searchableFields.categoryName.includes(term)) score += 6;
        if (searchableFields.color.includes(term)) score += 5;
        if (searchableFields.size.includes(term)) score += 5;
        if (searchableFields.vendorName.includes(term)) score += 5;
        
        // Tertiary fields (lower weight - exact matches)
        if (searchableFields.description.includes(term)) score += 3;
      }

      // Calculate fuzzy match scores for cases where exact matches aren't found
      if (score === 0) {
        const calculateRatio = (str: string, term: string): number => {
          const matcher = new SequenceMatcher(null, str, term);
          return matcher.ratio();
        };

        for (const term of queryTerms) {
          // Only perform fuzzy matching on key fields to improve performance
          const nameRatio = calculateRatio(searchableFields.name, term);
          const skuRatio = calculateRatio(searchableFields.sku, term);
          const shortDescRatio = calculateRatio(searchableFields.shortDescription, term);
          
          // Apply weighted ratios
          if (nameRatio > 0.6) score += nameRatio * 5;
          if (skuRatio > 0.7) score += skuRatio * 7; // Higher threshold for SKU
          if (shortDescRatio > 0.6) score += shortDescRatio * 3;
        }
      }

      // Additional business logic bonuses
      if (product.isFeatured) score += 2;     // Featured products get a slight boost
      if (product.isBestChoice) score += 3;   // Best choice products get a bigger boost
      if (product.stock > 0) score += 1;      // In-stock products get a slight boost
      
      // Price-based filtering could be added here if needed
      
      return { product, score };
    })
    .filter(item => item.score > 0)  // Only include products with a positive score
    .sort((a, b) => b.score - a.score)  // Sort by score descending
    .map(item => item.product);  // Return just the products
}

// Helper function to format search results with highlighting
export function highlightSearchTerms(text: string, query: string): string {
  if (!query || !text) return text;
  
  const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  let result = text;
  
  for (const term of terms) {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark>£1</mark>');
  }
  
  return result;
}