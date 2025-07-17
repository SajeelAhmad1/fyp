"use client"
import React from 'react';

const TermsAndConditions = () => {
    const sections = [
        { 
            title: "1. General Information", 
            content: "eTrolly is a trading name of Company, registered in United Kingdom.Contact Email: etrolly@gmail.com" 
        },
        { 
            title: "2. Website Use", 
            subsections: [
                { 
                    subtitle: "a) Eligibility", 
                    content: "To use this website and make purchases, you must be at least 18 years old or have the consent of a parent or legal guardian." 
                },
                { 
                    subtitle: "b) Accuracy of Information", 
                    content: "We strive to ensure all information on our website, including product descriptions, prices, and availability, is accurate and up to date. However, errors may occur, and we reserve the right to correct any inaccuracies without prior notice." 
                }
            ]
        },
        { 
            title: "3. Orders and Purchases", 
            subsections: [
                { 
                    subtitle: "a) Placing an Order", 
                    content: "When you place an order, you will receive an acknowledgment email. This does not constitute acceptance of your order. Acceptance occurs when we confirm that your order has been dispatched." 
                },
                { 
                    subtitle: "b) Payment", 
                    content: "Payments must be made in full before your order is processed. We accept the payment methods listed on our website." 
                },
                { 
                    subtitle: "c) Pricing and Availability", 
                    content: "Prices and availability are subject to change without notice. In the event of a pricing error, we will notify you and give you the option to reconfirm or cancel your order." 
                },
                { 
                    subtitle: "d) Delivery", 
                    content: "Delivery times are estimates and depend on third-party carriers. We are not liable for delays caused by circumstances beyond our control." 
                }
            ]
        },
        { 
            title: "4. Returns and Refunds", 
            subsections: [
                { 
                    subtitle: "a) Returns Policy", 
                    content: "You may return eligible items as per our Returns Policy. Items must be unused, in their original packaging, and returned within [insert number] days." 
                },
                { 
                    subtitle: "b) Refunds", 
                    content: "Refunds will be issued to your original payment method once we inspect and approve the returned item." 
                }
            ]
        },
        { 
            title: "5. User Conduct", 
            content: "You agree to use our website for lawful purposes only. Prohibited activities include: Violating any applicable UK laws or regulations, Uploading harmful content such as viruses or malware, Engaging in fraudulent or unauthorized activities." 
        },
        { 
            title: "6. Intellectual Property", 
            content: "All content on this website, including text, images, and graphics, is owned by or licensed to eTrolly. Unauthorized use, reproduction, or distribution of this content is prohibited." 
        },
        { 
            title: "7. Liability", 
            subsections: [
                { 
                    subtitle: "a) Limitation of Liability", 
                    content: "To the fullest extent permitted by UK law, we exclude liability for any indirect, incidental, or consequential damages arising from your use of our website or products." 
                },
                { 
                    subtitle: "b) Force Majeure", 
                    content: "We are not liable for failure to fulfill our obligations due to events beyond our control, such as natural disasters, strikes, or technical failures." 
                }
            ]
        },
        { 
            title: "8. Third-Party Links", 
            content: "Our website may contain links to third-party websites for your convenience. We are not responsible for the content, privacy practices, or terms of these external websites." 
        },
        { 
            title: "9. Data Protection and Privacy", 
            content: "We adhere to UK data protection laws, including the General Data Protection Regulation (GDPR). For more details on how we handle your data, refer to our Privacy Policy." 
        },
        { 
            title: "10. Changes to Terms & Conditions", 
            content: "We reserve the right to amend these Terms & Conditions at any time. Any updates will be posted on this page, and your continued use of the website constitutes acceptance of the revised terms." 
        },
        { 
            title: "11. Governing Law", 
            content: "These Terms & Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales." 
        },
        { 
            title: "12. Contact Us", 
            content: "If you have any questions or concerns about these Terms & Conditions, please contact us: \n By Email: etrolly@gmail.com" 
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
                Terms & Conditions
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
                <p>Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default TermsAndConditions;