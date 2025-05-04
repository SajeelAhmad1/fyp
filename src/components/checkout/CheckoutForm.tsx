// components/checkout/CheckoutForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function CheckoutForm({ onSubmit, isLoading, cartItems }: any) {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [shippingMethod, setShippingMethod] = useState('standard');
    const paymentMethod = watch('paymentMethod', 'card');
    const [sameAsBilling, setSameAsBilling] = useState(true);

    // Calculate cart totals - this would typically come from your cart state
    const subtotal = cartItems?.reduce((total: number, item: any) => 
        total + (item.price * item.quantity), 0) || 0;
    const shippingCost = shippingMethod === 'standard' ? 5 : 15;
    const total = subtotal + shippingCost;

    const handleFormSubmit = (data: any) => {
        // Add shipping method to form data
        data.shippingMethod = shippingMethod;
        data.shippingCost = shippingCost;
        data.subtotal = subtotal;
        data.total = total;
        
        // If billing same as shipping, copy shipping details to billing
        if (sameAsBilling) {
            data.billingAddressLine1 = data.addressLine1;
            data.billingAddressLine2 = data.addressLine2;
            data.billingCity = data.city;
            data.billingState = data.state;
            data.billingPostalCode = data.postalCode;
            data.billingCountry = data.country;
        }
        
        onSubmit(data);
    };

    return (
        <form id="checkout-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Contact Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                        />
                        {errors.email?.message && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            {...register('phone', { required: 'Phone number is required' })}
                        />
                        {errors.phone?.message && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.phone.message)}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Shipping Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            {...register('fullName', { required: 'Full name is required' })}
                        />
                        {errors.fullName?.message && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.fullName.message)}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1
                        </label>
                        <input
                            id="addressLine1"
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            {...register('addressLine1', { required: 'Address is required' })}
                        />
                        {errors.addressLine1?.message && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.addressLine1.message)}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2 (Optional)
                        </label>
                        <input
                            id="addressLine2"
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            {...register('addressLine2')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                id="city"
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...register('city', { required: 'City is required' })}
                            />
                            {errors.city?.message && (
                                <p className="text-red-500 text-sm mt-1">{String(errors.city.message)}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                State/Province
                            </label>
                            <input
                                id="state"
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...register('state', { required: 'State is required' })}
                            />
                            {errors.state?.message && (
                                <p className="text-red-500 text-sm mt-1">{String(errors.state.message)}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                Postal Code
                            </label>
                            <input
                                id="postalCode"
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...register('postalCode', { required: 'Postal code is required' })}
                            />
                            {errors.postalCode?.message && (
                                <p className="text-red-500 text-sm mt-1">{String(errors.postalCode.message)}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                            </label>
                            <select
                                id="country"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...register('country', { required: 'Country is required' })}
                            >
                                <option value="">Select Country</option>
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="UK">United Kingdom</option>
                                <option value="AU">Australia</option>
                                <option value="DE">Germany</option>
                                <option value="FR">France</option>
                                <option value="JP">Japan</option>
                                <option value="IN">India</option>
                                <option value="BR">Brazil</option>
                            </select>
                            {errors.country?.message && (
                                <p className="text-red-500 text-sm mt-1">{String(errors.country.message)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Billing Information</h2>
                    <div className="flex items-center">
                        <input
                            id="same-as-shipping"
                            type="checkbox"
                            checked={sameAsBilling}
                            onChange={() => setSameAsBilling(!sameAsBilling)}
                            className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="same-as-shipping" className="ml-2 block text-sm font-medium text-gray-700">
                            Same as shipping address
                        </label>
                    </div>
                </div>

                {!sameAsBilling && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="billingAddressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 1
                            </label>
                            <input
                                id="billingAddressLine1"
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...register('billingAddressLine1', { required: !sameAsBilling && 'Billing address is required' })}
                            />
                            {errors.billingAddressLine1?.message && (
                                <p className="text-red-500 text-sm mt-1">{String(errors.billingAddressLine1.message)}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="billingAddressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 2 (Optional)
                            </label>
                            <input
                                id="billingAddressLine2"
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...register('billingAddressLine2')}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    id="billingCity"
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    {...register('billingCity', { required: !sameAsBilling && 'City is required' })}
                                />
                                {errors.billingCity?.message && (
                                    <p className="text-red-500 text-sm mt-1">{String(errors.billingCity.message)}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
                                    State/Province
                                </label>
                                <input
                                    id="billingState"
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    {...register('billingState', { required: !sameAsBilling && 'State is required' })}
                                />
                                {errors.billingState?.message && (
                                    <p className="text-red-500 text-sm mt-1">{String(errors.billingState.message)}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                    Postal Code
                                </label>
                                <input
                                    id="billingPostalCode"
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    {...register('billingPostalCode', { required: !sameAsBilling && 'Postal code is required' })}
                                />
                                {errors.billingPostalCode?.message && (
                                    <p className="text-red-500 text-sm mt-1">{String(errors.billingPostalCode.message)}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <select
                                    id="billingCountry"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    {...register('billingCountry', { required: !sameAsBilling && 'Country is required' })}
                                >
                                    <option value="">Select Country</option>
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="AU">Australia</option>
                                    <option value="DE">Germany</option>
                                    <option value="FR">France</option>
                                    <option value="JP">Japan</option>
                                    <option value="IN">India</option>
                                    <option value="BR">Brazil</option>
                                </select>
                                {errors.billingCountry?.message && (
                                    <p className="text-red-500 text-sm mt-1">{String(errors.billingCountry.message)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Shipping Method Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>

                <div className="space-y-4">
                    <div className="flex items-center">
                        <input
                            id="standard-shipping"
                            type="radio"
                            name="shippingMethod"
                            value="standard"
                            checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}
                            className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="standard-shipping" className="ml-2 block text-sm font-medium text-gray-700">
                            Standard Shipping (£5.00) - 3-5 business days
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="express-shipping"
                            type="radio"
                            name="shippingMethod"
                            value="express"
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                            className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="express-shipping" className="ml-2 block text-sm font-medium text-gray-700">
                            Express Shipping (£15.00) - 1-2 business days
                        </label>
                    </div>
                </div>
            </div>

            {/* Coupon Code Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Discount Code</h2>
                <div className="flex space-x-2">
                    <input
                        id="couponCode"
                        type="text"
                        placeholder="Enter coupon code"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        {...register('couponCode')}
                    />
                    <button 
                        type="button"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => {/* Add coupon validation logic */}}
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Special Instructions</h2>
                <div>
                    <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                        Order Notes (Optional)
                    </label>
                    <textarea
                        id="specialInstructions"
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Special delivery instructions, gift message, etc."
                        {...register('specialInstructions')}
                    ></textarea>
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                {cartItems && cartItems.length > 0 ? (
                    <div className="space-y-4">
                        <div className="max-h-64 overflow-y-auto">
                            {cartItems.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b">
                                    <div className="flex items-center">
                                        <span className="font-medium">{item.quantity}x</span>
                                        <span className="ml-2">{item.name}</span>
                                    </div>
                                    <span>£{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="space-y-2 pt-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>£{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>£{shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>£{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Your cart is empty</p>
                )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <input
                                id="card-payment"
                                type="radio"
                                value="card"
                                {...register('paymentMethod', { required: true })}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="card-payment" className="ml-2 block text-sm font-medium text-gray-700">
                                Credit/Debit Card
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="paypal-payment"
                                type="radio"
                                value="paypal"
                                {...register('paymentMethod', { required: true })}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="paypal-payment" className="ml-2 block text-sm font-medium text-gray-700">
                                PayPal
                            </label>
                        </div>
                    </div>

                    {paymentMethod === 'card' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Card Number
                                </label>
                                <input
                                    id="cardNumber"
                                    type="text"
                                    placeholder="1234 1234 1234 1234"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    {...register('cardNumber', {
                                        required: 'Card number is required',
                                        pattern: {
                                            value: /^[0-9]{16}$/,
                                            message: 'Please enter a valid 16-digit card number'
                                        }
                                    })}
                                />
                                {errors.cardNumber?.message && (
                                    <p className="text-red-500 text-sm mt-1">{String(errors.cardNumber.message)}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiry Date (MM/YY)
                                    </label>
                                    <input
                                        id="cardExpiry"
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        {...register('cardExpiry', {
                                            required: 'Expiry date is required',
                                            pattern: {
                                                value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                                message: 'Please enter a valid expiry date (MM/YY)'
                                            }
                                        })}
                                    />
                                    {errors.cardExpiry?.message && (
                                        <p className="text-red-500 text-sm mt-1">{String(errors.cardExpiry.message)}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                                        CVC
                                    </label>
                                    <input
                                        id="cardCvc"
                                        type="text"
                                        placeholder="123"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        {...register('cardCvc', {
                                            required: 'CVC is required',
                                            pattern: {
                                                value: /^[0-9]{3,4}$/,
                                                message: 'Please enter a valid CVC'
                                            }
                                        })}
                                    />
                                    {errors.cardCvc?.message && (
                                        <p className="text-red-500 text-sm mt-1">{String(errors.cardCvc.message)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'paypal' && (
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p className="text-sm text-gray-600">
                                You will be redirected to PayPal to complete your payment after reviewing your order.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            {...register('termsAccepted', { 
                                required: 'You must accept the terms and conditions' 
                            })}
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="font-medium text-gray-700">
                            I agree to the terms and conditions
                        </label>
                        {errors.termsAccepted?.message && (
                            <p className="text-red-500 text-sm mt-1">{String(errors.termsAccepted.message)}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isLoading ? (
                        <span>Processing...</span>
                    ) : (
                        <span>Complete Order</span>
                    )}
                </button>
            </div>
        </form>
    );
}