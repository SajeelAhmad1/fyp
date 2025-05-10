"use client"
import React from 'react';

const PaymentMethods = () => {
    const paymentInfo = [
        { 
            title: "Payment Methods", 
            content: "We offer a wide range of secure and convenient payment options to make your shopping experience seamless. Our accepted payment methods include:",
            methods: [
                "Visa",
                "Mastercard",
                "Maestro",
                "American Express",
                "UnionPay",
                "JCB",
                "PayPal",
                "Google Pay"
            ],
            additionalContent: "All transactions are encrypted and processed securely. We do not store your credit card information on our servers."
        },
        { 
            title: "How to Pay", 
            content: "Whether you prefer to pay with your credit/debit card or a digital wallet like PayPal, we've got you covered. At checkout, simply select your preferred payment method and follow the easy steps to complete your purchase."
        },
        { 
            title: "Need Help?", 
            content: "If you encounter any issues or have questions about payment options, feel free to contact our support team."
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
                Payment Methods
            </h1>

            {paymentInfo.map((section, index) => (
                <div key={index} className="mb-6 border-b border-gray-200 pb-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold text-cyan-700 mb-4">
                            {section.title}
                        </h2>

                        {section.content && (
                            <p className="text-gray-700 mb-4">{section.content}</p>
                        )}
                        
                        {section.methods && (
                            <ul className="list-disc pl-5 mb-4 text-gray-700">
                                {section.methods.map((method, methodIndex) => (
                                    <li key={methodIndex} className="mb-1">{method}</li>
                                ))}
                            </ul>
                        )}

                        {section.additionalContent && (
                            <p className="text-gray-700">{section.additionalContent}</p>
                        )}
                    </div>
                </div>
            ))}

            <div className="mt-8 text-center text-gray-600 text-sm">
                <p>Last Updated: May 10, 2025</p>
            </div>
        </div>
    );
};

export default PaymentMethods;