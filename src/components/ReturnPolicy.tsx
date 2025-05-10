"use client"
import React from 'react';

const ReturnPolicy = () => {
    const sections = [
        { 
            title: "Return Policy", 
            content: "We strive to provide our customers with quality products and exceptional service. However, we understand that there may be occasions where you need to return or exchange an item. Please review our policy below, which outlines your rights and our procedures in accordance with UK consumer laws."
        },
        { 
            title: "1. Order Cancellation", 
            subsections: [
                { 
                    subtitle: "Before Dispatch", 
                    content: "You may cancel your order at any time before it has been processed and dispatched. To do so, please contact our customer service team promptly with your order details."
                },
                { 
                    subtitle: "After Dispatch", 
                    content: "Once your order has been dispatched, it enters the returns process. Please refer to our returns section for further guidance."
                }
            ]
        },
        { 
            title: "2. Returns", 
            subsections: [
                { 
                    subtitle: "Eligibility", 
                    content: "You have the right to return items within 14 calendar days of receiving your order."
                },
                { 
                    subtitle: "Condition", 
                    content: "Items must be returned in their original condition, unused, and with all original packaging and tags intact."
                },
                { 
                    subtitle: "Process", 
                    content: [
                        "Contact our customer service team to initiate a return and receive a Return Authorization Number (RAN).",
                        "Securely package the item, including all original packaging and documentation.",
                        "Clearly mark the RAN on the outside of the package.",
                        "Use a tracked and insured postal service to send the item to the address provided by our team."
                    ]
                },
                { 
                    subtitle: "Costs", 
                    content: "Customers are responsible for the cost of returning items unless the item is faulty or not as described."
                }
            ]
        },
        { 
            title: "3. Faulty or Misdescribed Items", 
            content: "If you receive an item that is faulty or not as described, please contact our customer service team within 30 days of receipt. We will provide instructions for returning the item at no cost to you and offer a full refund, repair, or replacement as appropriate."
        },
        { 
            title: "4. Non-Returnable Items", 
            content: "Certain items are exempt from being returned unless faulty:",
            listItems: [
                "Perishable goods (e.g., food, flowers).",
                "Sealed items that have been unsealed after delivery (e.g., DVDs, software).",
                "Personalised or custom-made products.",
                "Sealed hygiene items (e.g., underwear, swimwear) that have been unsealed."
            ]
        },
        { 
            title: "5. Refunds", 
            subsections: [
                { 
                    subtitle: "Processing Time", 
                    content: "Refunds will be processed to the original payment method within 14 days of receiving the returned item or proof of return."
                },
                { 
                    subtitle: "Delivery Charges", 
                    content: "If you cancel your order before dispatch, we will refund the full amount, including any delivery charges. If you return items after dispatch, we will refund the cost of the items but not the original delivery charges."
                },
                { 
                    subtitle: "Deductions", 
                    content: "We may deduct an amount from your refund if the value of the goods has been reduced due to unnecessary handling."
                }
            ]
        },
        { 
            title: "6. Contact Us", 
            content: "For any questions or to initiate a return or exchange, please contact our customer service team:",
            contactInfo: [
                "Email: support@yourwebsite.com",
                "Phone: +44 (0)1234 567890",
                "Hours: Monday to Friday, 9:00 AM – 5:00 PM (GMT)"
            ]
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
                Return Policy
            </h1>

            {sections.map((section, index) => (
                <div key={index} className="mb-6 border-b border-gray-200 pb-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold text-cyan-700 mb-4">
                            {section.title}
                        </h2>

                        {section.content && (
                            <p className="text-gray-700 mb-4">{section.content}</p>
                        )}
                        
                        {section.listItems && (
                            <ul className="list-disc pl-5 mb-4 text-gray-700">
                                {section.listItems.map((item, itemIndex) => (
                                    <li key={itemIndex} className="mb-1">{item}</li>
                                ))}
                            </ul>
                        )}

                        {section.subsections && section.subsections.map((subsection, subIndex) => (
                            <div key={subIndex} className="mb-4">
                                <h3 className="font-medium text-cyan-600 mb-2">
                                    {subsection.subtitle}
                                </h3>
                                {Array.isArray(subsection.content) ? (
                                    <ol className="list-decimal pl-5 text-gray-700">
                                        {subsection.content.map((item, itemIndex) => (
                                            <li key={itemIndex} className="mb-1">{item}</li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="text-gray-700">
                                        {subsection.content}
                                    </p>
                                )}
                            </div>
                        ))}

                        {section.contactInfo && (
                            <ul className="text-gray-700">
                                {section.contactInfo.map((info, infoIndex) => (
                                    <li key={infoIndex} className="mb-1">{info}</li>
                                ))}
                            </ul>
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

export default ReturnPolicy;