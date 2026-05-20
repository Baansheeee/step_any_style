'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { formatPKR } from '@/lib/currency';
import type { ProductDTO, CollectionDTO, ProductVariant } from '@/types/product';

interface ProductFormState {
  slug: string;
  name: string;
  collectionId: string;
  price: string;
  originalPrice: string;
  shortDescription: string;
  description: string;
  image: string;
  images: string;
  videoUrl: string;
  advantages: string;
  features: string;
  specifications: string;
  variants: ProductVariant[];
  inStock: boolean;
  discount: string;
}

interface VariantInput {
  color: string;
  size: string;
  stock: string;
}

const defaultFormState: ProductFormState = {
  slug: '',
  name: '',
  collectionId: '',
  price: '',
  originalPrice: '',
  shortDescription: '',
  description: '',
  image: '',
  images: '',
  videoUrl: '',
  advantages: '',
  features: '',
  specifications: '',
  variants: [],
  inStock: true,
  discount: '0',
};

const specsToString = (value?: Record<string, any> | null) => 
  value ? Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n') : '';

const specsToObject = (value: string) => {
  const obj: Record<string, string> = {};
  value.split('\n').forEach(line => {
    const [key, ...valParts] = line.split(':');
    if (key && valParts.length > 0) {
      obj[key.trim()] = valParts.join(':').trim();
    }
  });
  return obj;
};

const csvFromArray = (value?: string[] | null) => (value && value.length ? value.join(', ') : '');

const csvToArray = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

interface AdminProductsPanelProps {
  onProductsCountChange?: (count: number) => void;
}

