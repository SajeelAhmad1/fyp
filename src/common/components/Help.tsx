import React from 'react';

const Help = () => {
    const sections = [
        { 
            title: "Help Center", 
            content: "Welcome to our Help Center! Here you'll find answers to common questions and guidance on using our website."
        },
        { 
            title: "Ordering", 
            subsections: [
                {
                    subtitle: "How do I place an order?",
                    content: "Browse our products, add items to your cart, and proceed to checkout. Follow the on-screen instructions to complete your purchase."
                },
                {
                    subtitle: "Can I modify or cancel my order?",
                    content: "Orders can be modified or canceled before they are processed. Please contact us immediately if you need to make changes."
                }
            ]
        },
        { 
            title: "Shipping", 
            subsections: [
                {
                    subtitle: "What are your shipping options?",
                    content: "We offer standard and express shipping within the UK. Shipping costs and delivery times are calculated at checkout."
                },
                {
                    subtitle: "Do you ship internationally?",
                    content: "Currently, we only ship within the United Kingdom."
                }
            ]
        },
        { 
            title: "Returns & Exchanges", 
            subsections: [
                {
                    subtitle: "What is your return policy?",
                    content: "You can return items within 14 days of receipt, provided they are unused and in original packaging. Return shipping costs are the customer's responsibility unless the item is faulty."
                },
                {
                    subtitle: "How do I initiate a return or exchange?",
                    content: "Contact our customer support team with your order number and reason for return. We'll provide instructions for the return process."
                }
            ]
        },
        { 
            title: "Account Management", 
            subsections: [
                {
                    subtitle: "Do I need an account to shop?",
                    content: "No, you can checkout as a guest. However, creating an account allows you to track orders and manage your preferences."
                },
                {
                    subtitle: "How do I reset my password?",
                    content: 'Click on "Forgot Password" on the login page and follow the instructions to reset your password.'
                }
            ]
        },
        { 
            content: "If you have further questions or need assistance, please don't hesitate to contact us."
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
                Help Center
            </h1>

            {sections.map((section, index) => (
                <div key={index} className="mb-6 border-b border-gray-200 pb-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                        {section.title && (
                            <h2 className="text-xl font-semibold text-cyan-700 mb-4">
                                {section.title}
                            </h2>
                        )}

                        {section.content && (
                            <p className="text-gray-700 mb-4">{section.content}</p>
                        )}
                        
                        {section.subsections && section.subsections.map((subsection, subIndex) => (
                            <div key={subIndex} className="mb-4">
                                <h3 className="font-medium text-cyan-600 mb-2">
                                    {subsection.subtitle}
                                </h3>
                                <p className="text-gray-700">
                                    {subsection.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="mt-8 text-center text-gray-600 text-sm">
                <p>Last Updated: May 10, 2025</p>
            </div>
        </div>
    )
}

export default Help;