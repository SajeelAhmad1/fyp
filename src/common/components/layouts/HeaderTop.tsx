"use client"
import { useRouter } from 'next/navigation'

const HeaderTop = () => {
    const router = useRouter();
    return (
        <div className="bg-gray-900 px-4 justify-between h-12 m-auto hidden lg:flex md:flex">
            <div className='flex justify-center items-center w-full bg-gray-900'>
                <div className="text-white font-inter font-medium text-[20px] leading-[150%] tracking-[0%]">
                    Get exclusive deals on top quality products.
                    {/* <span 
                    onClick={()=>router.push("/register")}
                    className='cursor-pointer font-inter font-medium text-[20px] leading-[150%] tracking-[0%] underline'>
                        Sign Up
                    </span> */}
                </div>
            </div>
            
        </div>
    )
}

export default HeaderTop