import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/common/components/elements/Card';
import ButtonLove from '@/common/components/elements/ButtonLove';
import Star from '@/common/components/elements/Star';

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  images: string[];
  avgRating: number;
  reviewCount: number;
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product:any) => (
        <Card key={product.id} className="group relative overflow-hidden">
          <div className="relative h-48 overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <Image
                src={product.images[0] || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <div className="absolute top-2 right-2">
              <ButtonLove />
              {/* <ButtonLove productId={product.id} /> */}
            </div>
            
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                {Math.round(Number(product.discount))}% OFF
              </div>
            )}
          </div>
          
          <div className="p-3">
            <Link href={`/product/${product.id}`} className="block">
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
              
              <div className="flex items-center mb-2">
                <Star value={product.avgRating} />
                <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {product.discount ? (
                  <>
                    <span className="font-bold text-sm">${(product.price * (1 - Number(product.discount) / 100)).toFixed(2)}</span>
                    <span className="text-gray-500 text-xs line-through">${Number(product.price).toFixed(2)}</span>
                  </>
                ) : (
                  <span className="font-bold text-sm">${Number(product.price).toFixed(2)}</span>
                )}
              </div>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;