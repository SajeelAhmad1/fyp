"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const HeaderTop = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [orderCount, setOrderCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderCount = async () => {
            if (session?.user?.id) {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/orders/count?userId=${session.user.id}`);
                    const data = await response.json();
                    if (data.success) {
                        setOrderCount(data.data.count);
                    }
                } catch (error) {
                    console.error('Failed to fetch order count:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrderCount();
    }, [session]);

    return (
        <div className="bg-[#F19B12] px-4 justify-between h-12 m-auto mr-16 ml-16 hidden lg:flex md:flex">
            <div className='flex justify-center items-center w-full'>
                {session === null ? (
                    <div className="text-white font-inter font-medium text-[20px] leading-[150%] tracking-[0%]">
                        Sign up to get 20% off on your first order.
                        <span
                            onClick={() => router.push("/register")}
                            className='cursor-pointer font-inter font-medium text-[20px] leading-[150%] tracking-[0%] underline ml-1'
                        >
                            Sign Up
                        </span>
                    </div>
                ) : (
                    <div>
                        {orderCount === 0 ? (
                            <div className="text-white font-inter font-medium text-[20px] leading-[150%] tracking-[0%]">
                                Enjoy your 20% signup discount!
                            </div>
                        ) : (
                            <div className="text-white font-inter font-medium text-[20px] leading-[150%] tracking-[0%]">

                                Enjoy exclusive deals on Top Quality Products!
                                <span
                                className='cursor-pointer font-inter font-medium text-[20px] leading-[150%] tracking-[0%] underline ml-1'
                                onClick={()=>router.push("/products?type=topdeal")}
                                >
                                    Top Deals
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default HeaderTop