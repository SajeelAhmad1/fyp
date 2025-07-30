import React, { useState } from 'react'
import { Heart, Package, Ruler, Weight, Badge, Tag, Waves } from 'lucide-react'
import foodCover1 from "@/assets/products/foodcover1.jpg";
import foodCover2 from "@/assets/products/foodcover2.jpg";
import foodCover3 from "@/assets/products/foodcover3.jpg";
import petPool from "@/assets/products/petpool3.png";
import storageBox from "@/assets/products/storagebox1.jpg";
import petTent from "@/assets/products/pettent2.png";
import Image from 'next/image';

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

    // Sample data - replace with your actual data
    const product = {
        title: "VINSANI SET OF 3 POP UP FOOD COVERS",
        originalPrice: 6.29,
        description: "Designed to cover bowls and plates to keep out pests, while leaving clear view of the food underneath",
        brand: "Vinsani",
        height: "40cm",
        weight: "0.36kg",
        width: "30cm",
        depth: "3cm",
        images: [
            foodCover1,
            foodCover2,
            foodCover3
        ]
    }

    const sideProducts = [
        {
            title: "Pet Paddling Pool Cat Dog",
            originalPrice: 17.10,
            brand: "Unbranded",
            image: petPool
        },
        {
            title: "Glass Food Storage Container Set With Air Vent Lids",
            originalPrice: 25.49,
            brand: "Unbranded",
            image: storageBox
        },
        {
            title: "Dog Bed Cooling Raised Pet Cot",
            originalPrice: 29.99,
            brand: "Unbranded",
            image: petTent
        }
    ]

    const handleProductClick = () => {
        // Handle product opening logic here
        console.log('Opening product:', product.title)
        // You can add navigation logic or modal opening here
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
                                onClick={handleProductClick}
                            >
                                {product.title}
                            </h2>

                            {/* Price Section - Only Original Price */}
                            <div className="bg-white p-4 rounded-xl shadow-inner border">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-black text-slate-800">
                                        ${product.originalPrice}
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
                        <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-gradient-to-r from-white to-slate-50">
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
                                        <span className="font-bold text-slate-800">${item.originalPrice}</span>
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