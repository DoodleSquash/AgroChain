import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Browse() {
  const [activeFilter, setActiveFilter] = useState('All Crops');

  const filters = ['All Crops', 'Vegetables', 'Fruits', 'Grains', 'Organic Certified'];

  const listings = [
    { id: 'AG-2041', crop: 'Premium Tomatoes', farmer: 'Arjun Singh', location: 'Pune, MH', price: '₹45/kg', trustScore: 98, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=60' },
    { id: 'AG-2042', crop: 'Organic Potatoes', farmer: 'Shree Farms', location: 'Nashik, MH', price: '₹22/kg', trustScore: 95, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=60' },
    { id: 'AG-2043', crop: 'Alphonso Mangoes', farmer: 'Ratnagiri Orchards', location: 'Ratnagiri, MH', price: '₹800/box', trustScore: 99, img: 'https://images.unsplash.com/photo-1553279768-865429fd0072?w=800&auto=format&fit=crop&q=60' },
    { id: 'AG-2044', crop: 'Basmati Rice', farmer: 'Kisan Co-op', location: 'Karnal, HR', price: '₹110/kg', trustScore: 94, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=60' },
    { id: 'AG-2045', crop: 'Red Onions', farmer: 'Patil Brothers', location: 'Lasalgaon, MH', price: '₹35/kg', trustScore: 88, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=60' },
    { id: 'AG-2046', crop: 'Fresh Spinach', farmer: 'GreenLeaf Organics', location: 'Ooty, TN', price: '₹60/kg', trustScore: 97, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=60' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto animate-fade-in flex flex-col min-h-screen lg:min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 text-left md:flex justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3 tracking-tight">Marketplace</h1>
          <p className="text-sm sm:text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">Source high-quality produce directly from verified farmers. All transactions secured by AgroChain Escrow.</p>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 sm:mt-6 md:mt-0 relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input 
                type="text" 
                className="block w-full pl-11 pr-4 py-3 sm:py-4 bg-white border border-gray-100 md:border-none rounded-xl sm:rounded-2xl text-gray-900 font-medium placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-primary-500/20 transition-all font-body text-sm sm:text-base"
                placeholder="Search crops, locations, or farmers..."
            />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {filters.map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all active:scale-95 ${
                activeFilter === filter 
                ? 'bg-primary-900 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
        <button className="whitespace-nowrap px-4 py-2.5 rounded-full font-bold text-sm bg-white border border-gray-200 text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            More Filters
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {listings.map((item) => (
          <Link to={`/market/batch/${item.id}`} key={item.id} className="group flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
            
            {/* Image Container */}
            <div className="relative h-60 overflow-hidden bg-gray-100">
                <img src={item.img} alt={item.crop} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur text-gray-900 text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[14px] text-green-600">verified</span>
                        Verified
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-700 transition-colors">{item.crop}</h3>
                    <span className="text-xl font-extrabold text-primary-600">{item.price}</span>
                </div>
                
                <div className="space-y-2 mb-6">
                    <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
                        {item.farmer}
                    </p>
                    <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                        {item.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                         <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 rounded-full" style={{width: `${item.trustScore}%`}}></div>
                         </div>
                         <span className="text-xs font-bold text-blue-600 tracking-wider">TRUST SCORE {item.trustScore}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                    <button className="w-full py-3.5 bg-primary-50 group-hover:bg-primary-600 text-primary-700 group-hover:text-white font-bold rounded-xl transition-all duration-300 flex justify-center items-center gap-2">
                        View Details
                        <span className="material-symbols-outlined text-[18px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">arrow_forward</span>
                    </button>
                </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
