import Image from 'next/image';
import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  images?: string[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface OrderSummaryProps {
  items: OrderItem[];
  orderCount: number | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, orderCount }) => {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + item.price;
    }, 0);
  };

  const calculateDiscounts = (subtotal: number) => {
    let discounts = [];
    let total = subtotal;
    
    if (orderCount === 0) {
      const firstOrderDiscount = subtotal * 0.2;
      discounts.push({
        name: "First Order Discount (20%)",
        amount: firstOrderDiscount
      });
      total -= firstOrderDiscount;
    }
    
    if (total > 75) {
      const bulkDiscount = total * 0.05;
      discounts.push({
        name: "Bulk Order Discount (5%)",
        amount: bulkDiscount
      });
      total -= bulkDiscount;
    }
    
    return { discounts, total };
  };

  const subtotal = calculateSubtotal();
  const { discounts, total } = calculateDiscounts(subtotal);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Order Summary</h2>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Qty</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 relative mr-3">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="48px"
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">£{item.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            {discounts.map((discount, index) => (
              <tr key={index} className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <td colSpan={2}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        {discount.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  -£{discount.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} className="px-4 py-3 text-right font-semibold">Total:</td>
              <td className="px-4 py-3 text-right font-semibold">
                £{total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};