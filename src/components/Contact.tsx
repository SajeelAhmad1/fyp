import React from 'react';

type ContactSubsection = {
    subtitle?: string;
    content: string;
};

type ContactSection = {
    title: string;
    content?: string;
    subsections?: ContactSubsection[];
};

const ContactPage = () => {

    const contactSections: ContactSection[] = [
        {
            title: "Get in Touch",
            content: "We'd love to hear from you! Whether you have questions about our products, need help with an order, or want to provide feedback, we're here to help."
        },
        {
            title: "Contact Information",
            subsections: [
                {
                    subtitle: "Email",
                    content: "etrolly.shop.co.uk@gmail.com\n\nWe aim to respond to all emails within 24-48 hours during business days."
                },
                {
                    subtitle: "Phone",
                    content: "+447426109939"
                },
                {
                    subtitle: "Business Hours",
                    content: "Monday - Friday: 9:00 AM - 6:00 PM (GMT)\nSaturday: 10:00 AM - 4:00 PM (GMT)\nSunday: Closed"
                },
                {
                    subtitle: "Address",
                    content: "eTrolly\n11 Murchison\nGlasgow\nUnited Kingdom\nG12 0FA"
                }
            ]
        },
        {
            title: "What We Can Help With",
            subsections: [
                {
                    content: "• Product inquiries and recommendations\n• Order status and tracking information\n• Returns and refunds\n• Technical support\n• Account management\n• General feedback and suggestions\n• Partnership and business inquiries"
                }
            ]
        },
        {
            title: "Response Times",
            content: "We're committed to providing excellent customer service:",
            subsections: [
                {
                    content: "• Email inquiries: 24-48 hours\n• Order-related questions: Within 24 hours\n• Technical support: 1-2 business days\n• Urgent matters: We'll prioritize and respond as quickly as possible"
                }
            ]
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
                Contact Us
            </h1>

            {/* Contact Information Sections */}
            {contactSections.map((section, index) => (
                <div key={index} className="mb-6 border-b border-gray-200 pb-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                        <h2 className="text-xl font-semibold text-cyan-700 mb-4">
                            {section.title}
                        </h2>

                        {section.content && (
                            <p className="text-gray-700 mb-4 whitespace-pre-line">{section.content}</p>
                        )}
                        
                        {section.subsections && section.subsections.map((subsection, subIndex) => (
                            <div key={subIndex} className="mb-4">
                                {subsection.subtitle && (
                                    <h3 className="font-medium text-cyan-600 mb-2">
                                        {subsection.subtitle}
                                    </h3>
                                )}
                                {subsection.content && (
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {subsection.content}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Contact Form */}
            <div className="mb-6">
                <div className="p-4 rounded-lg bg-gray-50">
                    <h2 className="text-xl font-semibold text-cyan-700 mb-4">
                        How to Reach Us
                    </h2>
                    
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-4">
                        <h3 className="font-medium text-cyan-700 mb-2">Email Us Directly</h3>
                        <p className="text-gray-700 mb-2">
                            For the fastest response, send us an email at:
                        </p>
                        <p className="font-medium text-lg text-cyan-700 mb-2">
                            etrolly.shop.co.uk@gmail.com
                        </p>
                        <p className="text-sm text-gray-600">
                            Please include your order number (if applicable) and describe your inquiry in detail to help us assist you better.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-medium text-cyan-600 mb-2">When contacting us, please include:</h3>
                        <div className="text-gray-700 space-y-1">
                            <p>• Your full name</p>
                            <p>• Order number (if inquiry is order-related)</p>
                            <p>• Clear description of your question or issue</p>
                            <p>• Any relevant photos or screenshots (if applicable)</p>
                        </div>
                    </div>
                </div>
            </div>

            

            <div className="mt-8 text-center text-gray-600 text-sm">
                <p>We value your feedback and are committed to providing excellent customer service.</p>
            </div>
        </div>
    );
};

export default ContactPage;