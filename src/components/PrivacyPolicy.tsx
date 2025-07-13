import React from 'react';

interface Subsection {
    subtitle?: string;
    content: string;
}

interface Section {
    title: string;
    content?: string;
    subsections?: Subsection[];
}

const PrivacyPolicy = () => {
    const sections: Section[] = [
        { 
            title: "1. About Us", 
            content: "[Store Name] is a registered company in [Country], dedicated to providing quality products and excellent customer service. Our address is: [Company Name], [Street Address], [City], [Postal Code], [Country]. As the data controller, we determine how and why your personal data is processed."        },
        { 
            title: "2. What Information We Collect and Why", 
            content: "We may collect the following types of personal information:",
            subsections: [
                {
                    subtitle: "Types of Information",
                    content: "- Identity Information: Name, email address, and contact numbers.\n- Transaction Information: Details of purchases made on our website.\n- Technical Information: IP address, login data, and browser type.\n- Marketing Preferences: Your preferences for receiving marketing communications."
                },
                {
                    subtitle: "Purpose",
                    content: "We collect this information to provide you with services, improve our offerings, and fulfill legal obligations."
                }
            ]
        },
        { 
            title: "3. When We Collect Information", 
            content: "We collect your information:",
            subsections: [
                {
                    content: "- When you create an account or place an order on our website.\n- When you subscribe to our newsletter.\n- When you contact us with queries or feedback.\n- When you participate in surveys, competitions, or promotions.\n- Through cookies when you browse our website."
                }
            ]
        },
        { 
            title: "4. How We Use Your Information", 
            content: "We use your information for the following purposes:",
            subsections: [
                {
                    content: "Purpose/Activity | Type of Data | Legal Basis\n--------------------------------------------------|---------------------|---------------------\nTo register you as a new customer | Identity, Contact | Performance of a contract, consent\nTo process your orders and manage payments | Identity, Contact, Transaction | Performance of a contract\nTo respond to your queries and provide support | Identity, Contact | Legitimate interest (customer support)\nTo send you marketing communications | Marketing Preferences | Consent, legitimate interest\nTo improve our website and customer experience | Technical, Usage | Legitimate interest"
                }
            ]
        },
        { 
            title: "5. Sharing and Access to Your Information", 
            content: "We limit access to your information to those who need it for their role. This may include:",
            subsections: [
                {
                    content: "- Business partners who provide services on our behalf, such as payment processing and order delivery.\n- Official bodies, when legally required to share information.\n- Marketing companies that assist with surveys and promotional campaigns."
                }
            ]
        },
        { 
            title: "6. Communications and Marketing", 
            content: "With your consent, we may send you updates about new products, promotions, and special offers. You can opt out of these communications at any time by:",
            subsections: [
                {
                    content: "- Clicking the \"unsubscribe\" link in any email we send you.\n- Updating your preferences in your account settings.\n- Contacting us directly."
                }
            ]
        },
        { 
            title: "7. Data Retention", 
            content: "We retain your data only as long as necessary for the purposes described in this policy or as required by law. When we no longer need your data, we securely delete or archive it."
        },
        { 
            title: "8. Your Rights", 
            content: "You have the following rights regarding your personal information:",
            subsections: [
                {
                    content: "- Right to access, update, or delete your information.\n- Right to object to or restrict certain types of processing.\n- Right to withdraw consent for marketing communications.\n- Right to data portability.\n- Right to file a complaint with the relevant data protection authority.\n\nTo exercise any of these rights, please contact us."
                }
            ]
        },
        { 
            title: "9. Third-Party Links", 
            content: "Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read their privacy policies when visiting their sites."
        },
        { 
            title: "10. Security and International Transfers", 
            content: "We take reasonable steps to protect your personal data from loss, misuse, and unauthorized access. If we transfer your data outside your home country, we ensure that appropriate safeguards are in place to protect your information."
        },
        { 
            title: "11. Cookies", 
            content: "Cookies are small text files stored on your device to enhance your browsing experience. We use cookies to:",
            subsections: [
                {
                    content: "- Ensure the website functions correctly.\n- Remember your preferences.\n- Analyze website usage to improve our services.\n- Deliver relevant marketing."
                }
            ]
        },
        { 
            title: "12. Managing Cookies", 
            content: "You can manage cookies through your browser settings. Disabling cookies may affect your ability to use some features of our website."
        },
        { 
            title: "13. Changes to Our Policy", 
            content: "We may update this policy from time to time. Any changes will be posted on this page, and, where appropriate, notified to you by email."
        },
        { 
            title: "14. Contact Us", 
            content: "If you have any questions or concerns about this policy or your personal data, please contact us:",
            subsections: [
                {
                    subtitle: "Contact Methods",
                    content: "By Email: [email@example.com]\nBy Post: [Store Name], [Street Address], [City], [Postal Code], [Country].\n\nYou also have the right to contact your local data protection authority if you have concerns about our handling of your personal data."
                }
            ]
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-cyan-800 mb-8 text-center">
                Privacy & Cookies Policy
            </h1>

            {sections.map((section, index) => (
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
                                <p className="text-gray-700 whitespace-pre-line">
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

export default PrivacyPolicy;