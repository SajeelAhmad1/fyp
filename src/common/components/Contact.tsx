import React from 'react';

const ContactUs = () => {
    const sections = [
        { 
            title: "Contact Us", 
            content: "We're here to help! If you have any questions, concerns, or feedback, please reach out to us through one of the following methods:"
        },
        { 
            title: "Customer Support", 
            items: [
                "Email: support@yourstorename.co.uk",
                "Phone: +44 (0)1234 567890",
                "Mailing Address",
                "[Your Store Name]",
                "123 High Street",
                "London, UK",
                "AB1 2CD"
            ]
        },
        { 
            title: "Website", 
            items: [
                "sarahhenson.co.uk",
                "Drip",
                "logica-digital.co.uk"
            ]
        },
        { 
            title: "Business Hours", 
            items: [
                "Monday to Friday: 9:00 AM – 5:00 PM (GMT)",
                "Saturday: 10:00 AM – 4:00 PM (GMT)",
                "Sunday: Closed"
            ],
            note: "We aim to respond to all inquiries within 24 hours."
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
                Contact Us
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
                        
                        {section.items && (
                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                {section.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="mb-1">{item}</li>
                                ))}
                            </ul>
                        )}

                        {section.note && (
                            <p className="text-gray-700 italic">{section.note}</p>
                        )}
                    </div>
                </div>
            ))}

            <div className="mt-8 text-center text-gray-600 text-sm">
                <p>Last Updated: May 10, 2025</p>
            </div>
        </div>
    )
}

export default ContactUs;