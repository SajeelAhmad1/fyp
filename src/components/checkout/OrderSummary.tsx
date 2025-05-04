// components/checkout/OrderSummary.tsx
export default function OrderSummary({ totals }:any) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>£{totals.subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>£{totals.shipping.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>£{totals.tax.toFixed(2)}</span>
          </div>
          
          <div className="pt-2 mt-2 border-t border-gray-200">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>£{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }