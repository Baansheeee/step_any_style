'use client';

import { useState, useEffect } from 'react';
import { formatPKR } from '@/lib/currency';

interface Collection {
  id: string;
  name: string;
}

interface SaleEvent {
  id: string;
  name: string;
  bannerText: string;
  discountPercent: number;
  targetCollections: string[];
  targetProducts: string[];
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

export default function AdminSalePanel() {
  const [sales, setSales] = useState<SaleEvent[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const [form, setForm] = useState({
    name: '',
    bannerText: '',
    discountPercent: 0,
    targetCollections: [] as string[],
    targetProducts: [] as string[],
    isActive: false,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [salesRes, collsRes, productsRes] = await Promise.all([
        fetch('/api/admin/sales'),
        fetch('/api/collections'),
        fetch('/api/products')
      ]);
      const salesData = await salesRes.json();
      const collsData = await collsRes.json();
      const productsData = await productsRes.json();
      
      if (salesRes.ok) setSales(salesData.sales || []);
      if (collsRes.ok) setCollections(collsData.collections || []);
      if (productsRes.ok) setProducts(productsData.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCollectionToggle = (id: string) => {
    setForm(prev => ({
      ...prev,
      targetCollections: prev.targetCollections.includes(id)
        ? prev.targetCollections.filter(c => c !== id)
        : [...prev.targetCollections, id]
    }));
  };

  const handleProductToggle = (id: string) => {
    setForm(prev => ({
      ...prev,
      targetProducts: prev.targetProducts.includes(id)
        ? prev.targetProducts.filter(p => p !== id)
        : [...prev.targetProducts, id]
    }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Sale event created and applied!' });
        setForm({ name: '', bannerText: '', discountPercent: 0, targetCollections: [], targetProducts: [], isActive: false });
        fetchData();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create sale event');
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSale = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/sales/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSale = async (id: string) => {
    if (!confirm('Are you sure? This will also reset discounts for this sale.')) return;
    try {
      const res = await fetch(`/api/admin/sales/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Sale Event</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Event Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Summer Sale"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Announce Banner Text</label>
              <input
                type="text"
                required
                value={form.bannerText}
                onChange={(e) => setForm({ ...form, bannerText: e.target.value })}
                placeholder="e.g. FLASH SALE: 50% OFF"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Discount %</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Category Selection */}
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Target Categories</label>
              <div className="flex flex-wrap gap-2">
                {collections.map((coll) => (
                  <button
                    key={coll.id}
                    type="button"
                    onClick={() => handleCollectionToggle(coll.id)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      form.targetCollections.includes(coll.id)
                        ? 'bg-[#6B21A8] border-[#6B21A8] text-white shadow-lg'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200 hover:text-purple-600'
                    }`}
                  >
                    {coll.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Target Individual Products</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all pr-10"
                />
                <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Selected Products Preview */}
              {form.targetProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  {form.targetProducts.map(id => {
                    const p = products.find(prod => prod.id === id);
                    return (
                      <div key={id} className="bg-white px-2 py-1 rounded-md text-[10px] font-bold text-purple-700 border border-purple-200 flex items-center gap-1">
                        {p?.name || id}
                        <button type="button" onClick={() => handleProductToggle(id)} className="text-red-400 hover:text-red-600">×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Product Search Results */}
              {productSearch && (
                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-inner divide-y divide-gray-50">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProductToggle(p.id)}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between group ${
                        form.targetProducts.includes(p.id) ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                      {form.targetProducts.includes(p.id) ? (
                         <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                      ) : (
                         <span className="opacity-0 group-hover:opacity-100 text-purple-600 font-bold">+</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Activate & Apply Discounts Immediately</label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Create & Apply Sale Event'}
          </button>
        </form>

        {status.message && (
          <div className={`mt-4 p-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.message}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Existing Events</h3>
        {isLoading ? (
          <p className="text-gray-500 text-sm italic">Loading events...</p>
        ) : sales.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No sale events created yet.</p>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div>
                  <h4 className="font-bold text-gray-900">{sale.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{sale.bannerText}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleSale(sale.id, sale.isActive)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      sale.isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {sale.isActive ? 'Active' : 'Draft'}
                  </button>
                  <button
                    onClick={() => deleteSale(sale.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
