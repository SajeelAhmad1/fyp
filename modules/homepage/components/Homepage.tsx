import React from 'react'
import Slider from './Slider'
import BannerPromotion from './BannerPromotion'
import TopSeller from './TopSeller'
import Features from './Features'
import FeaturedProducts from './FeaturedProducts'
import TopDeals from './TopDeals'
import { Categories } from './Categories'

const Homepage = () => {
    return (
        <>
            <Slider />
            <Categories/>
            <FeaturedProducts/>
            <TopDeals/>
            <BannerPromotion />
            <TopSeller />
            <Features />
        </>
    )
}

export default Homepage