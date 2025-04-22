import { useState } from "react";
import { useRouter } from "next/navigation";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';


const StripePaymentForm = ({
    cartItems,
    formData,
    onPaymentSuccess,
    validateForm,
    totalPrice
}: {
    cartItems?: any[],
    formData: any,
    onPaymentSuccess: () => Promise<string | null>,
    validateForm: () => boolean,
    totalPrice: number
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [paymentElementLoaded, setPaymentElementLoaded] = useState(false);
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!stripe || !elements || !paymentElementLoaded) {
            setErrorMessage('Payment system is not ready yet. Please wait...');
            return;
        }

        setLoading(true);
        setErrorMessage(undefined);

        try {
            // First submit the payment elements to Stripe
            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw submitError;
            }

            // Confirm the payment with Stripe
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                },
                redirect: 'if_required' // Don't redirect automatically
            });

            if (error) {
                throw error;
            }

            // Only if payment was successful, create the order
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                const orderId = await onPaymentSuccess();
                
                if (!orderId) {
                    throw new Error('Failed to create order after successful payment');
                }

                // Redirect to success page with order ID
                router.push(`/payment-success?orderId=${orderId}`);
            } else {
                throw new Error('Payment was not successful');
            }
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Payment processing failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6">
            <PaymentElement
                onReady={() => setPaymentElementLoaded(true)}
                options={{
                    layout: "tabs",
                }}
            />
            {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
            <button
                type="submit"
                disabled={!stripe || !paymentElementLoaded || loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mt-4"
            >
                {loading ? 'Processing Payment...' : `Pay $${totalPrice}`}
            </button>
        </form>
    );
};
export default StripePaymentForm;