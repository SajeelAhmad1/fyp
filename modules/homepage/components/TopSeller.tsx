import Button from '@/common/components/elements/Button'
import { Card } from '@/common/components/elements/Card'
import DotSlide from '@/common/components/elements/DotSlide'
import Star from '@/common/components/elements/Star'
import React from 'react'

const TopSeller = () => {
    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-center items-center gap-5 mb-5">
                <Card className="w-full lg:w-[830px] h-auto lg:h-[500px] p-4 lg:p-0 justify-center items-center gap-5 lg:gap-10 flex flex-col lg:flex-row relative border border-zinc-200">
                    <img className="p-3 rounded-2xl max-w-full h-auto" src="/assets/img/jbl-bar.png" alt="JBL Bar" />
                    <div className="justify-center items-center flex absolute bottom-4 lg:bottom-10">
                        <DotSlide count={1} />
                    </div>
                    <div className="flex-col justify-center items-center lg:items-start gap-6 lg:gap-9 inline-flex">
                        <div className="flex-col justify-center items-center lg:items-start gap-3 lg:gap-4 flex">
                            <div className="text-sky-900 text-xl font-semibold text-center lg:text-left">JBL bar 2.1 deep bass</div>
                            <div className="text-neutral-600 text-lg font-semibold">£11,70</div>
                            <Star count={5} />
                        </div>
                        <div className="justify-center items-center gap-2 lg:gap-3 flex flex-wrap">
                            <button className="w-16 h-16 lg:w-20 lg:h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                                <div className="text-amber-500 text-xl lg:text-2xl font-bold">57</div>
                            </button>
                            <button className="w-16 h-16 lg:w-20 lg:h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                                <div className="text-amber-500 text-xl lg:text-2xl font-bold">11</div>
                            </button>
                            <button className="w-16 h-16 lg:w-20 lg:h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                                <div className="text-amber-500 text-xl lg:text-2xl font-bold">33</div>
                            </button>
                            <button className="w-16 h-16 lg:w-20 lg:h-20 bg-sky-100 rounded-full justify-center items-center hover:bg-sky-200">
                                <div className="text-amber-500 text-xl lg:text-2xl font-bold">59</div>
                            </button>
                        </div>
                        <div className="justify-center items-center gap-3 lg:gap-5 inline-flex flex-wrap">
                            <Button className="w-full sm:w-56 h-12 lg:h-14 pl-4 lg:pl-6 justify-between flex items-center bg-blue-300 hover:bg-blue-400 text-slate-800 text-sm lg:text-base font-semibold">
                                Add to cart
                                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-amber-500 rounded-full justify-center items-center flex mr-3 lg:mr-4">
                                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.89203 1.9411H3.1399C3.91443 1.9411 4.52402 2.60806 4.45947 3.37543L3.86423 10.5184C3.76382 11.6873 4.68896 12.6914 5.86511 12.6914H13.5029C14.5356 12.6914 15.4392 11.8451 15.5181 10.8196L15.9054 5.44086C15.9914 4.25037 15.0878 3.28219 13.8902 3.28219H4.6316" stroke="white" strokeWidth="1.47531" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.1116 16.2844C12.6067 16.2844 13.0081 15.883 13.0081 15.3879C13.0081 14.8928 12.6067 14.4915 12.1116 14.4915C11.6165 14.4915 11.2151 14.8928 11.2151 15.3879C11.2151 15.883 11.6165 16.2844 12.1116 16.2844Z" stroke="white" strokeWidth="1.47531" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.37436 16.2844C6.86946 16.2844 7.27081 15.883 7.27081 15.3879C7.27081 14.8928 6.86946 14.4915 6.37436 14.4915C5.87926 14.4915 5.47791 14.8928 5.47791 15.3879C5.47791 15.883 5.87926 16.2844 6.37436 16.2844Z" stroke="white" strokeWidth="1.47531" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.91217 6.24408H15.5181" stroke="white" strokeWidth="1.47531" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Button>
                            <Button className="w-12 sm:w-16 h-12 lg:h-14 bg-blue-300 justify-center flex items-center hover:bg-blue-400">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.5289 12.1127C15.5289 14.0601 13.9553 15.6338 12.0079 15.6338C10.0605 15.6338 8.48682 14.0601 8.48682 12.1127C8.48682 10.1653 10.0605 8.59167 12.0079 8.59167C13.9553 8.59167 15.5289 10.1653 15.5289 12.1127Z" stroke="#292D32" strokeWidth="1.47531" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12.008 20.2465C15.4799 20.2465 18.7157 18.2008 20.968 14.66C21.8532 13.2733 21.8532 10.9423 20.968 9.55549C18.7157 6.01475 15.4799 3.96899 12.008 3.96899C8.53612 3.96899 5.30028 6.01475 3.04798 9.55549C2.1628 10.9423 2.1628 13.2733 3.04798 14.66C5.30028 18.2008 8.53612 20.2465 12.008 20.2465Z" stroke="#292D32" strokeWidth="1.47531" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </Card>
                <div className="flex flex-col w-full lg:w-auto">
                    <div className="w-full lg:w-[500px] h-auto sm:h-60 rounded-2xl border border-zinc-200 flex-col justify-center items-center gap-4 inline-flex mb-5 cursor-pointer hover:bg-slate-100 p-4">
                        <div className="flex flex-col sm:flex-row justify-start items-center gap-4 sm:gap-6 lg:gap-12">
                            <img className="w-full sm:w-60 lg:w-72 h-auto sm:h-36 lg:h-44 p-2 relative rounded-2xl" src="https://source.unsplash.com/288x176?gaming" alt="Gaming" />
                            <div className="flex-col justify-center items-center sm:items-start gap-2 sm:gap-4 inline-flex mt-3 sm:mt-0">
                                <div className="text-sky-900 text-lg font-medium text-center sm:text-left">Play game</div>
                                <div className="text-neutral-600 text-lg font-semibold">£11,70</div>
                                <Star count={5} />
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[500px] h-auto sm:h-60 rounded-2xl border border-zinc-200 flex-col justify-center items-center gap-4 inline-flex cursor-pointer hover:bg-slate-100 p-4">
                        <div className="flex flex-col sm:flex-row justify-start items-center gap-4 sm:gap-6 lg:gap-12">
                            <img className="w-full sm:w-60 lg:w-72 h-auto sm:h-36 lg:h-44 p-2 relative rounded-2xl" src="https://source.unsplash.com/288x176?laptop" alt="Laptop" />
                            <div className="flex-col justify-center items-center sm:items-start gap-2 sm:gap-4 inline-flex mt-3 sm:mt-0">
                                <div className="text-sky-900 text-lg font-medium text-center sm:text-left">Play game</div>
                                <div className="text-neutral-600 text-lg font-semibold">£11,70</div>
                                <Star count={5} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopSeller