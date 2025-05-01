'use client'
import { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const Page = () => {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [unsubscribed, setUnsubscribed] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        // Get token and email from URL parameters
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');
        
        if (tokenParam && emailParam) {
            setToken(tokenParam);
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleUnsubscribeRequest = () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Please enter a valid email address');
            return;
        }
        
        setConfirming(true);
    };

    const confirmUnsubscribe = async () => {
        try {
            setLoading(true);
            
            // Call the unsubscribe API with both email and token
            const response = await fetch('/api/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email,
                    token // Include token for verification
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to unsubscribe');
            }
            
            setUnsubscribed(true);
        } catch (err) {
            setError(err.message || 'Failed to unsubscribe. Please try again.');
        } finally {
            setLoading(false);
            setConfirming(false);
        }
    };

    const cancelUnsubscribe = () => {
        setConfirming(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Unsubscribe from Newsletter</h1>
                    <p className="text-gray-600 mt-2">
                        {unsubscribed ? 
                            "You've been successfully unsubscribed." : 
                            "We're sorry to see you go. Please confirm your email below."}
                    </p>
                </div>

                {!unsubscribed ? (
                    <>
                        {!confirming ? (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {error && (
                                        <div className="flex items-center mt-2 text-red-600 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleUnsubscribeRequest}
                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Unsubscribe
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                Are you sure you want to unsubscribe <strong>{email}</strong> from our newsletter?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={confirmUnsubscribe}
                                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        Yes, Unsubscribe
                                    </button>
                                    <button
                                        onClick={cancelUnsubscribe}
                                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Successfully Unsubscribed</h2>
                        <p className="text-gray-600 mb-6">
                            You will no longer receive our newsletter communications.
                        </p>
                        <p className="text-sm text-gray-500">
                            <a href="/" className="text-blue-600 hover:underline">Continue Shopping</a>
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
            </div>
        </div>
    );
};

export default Page;