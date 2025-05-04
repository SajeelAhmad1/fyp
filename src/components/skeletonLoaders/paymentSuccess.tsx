import React from 'react';

const PaymentSuccessLoader = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg animate-pulse">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <div className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto mb-3"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6 mx-auto mt-2"></div>
      </div>

      {/* Order summary skeleton */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded-md w-1/6"></div>
        </div>

        {/* Order items */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="border-t border-gray-100 py-3">
            <div className="flex justify-between mb-2">
              <div className="h-5 bg-gray-200 rounded-md w-2/5"></div>
              <div className="h-5 bg-gray-200 rounded-md w-1/6"></div>
            </div>
            <div className="flex mb-1">
              <div className="h-4 bg-gray-200 rounded-md w-1/3 mr-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
            </div>
          </div>
        ))}

        {/* Total section */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-between mb-2">
            <div className="h-5 bg-gray-200 rounded-md w-1/4"></div>
            <div className="h-5 bg-gray-200 rounded-md w-1/6"></div>
          </div>
          <div className="flex justify-between mb-2">
            <div className="h-5 bg-gray-200 rounded-md w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded-md w-1/6"></div>
          </div>
          <div className="flex justify-between font-bold">
            <div className="h-6 bg-gray-300 rounded-md w-1/4"></div>
            <div className="h-6 bg-gray-300 rounded-md w-1/5"></div>
          </div>
        </div>
      </div>

      {/* Buttons skeleton */}
      <div className="flex flex-col md:flex-row space-x-0 md:space-x-2 justify-center">
        <div className="mt-6 text-center">
          <div className="inline-block h-10 bg-gray-200 rounded-lg w-36"></div>
        </div>
        <div className="mt-6 text-center">
          <div className="inline-block h-10 bg-gray-200 rounded-lg w-36"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessLoader;