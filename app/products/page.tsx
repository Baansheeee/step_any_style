'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import ProductCard from './components/ProductCard';
import ProductFilters, { FilterState } from './components/ProductFilters';
import type { ProductDTO } from '@/types/product';
import ScrollAnimate from '@/app/components/ScrollAnimate';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    collectionId: searchParams.get('collectionId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    inStock: searchParams.get('inStock') === 'true' ? true : null,
  });

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      collectionId: searchParams.get('collectionId') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest',
      inStock: searchParams.get('inStock') === 'true' ? true : null,
    });
  }, [searchParams]);

  const fetchProducts = async (currentFilters: FilterState) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.collectionId) params.append('collectionId', currentFilters.collectionId);
      if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.sort) params.append('sort', currentFilters.sort);
      if (currentFilters.inStock !== null) params.append('inStock', currentFilters.inStock.toString());

      // Update URL without reloading
      const newUrl = `/products?${params.toString()}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(filters);
    }, 300); // Debounce search/filters
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <ScrollAnimate animation="fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Explore Our Collection
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              From elegant bridal heels to comfortable everyday slippers, find the perfect pair for every step of your journey.
            </p>
          </ScrollAnimate>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <ProductFilters 
              initialFilters={filters} 
              onFilterChange={(newFilters) => setFilters(newFilters)} 
            />
          </aside>

          {/* Product Grid */}
          <section className="lg:col-span-3">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-96 animate-pulse shadow-sm"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <ScrollAnimate key={product.id} animation="fade-in" delay={`${(index % 3) * 0.1}s`}>
                    <ProductCard product={product} index={index} />
                  </ScrollAnimate>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-purple-100">
                <div className="text-6xl mb-4">👟</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  We couldn't find any products matching your current filters. Try adjusting your search or category selection.
                </p>
                <button
                  onClick={() => setFilters({
                    search: '',
                    collectionId: '',
                    minPrice: '',
                    maxPrice: '',
                    sort: 'newest',
                    inStock: null,
                  })}
                  className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-all shadow-lg"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2026 Step & Style. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
