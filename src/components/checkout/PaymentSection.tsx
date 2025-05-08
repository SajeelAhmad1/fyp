import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from '../stripePatmentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentSectionProps {
  clientSecret: string | null;
  cartItems: any[];
  formData: any;
  onPaymentSuccess: (paymentData: any) => Promise<string | null>;
  validateForm: () => boolean;
  totalPrice: number;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  clientSecret,
  cartItems,
  formData,
  onPaymentSuccess,
  validateForm,
  totalPrice
}) => {
  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Initializing payment system...</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0570de',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'Ideal Sans, system-ui, sans-serif',
            spacingUnit: '2px',
            borderRadius: '4px'
          }
        }
      }}
    >
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Payment Method</h2>
        <div className="border rounded-md p-4">
          <StripePaymentForm
            formData={formData}
            onPaymentSuccess={onPaymentSuccess}
            validateForm={validateForm}
            totalPrice={totalPrice}
            clientSecret={clientSecret}
          />
        </div>
      </div>
    </Elements>
  );
};