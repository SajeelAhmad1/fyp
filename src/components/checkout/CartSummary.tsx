// components/checkout/CartSummary.tsx
import Image from 'next/image';

export default function CartSummary({ items }:any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Order Items ({items.length})</h2>
      
      <div className="space-y-4">
        {items.map((item:any) => (
          <div key={item.id} className="flex items-center space-x-4 py-2 border-b last:border-b-0">
            <div className="w-16 h-16 relative bg-gray-100 rounded-md flex-shrink-0">
              {item.product.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            
            <div className="text-right">
              <p className="font-medium">£{(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