export default function AdminProductsPanel({ onProductsCountChange }: AdminProductsPanelProps) {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formValues, setFormValues] = useState<ProductFormState>(defaultFormState);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [variantInput, setVariantInput] = useState<VariantInput>({ color: '', size: '', stock: '' });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load products.');
      }
      const list: ProductDTO[] = payload.data ?? [];
      setProducts(list);
      onProductsCountChange?.(payload.count ?? list.length ?? 0);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load products.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      const payload = await response.json();
      if (response.ok) {
        setCollections(payload.collections || []);
      }
    } catch (error) {
      console.error('Failed to fetch collections', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setFormValues(defaultFormState);
    setIsModalOpen(true);
    setStatus({ type: 'idle', message: '' });
  };

  const openEditModal = (product: ProductDTO) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setFormValues({
      slug: product.slug,
      name: product.name,
      collectionId: product.collectionId ?? '',
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      shortDescription: product.shortDescription,
      description: product.description,
      image: product.image ?? '',
      images: csvFromArray(product.images),
      videoUrl: product.videoUrl ?? '',
      advantages: csvFromArray(product.advantages),
      features: csvFromArray(product.features),
      specifications: specsToString(product.specifications),
      variants: product.variants || [],
      inStock: product.inStock,
      discount: String(product.discount || 0),
    });
    setIsModalOpen(true);
    setStatus({ type: 'idle', message: '' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormValues(defaultFormState);
    setSelectedProduct(null);
    setVariantInput({ color: '', size: '', stock: '' });
    setStatus({ type: 'idle', message: '' });
  };

  const handleAddVariant = () => {
    if (!variantInput.color.trim() || !variantInput.size.trim() || !variantInput.stock.trim()) {
      setStatus({ type: 'error', message: 'Please fill all variant fields' });
      return;
    }

    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      color: variantInput.color.trim(),
      size: variantInput.size.trim(),
      stock: parseInt(variantInput.stock),
    };

    setFormValues((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
    setVariantInput({ color: '', size: '', stock: '' });
    setStatus({ type: 'success', message: 'Variant added successfully' });
  };

  const handleRemoveVariant = (variantId: string) => {
    setFormValues((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== variantId),
    }));
  };

  const handleInputChange = (key: keyof ProductFormState, value: string | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const payload = {
        slug: formValues.slug,
        name: formValues.name,
        collectionId: formValues.collectionId || null,
        description: formValues.description,
        shortDescription: formValues.shortDescription,
        price: Number(formValues.price),
        originalPrice: formValues.originalPrice ? Number(formValues.originalPrice) : null,
        image: formValues.image || null,
        images: csvToArray(formValues.images),
        videoUrl: formValues.videoUrl || null,
        advantages: csvToArray(formValues.advantages),
        features: csvToArray(formValues.features),
        specifications: specsToObject(formValues.specifications),
        variants: formValues.variants,
        inStock: formValues.inStock,
        discount: Number(formValues.discount) || 0,
      };

      const endpoint =
        modalMode === 'edit' && selectedProduct
          ? `/api/products/${selectedProduct.slug}`
          : '/api/products';

      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product.');
      }

      setStatus({ type: 'success', message: 'Product saved successfully.' });
      closeModal();
      fetchProducts();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save product.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setIsDeletingId(slug);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`/api/products/${slug}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product.');
      }

      setStatus({ type: 'success', message: 'Product deleted successfully.' });
      fetchProducts();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete product.',
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
          <p className="text-sm text-gray-500">
            Add new products or update existing details. Changes appear instantly on the storefront.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
        >
          + Add Product
        </button>
      </div>

      {status.type !== 'idle' && (
        <div
          className={`rounded-lg p-4 text-sm ${
            status.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {status.message}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          No products found. Add your first product to get started.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm flex gap-4 bg-white hover:shadow-md transition-shadow">
              <div className="w-28 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative">
                <Image src={product.image || '/logo_main.png'} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase tracking-widest font-bold text-purple-500">
                      {product.collection?.name || 'No Collection'}
                    </p>
                    {product.collection?.targetGender && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                        product.collection.targetGender === 'MEN' ? 'bg-blue-50 text-blue-600' :
                        product.collection.targetGender === 'WOMEN' ? 'bg-pink-50 text-pink-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {product.collection.targetGender}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-tighter font-bold px-2 py-0.5 rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.shortDescription}</p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <p className="text-xl font-bold text-purple-600">
                      {formatPKR(product.discount && product.discount > 0 
                        ? Math.round(product.price * (1 - product.discount / 100)) 
                        : product.price)}
                    </p>
                    {product.discount ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-tight bg-red-50 px-1.5 py-0.5 rounded">
                          {product.discount}% OFF
                        </span>
                        <span className="text-[11px] font-bold text-gray-400 line-through">
                          {formatPKR(product.price)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      onClick={() => openEditModal(product)}
                      title="Edit Product"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                      onClick={() => handleDelete(product.slug)}
                      disabled={isDeletingId === product.slug}
                      title="Remove Product"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 scrollbar-hide">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Add New Product' : 'Edit Product Details'}
              </h3>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Slug *</label>
                  <input
                    type="text"
                    required={modalMode === 'create'}
                    value={formValues.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="e.g. bridal-heels-01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all lowercase placeholder:text-slate-500 hover:border-slate-400"
                    disabled={modalMode === 'edit'}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Permanent unique identifier</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Collection *</label>
                  <select
                    value={formValues.collectionId}
                    onChange={(e) => handleInputChange('collectionId', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all appearance-none bg-no-repeat bg-right pr-10 hover:border-slate-400"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.5em' }}
                  >
                    <option value="">No Collection</option>
                    {collections.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name *</label>
                <input
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400"
                  placeholder="e.g. Luxury Velvet Bridal Heels"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (PKR) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={formValues.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formValues.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Percentage (%)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formValues.discount}
                      onChange={(e) => handleInputChange('discount', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400"
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>
                {Number(formValues.discount) > 0 && Number(formValues.price) > 0 && (
                  <div className="md:col-span-2 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Updated Amount (Final Price)</p>
                      <p className="text-2xl font-black text-gray-900">
                        {formatPKR(Math.round(Number(formValues.price) * (1 - Number(formValues.discount) / 100)))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">You Save</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPKR(Math.round(Number(formValues.price) * (Number(formValues.discount) / 100)))}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image URL</label>
                  <input
                    type="text"
                    value={formValues.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400"
                    placeholder="/products/heels.jpg"
                  />
                </div>
                <div className="flex items-center gap-3 md:mt-8 bg-purple-50/50 p-2.5 rounded-xl border border-purple-200">
                  <input
                    type="checkbox"
                    id="inStockCheck"
                    checked={formValues.inStock}
                    onChange={(e) => handleInputChange('inStock', e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded-lg focus:ring-purple-500"
                  />
                  <label htmlFor="inStockCheck" className="text-sm font-bold text-gray-700 cursor-pointer uppercase tracking-tight">Available for Purchase</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline / Short Description *</label>
                <textarea
                  required
                  value={formValues.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400 resize-none"
                  rows={2}
                  placeholder="Summarize the footwear in one or two sentences (e.g. Elegant ivory heels with pearl embellishments)..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Product Story *</label>
                <textarea
                  required
                  value={formValues.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400 resize-none"
                  rows={5}
                  placeholder="Detail material, heel height, occasion suitability, and comfort features..."
                />
              </div>

              <div className="space-y-4 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-200">
                <h4 className="text-xs uppercase font-black text-blue-600 tracking-widest">Color & Size Variants</h4>
                
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Color</label>
                    <input
                      type="text"
                      value={variantInput.color}
                      onChange={(e) => setVariantInput({ ...variantInput, color: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-all placeholder:text-blue-300 hover:border-blue-300"
                      placeholder="e.g. Red, Blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Size</label>
                    <input
                      type="text"
                      value={variantInput.size}
                      onChange={(e) => setVariantInput({ ...variantInput, size: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-all placeholder:text-blue-300 hover:border-blue-300"
                      placeholder="e.g. M, L, XL"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={variantInput.stock}
                      onChange={(e) => setVariantInput({ ...variantInput, stock: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-all placeholder:text-blue-300 hover:border-blue-300"
                      placeholder="Quantity"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full px-4 py-2 text-sm font-semibold text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  + Add Variant
                </button>

                {formValues.variants.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-[10px] font-black text-blue-600 uppercase mb-2">Added Variants ({formValues.variants.length})</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {formValues.variants.map((variant) => (
                        <div key={variant.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                          <div className="flex gap-4 flex-1">
                            <span className="text-sm font-medium text-gray-700"><span className="font-black text-blue-600">Color:</span> {variant.color}</span>
                            <span className="text-sm font-medium text-gray-700"><span className="font-black text-blue-600">Size:</span> {variant.size}</span>
                            <span className="text-sm font-medium text-gray-700"><span className="font-black text-blue-600">Stock:</span> {variant.stock}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="ml-2 px-2 py-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
                <h4 className="text-xs uppercase font-black text-purple-400 tracking-widest">Additional Assets & Metadata</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-purple-600 uppercase mb-1">Gallery Images (Comma separated)</label>
                    <textarea
                      value={formValues.images}
                      onChange={(e) => handleInputChange('images', e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none transition-all placeholder:text-purple-300 hover:border-purple-300 resize-none"
                      rows={2}
                      placeholder="url1.jpg, url2.jpg, url3.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-purple-600 uppercase mb-1">Product Video URL (MP4/YouTube/etc.)</label>
                    <textarea
                      value={formValues.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none transition-all placeholder:text-purple-300 hover:border-purple-300 resize-none"
                      rows={2}
                      placeholder="e.g. /videos/product.mp4"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-purple-600 uppercase mb-1">Selling Points (Comma separated)</label>
                    <textarea
                      value={formValues.features}
                      onChange={(e) => handleInputChange('features', e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none transition-all placeholder:text-purple-300 hover:border-purple-300 resize-none"
                      rows={2}
                      placeholder="Feature 1, Feature 2, Feature 3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-purple-600 uppercase mb-1">Key Advantages (Comma separated)</label>
                  <textarea
                    value={formValues.advantages}
                    onChange={(e) => handleInputChange('advantages', e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none transition-all placeholder:text-purple-300 hover:border-purple-300 resize-none"
                    rows={2}
                    placeholder="Advantage 1, Advantage 2, Advantage 3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-purple-600 uppercase mb-1">Detailed Specifications (Key: Value per line)</label>
                  <textarea
                    value={formValues.specifications}
                    onChange={(e) => handleInputChange('specifications', e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none transition-all placeholder:text-purple-300 hover:border-purple-300 resize-none"
                    rows={3}
                    placeholder="Material: Leather&#10;Heel: 3 inch&#10;Sole: Rubber"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Syncing...' : modalMode === 'create' ? 'Deploy Product' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
