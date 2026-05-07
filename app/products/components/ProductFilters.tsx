'use client';

import { useEffect, useState } from 'react';
import type { CollectionDTO } from '@/types/product';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  search: string;
  collectionId: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  inStock: boolean | null;
}

export default function ProductFilters({ onFilterChange, initialFilters }: ProductFiltersProps) {
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        const data = await response.json();
        if (data.success) {
          setCollections(data.collections);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };
    fetchCollections();
  }, []);

  const handleChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      collectionId: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      inStock: null,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
      {/* Mobile Toggle */}
      <div className="lg:hidden p-4 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="font-bold text-gray-900">Filters</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-purple-600 font-semibold flex items-center gap-1"
        >
          {isOpen ? 'Close' : 'Show Filters'}
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-6 space-y-8`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Search</label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-700"
            />
            <svg
              className="absolute left-3 top-3 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Category</label>
          <div className="space-y-2">
            <button
              onClick={() => handleChange('collectionId', '')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                filters.collectionId === ''
                  ? 'bg-purple-600 text-white font-semibold shadow-md'
                  : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              All Categories
            </button>
            {collections.map((coll) => (
              <button
                key={coll.id}
                onClick={() => handleChange('collectionId', coll.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  filters.collectionId === coll.id
                    ? 'bg-purple-600 text-white font-semibold shadow-md'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                {coll.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Price Range (PKR)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-700"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-700"
            />
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] text-gray-700"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")' }}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            id="inStockOnly"
            checked={filters.inStock === true}
            onChange={(e) => handleChange('inStock', e.target.checked ? true : null)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="inStockOnly" className="text-sm font-semibold text-gray-700 cursor-pointer">
            In Stock Only
          </label>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl border-2 border-purple-100 text-purple-600 font-bold hover:bg-purple-50 hover:border-purple-200 transition-all active:scale-95"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
