import React, { useState } from 'react'
import { Heart, Package, Ruler, Weight, Badge, Tag, Waves } from 'lucide-react'
import earPlugs1 from "@/assets/products/ear-plugs.jpeg";
import earPlugs2 from "@/assets/products/ear-plugs-1.jpeg";
import earPlugs3 from "@/assets/products/ear-plugs-2.jpeg";
import foodChopper from "@/assets/products/food-chopper.jpg";
import uno from "@/assets/products/uno.jpeg";
import medkit from "@/assets/products/med-kit.jpeg";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Button = ({ children, className, onClick, ...props }:any) => {
    return (
        <button 
            className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}

const Card = ({ children, className, ...props }:any) => {
    return (
        <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
            {children}
        </div>
    )
}

const TopSeller = () => {
    const [selectedImage, setSelectedImage] = useState(0)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const router = useRouter();

    // Sample data - replace with your actual data
    const product = {
        id: "23d84712-c800-4238-bea6-b5c24219dfd3",
        title: "Ear Plugs for Sleep Soft Silicone",
        originalPrice: 4.62,
        description: "Ear Plugs for Sleep Soft Silicone Reusable, Earplugs for Sleeping Noise Cancelling(4Pairs)",
        brand: "Unbranded",
        height: "-",
        weight: "-",
        width: "-",
        depth: "-",
        images: [
            earPlugs1,
            earPlugs2,
            earPlugs3
        ]
    }

    const sideProducts = [
        {
            id: "642f702b-3ca8-4e76-a730-99f974b374a6",
            title: "Manual Food Chopper",
            originalPrice: 8.4,
            brand: "Unbranded",
            image: foodChopper
        },
        {
            id: "36d530d1-7979-4746-86ab-7a23f8abaf0f",
            title: "UNO, Classic Card Game",
            originalPrice: 6.53,
            brand: "Mattel",
            image: uno
        },
        {
            id:"f981d0d3-0843-438c-8c9c-b758aae5c044",
            title: "10 Person HSE Workplace First Aid Kit",
            originalPrice: 8.99,
            brand: "Unbranded",
            image: medkit
        }
    ]

    const handleProductClick = (id: string) => {
        router.push(`/products/${id}`)
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Main Product Card */}
                <Card className="flex-1 p-4 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
                    {/* Wishlist Button */}
                    <button 
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>

                    <div className="flex flex-col lg:flex-row gap-8 items-center">
                        {/* Product Images */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="relative group">
                                <Image
                                    width={100}
                                    height={100} 
                                    src={product.images[selectedImage]} 
                                    alt={product.title}
                                    className="w-full max-w-md h-64 lg:h-80 object-contain rounded-2xl bg-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            
                            {/* Image Thumbnails */}
                            <div className="flex gap-2 mt-4">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                                            selectedImage === index 
                                                ? 'border-blue-500 shadow-lg scale-105' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Image
                                    width={100}
                                    height={100} src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-6">
                            {/* Brand */}
                            <div className="flex items-center gap-2">
                                <Badge className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-600 font-medium text-sm bg-blue-50 px-2 py-1 rounded-full">
                                    {product.brand}
                                </span>
                            </div>

                            {/* Title - Clickable */}
                            <h2 
                                className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight cursor-pointer hover:text-blue-600 transition-colors duration-300"
                                onClick={() => handleProductClick(product.id)}
                            >
                                {product.title}
                            </h2>

                            {/* Price Section - Only Original Price */}
                            <div className="bg-white p-4 rounded-xl shadow-inner border">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-black text-slate-800">
                                        £{product.originalPrice}
                                    </span>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
                                    <Ruler className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <div className="text-xs text-gray-500">Width</div>
                                    <div className="font-semibold text-sm">{product.width}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
                                    <Package className="w-5 h-5 text-green-500 mx-auto mb-1" />
                                    <div className="text-xs text-gray-500">Height</div>
                                    <div className="font-semibold text-sm">{product.height}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
                                    <Weight className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                    <div className="text-xs text-gray-500">Weight</div>
                                    <div className="font-semibold text-sm">{product.weight}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
                                    <Waves className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                    <div className="text-xs text-gray-500">Depth</div>
                                    <div className="font-semibold text-sm">{product.depth}</div>
                                </div>
                            </div>

                            
                        </div>
                    </div>
                </Card>

                {/* Side Products */}
                <div className="w-full xl:w-96 space-y-6">
                    {sideProducts.map((item, index) => (
                        <Card 
                        onClick={()=>handleProductClick(item.id)}
                        key={index} className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-gradient-to-r from-white to-slate-50">
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Image
                                    width={96} 
                                    height={96}
                                        src={item.image} 
                                        alt={item.title}
                                        className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                    {/* Brand */}
                                    <span className="text-blue-600 text-xs font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                                        {item.brand}
                                    </span>
                                    
                                    {/* Title */}
                                    <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    
                                    {/* Price - Only Original Price */}
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800">£{item.originalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TopSeller