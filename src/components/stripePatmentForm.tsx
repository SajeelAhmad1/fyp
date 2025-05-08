import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  formData: any;
  onPaymentSuccess: (paymentData: {
    paymentIntentId: string;
    clientSecret: string;
    paymentMethodId: string;
  }) => Promise<string | null>;
  validateForm: () => boolean;
  totalPrice: number;
  clientSecret: string;
}

const StripePaymentForm = ({
  formData,
  onPaymentSuccess,
  validateForm,
  totalPrice,
  clientSecret
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [paymentElementLoaded, setPaymentElementLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    // Clean up any existing payment elements when clientSecret changes
    return () => {
      if (elements) {
        elements.fetchUpdates().catch(console.error);
      }
    };
  }, [stripe, clientSecret]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentElementLoaded) {
      setErrorMessage('Payment system is not ready yet. Please wait...');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage(undefined);

    try {
      // First validate the payment element
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // Confirm the payment with the existing PaymentIntent
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          receipt_email: formData.email,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw error;
      }

      if (!paymentIntent) {
        throw new Error('No payment intent returned');
      }

      // Only proceed if payment succeeded
      if (paymentIntent.status === 'succeeded') {
        const orderId = await onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret || clientSecret,
          paymentMethodId: paymentIntent.payment_method as string
        });

        if (!orderId) {
          throw new Error('Failed to create order after payment');
        }

        router.push(`/payment-success?orderId=${orderId}`);
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Payment failed');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <PaymentElement
        onReady={() => setPaymentElementLoaded(true)}
        options={{ layout: "tabs" }}
      />
      {errorMessage && (
        <div className="text-red-500 mt-2 p-2 bg-red-50 rounded">
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !paymentElementLoaded || loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mt-4"
      >
        {loading ? 'Processing...' : `Pay £${totalPrice.toFixed(2)}`}
      </button>
    </form>
  );
};

export default StripePaymentForm;