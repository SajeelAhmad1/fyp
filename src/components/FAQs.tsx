"use client"
import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "1. What payment methods do you accept?",
      answer: (
        <>
          <p>We accept the following secure payment methods:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Visa</li>
            <li>Mastercard</li>
            <li>Maestro</li>
            <li>American Express</li>
            <li>UnionPay</li>
            <li>JCB</li>
            <li>PayPal</li>
          </ul>
          <p className="mt-2">All transactions are processed securely, and we do not store your payment information.</p>
        </>
      )
    },
    {
      question: "2. Can I cancel my order?",
      answer: "You may cancel your order before it has been processed and dispatched. To request a cancellation, please contact our customer service team promptly with your order details. Once an order has been dispatched, it cannot be canceled but may be eligible for return under our Returns Policy."
    },
    {
      question: "3. What is your returns and exchanges policy?",
      answer: (
        <>
          <p>We accept returns within 14 days of delivery for items in their original condition and packaging. Please note:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Return Shipping: Customers are responsible for return shipping costs unless the item is faulty or not as described.</li>
            <li>Exchanges: Exchanges are subject to stock availability. To initiate a return or exchange, please contact our customer service team.</li>
          </ul>
          <p className="mt-2">For more details, please refer to our Returns & Exchanges Policy.</p>
        </>
      )
    },
    {
      question: "4. Do you ship internationally?",
      answer: "Currently, we ship orders within the United Kingdom only. We do not offer international shipping at this time."
    },
    {
      question: "5. How long will it take to receive my order?",
      answer: (
        <>
          <p>Orders are typically processed within 1-2 business days. Delivery times vary based on your selected shipping method:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Standard Delivery: 3-5 business days</li>
            <li>Express Delivery: 1-2 business days</li>
          </ul>
          <p className="mt-2">Please note that delivery times may vary during peak periods or due to unforeseen circumstances.</p>
        </>
      )
    },
    {
      question: "6. How can I track my order?",
      answer: "Once your order has been dispatched, you will receive a confirmation email with tracking information. You can use this information to monitor the delivery status of your order."
    },
    {
      question: "7. Do you offer gift cards or vouchers?",
      answer: "Yes, we offer digital gift cards in various denominations. Gift cards can be purchased directly from our website and are delivered via email."
    },
    {
      question: "8. How can I contact customer support?",
      answer: (
        <>
          <p>Our customer service team is here to assist you. You can reach us via:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Email: support@yourwebsite.com</li>
            <li>Phone: +44 (0)1234 567890</li>
            <li>Hours: Monday to Friday, 9:00 AM – 5:00 PM (GMT)</li>
          </ul>
          <p className="mt-2">We aim to respond to all inquiries within 24 hours.</p>
        </>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
        FAQs
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleFAQ(index)}
            >
              <h2 className="text-lg font-semibold text-cyan-700 text-left">
                {faq.question}
              </h2>
              <span className="text-cyan-700 text-xl">
                {activeIndex === index ? '−' : '+'}
              </span>
            </button>
            
            <div className={`transition-all duration-300 overflow-hidden ${activeIndex === index ? 'max-h-96 p-4' : 'max-h-0'}`}>
              <div className="text-gray-700">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>Last Updated: May 10, 2025</p>
      </div>
    </div>
  );
};

export default FAQ;