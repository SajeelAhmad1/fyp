import React from 'react';

const AboutUs = () => {
    const sections = [
        { 
            title: "Who We Are", 
            content: "Welcome to 2 Guys, your trusted destination for [briefly describe your product range, e.g., 'premium home essentials' or 'the latest in fashion trends']. Founded in [Year] in [City, UK], our mission is to provide high-quality products that enhance your daily life. We believe in exceptional customer service, affordability, and a seamless shopping experience."
        },
        { 
            title: "Our Journey", 
            content: "What began as a small venture has grown into a thriving online store, thanks to our loyal customers. We continuously strive to expand our product offerings and improve our services to meet your needs."
        },
        { 
            title: "Our Commitment", 
            subsections: [
                {
                    subtitle: "Quality Products",
                    content: "We source our products from reputable suppliers to ensure durability and satisfaction."
                },
                {
                    subtitle: "Customer Satisfaction",
                    content: "Your happiness is our priority. We offer easy returns and responsive support."
                },
                {
                    subtitle: "Secure Shopping",
                    content: "Our website uses advanced security measures to protect your personal information."
                }
            ]
        },
        { 
            title: "Join Our Community", 
            content: "Stay connected with us on social media and subscribe to our newsletter for the latest updates and exclusive offers."
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
                About Us
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
                <p>Last Updated: May 10, 2025</p>
            </div>
        </div>
    )
}

export default AboutUs;