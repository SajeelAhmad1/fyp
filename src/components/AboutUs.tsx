import React from 'react';

const AboutUs = () => {
    const sections = [
        { 
            title: "About eTrolly", 
            content: "At eTrolly, we are dedicated to enhancing your everyday life by offering high-quality, innovative, and practical products. Our goal is to make shopping effortless, enjoyable, and rewarding by providing a carefully curated selection of trusted essentials."
        },
        { 
            title: "Our Values", 
            subsections: [
                {
                    subtitle: "Quality & Reliability",
                    content: "We prioritize premium products that meet rigorous standards of durability and performance."
                },
                {
                    subtitle: "Customer First",
                    content: "Your satisfaction is at the core of everything we do. From seamless shopping experiences to responsive customer support, we are committed to putting you first."
                },
                {
                    subtitle: "Trust & Transparency",
                    content: "Honest pricing, clear product information, and dependable service are the foundation of our business."
                },
                {
                    subtitle: "Fast & Efficient Delivery",
                    content: "With UK-based fulfillment, we ensure your orders arrive quickly, safely, and reliably."
                }
            ]
        },
        { 
            title: "Our Commitment", 
            content: "At eTrolly, we aim to simplify your shopping experience by offering products that bring value, convenience, and style to your life. Thank you for choosing us — we are excited to be part of your journey!"
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
                <p>Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    )
}

export default AboutUs;