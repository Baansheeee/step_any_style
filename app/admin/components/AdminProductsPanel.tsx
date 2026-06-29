'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { formatPKR } from '@/lib/currency';
import type { ProductDTO, CollectionDTO, ProductVariant } from '@/types/product';
import FileUpload from './FileUpload';
import MultiFileUpload from './MultiFileUpload';

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
  sendPromoEmail: boolean;
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
  sendPromoEmail: false,
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

  // Variant Matrix State
  const [matrixColors, setMatrixColors] = useState<{ name: string; imageUrl?: string; images?: string; videoUrl?: string }[]>([]);
  const [matrixSizes, setMatrixSizes] = useState<string>('');
  const [matrixStock, setMatrixStock] = useState<Record<string, number>>({});
  const [newColorName, setNewColorName] = useState('');

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
    setMatrixColors([]);
    setMatrixSizes('');
    setMatrixStock({});
    setNewColorName('');
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
      sendPromoEmail: false,
    });

    const uniqueColors = Array.from(new Set((product.variants || []).map(v => v.color)));
    const colorsWithImages = uniqueColors.map(c => {
      const variant = (product.variants || []).find(v => v.color === c);
      return { 
        name: c, 
        imageUrl: variant?.imageUrl,
        images: csvFromArray(variant?.images),
        videoUrl: variant?.videoUrl
      };
    });
    const uniqueSizes = Array.from(new Set((product.variants || []).map(v => v.size)));
    const stockMap: Record<string, number> = {};
    (product.variants || []).forEach(v => {
      stockMap[`${v.color}-${v.size}`] = v.stock;
    });

    setMatrixColors(colorsWithImages);
    setMatrixSizes(uniqueSizes.join(', '));
    setMatrixStock(stockMap);
    setNewColorName('');

    setIsModalOpen(true);
    setStatus({ type: 'idle', message: '' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormValues(defaultFormState);
    setSelectedProduct(null);
    setStatus({ type: 'idle', message: '' });
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
      const compiledVariants: ProductVariant[] = [];
      const sizesArray = matrixSizes.split(',').map(s => s.trim()).filter(Boolean);
      matrixColors.forEach(color => {
        sizesArray.forEach(size => {
          const existingId = selectedProduct?.variants?.find(v => v.color === color.name && v.size === size)?.id;
          compiledVariants.push({
            id: existingId || (Date.now().toString() + Math.random().toString(36).substring(2, 9)),
            color: color.name,
            size,
            stock: matrixStock[`${color.name}-${size}`] || 0,
            imageUrl: color.imageUrl,
            images: csvToArray(color.images || ''),
            videoUrl: color.videoUrl || undefined
          });
        });
      });

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
        variants: compiledVariants,
        inStock: formValues.inStock,
        discount: formValues.discount ? Number(formValues.discount) : 0,
        sendPromoEmail: formValues.sendPromoEmail,
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-2rem)] flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {modalMode === 'create' ? 'Add New Product' : 'Edit Product Details'}
              </h3>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-gray-200/60 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors text-xs"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1.5">Product Slug *</label>
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
                    <label className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1.5">Collection *</label>
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
                  <label className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1.5">Display Name *</label>
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
                    <label className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1.5">Sale Price (PKR) *</label>
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
                    <label className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1.5">Original Price (optional)</label>
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
                    <label className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1.5">Discount Percentage (%)</label>
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
                  <FileUpload
                    label="Cover Image"
                    accept="image"
                    value={formValues.image}
                    onChange={(url) => handleInputChange('image', url)}
                    placeholder="JPG, PNG, WebP — drag & drop or browse"
                  />
                  <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={formValues.inStock}
                          onChange={(e) => handleInputChange('inStock', e.target.checked)}
                          className="w-5 h-5 border-2 border-slate-300 rounded text-purple-600 focus:ring-purple-500 transition-colors"
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors">In Stock</span>
                    </label>

                    {modalMode === 'create' && (
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={formValues.sendPromoEmail}
                            onChange={(e) => handleInputChange('sendPromoEmail', e.target.checked)}
                            className="w-5 h-5 border-2 border-slate-300 rounded text-pink-600 focus:ring-pink-500 transition-colors"
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-pink-600 transition-colors">Send Promo Email</span>
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1.5">Tagline / Short Description *</label>
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
                  <label className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1.5">Complete Product Story *</label>
                  <textarea
                    required
                    value={formValues.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400 resize-none"
                    rows={5}
                    placeholder="Detail material, heel height, occasion suitability, and comfort features..."
                  />
                </div>

                <div className="space-y-6 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                  <h4 className="text-sm uppercase font-black text-blue-600 tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Color & Size Matrix
                  </h4>
                  
                  {/* Step 1: Colors */}
                  <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-4 shadow-sm">
                    <label className="block text-xs font-black text-blue-600 uppercase mb-1">Step 1: Add Colors & Images</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newColorName.trim() && !matrixColors.find(c => c.name === newColorName.trim())) {
                              setMatrixColors([...matrixColors, { name: newColorName.trim() }]);
                              setNewColorName('');
                            }
                          }
                        }}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-slate-400"
                        placeholder="e.g. Red, Black (Press Enter to add)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newColorName.trim() && !matrixColors.find(c => c.name === newColorName.trim())) {
                            setMatrixColors([...matrixColors, { name: newColorName.trim() }]);
                            setNewColorName('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                      >
                        Add Color
                      </button>
                    </div>

                    {matrixColors.length > 0 && (
                      <div className="space-y-4 mt-4">
                        {matrixColors.map((color, idx) => (
                          <div key={idx} className="flex flex-col gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 shadow-inner">
                            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                              <span className="font-black text-sm text-blue-900 uppercase tracking-widest">{color.name}</span>
                              <button
                                type="button"
                                onClick={() => setMatrixColors(matrixColors.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition"
                                title="Remove Color"
                              >
                                ✕ Remove Color
                              </button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-[10px] font-black text-blue-600 uppercase mb-2">Primary Display Image</label>
                                <FileUpload
                                  label=""
                                  accept="image"
                                  value={color.imageUrl || ''}
                                  onChange={(url) => {
                                    const updated = [...matrixColors];
                                    updated[idx].imageUrl = url;
                                    setMatrixColors(updated);
                                  }}
                                  placeholder="Main display image"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-blue-600 uppercase mb-2">Gallery Images</label>
                                <MultiFileUpload
                                  label=""
                                  value={color.images || ''}
                                  onChange={(urls) => {
                                    const updated = [...matrixColors];
                                    updated[idx].images = urls;
                                    setMatrixColors(updated);
                                  }}
                                  placeholder="Add multiple angles"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-blue-600 uppercase mb-2">Product Video</label>
                                <FileUpload
                                  label=""
                                  accept="video"
                                  value={color.videoUrl || ''}
                                  onChange={(url) => {
                                    const updated = [...matrixColors];
                                    updated[idx].videoUrl = url;
                                    setMatrixColors(updated);
                                  }}
                                  placeholder="Add MP4 video"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Sizes */}
                  <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                    <label className="block text-xs font-black text-blue-600 uppercase mb-2">Step 2: Add Sizes (Comma separated)</label>
                    <input
                      type="text"
                      value={matrixSizes}
                      onChange={(e) => setMatrixSizes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-slate-400"
                      placeholder="e.g. S, M, L, XL or 7, 8, 9, 10"
                    />
                  </div>

                  {/* Step 3: Stock Matrix */}
                  {matrixColors.length > 0 && matrixSizes.split(',').filter(s => s.trim()).length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-blue-100 overflow-x-auto shadow-sm">
                      <label className="block text-xs font-black text-blue-600 uppercase mb-4">Step 3: Enter Stock Quantities</label>
                      <table className="w-full text-left border-collapse min-w-[300px]">
                        <thead>
                          <tr>
                            <th className="p-3 border-b-2 border-gray-100 text-xs text-gray-500 font-bold uppercase w-1/4">Color \ Size</th>
                            {matrixSizes.split(',').map(s => s.trim()).filter(Boolean).map((size, idx) => (
                              <th key={idx} className="p-3 border-b-2 border-gray-100 text-xs text-gray-800 font-black text-center">{size}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {matrixColors.map((color, cIdx) => (
                            <tr key={cIdx} className="hover:bg-slate-50">
                              <td className="p-3 border-b border-gray-50 text-sm font-bold text-gray-700">{color.name}</td>
                              {matrixSizes.split(',').map(s => s.trim()).filter(Boolean).map((size, sIdx) => {
                                const key = `${color.name}-${size}`;
                                return (
                                  <td key={sIdx} className="p-2 border-b border-gray-50 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={matrixStock[key] === undefined ? '' : matrixStock[key]}
                                      onChange={(e) => setMatrixStock({ ...matrixStock, [key]: parseInt(e.target.value) || 0 })}
                                      className="w-20 text-center bg-white border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none mx-auto shadow-inner"
                                      placeholder="0"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
                  <h4 className="text-xs uppercase font-black text-purple-400 tracking-widest">Additional Metadata</h4>
                  <div className="grid gap-4">
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
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all"
              >
                Discard
              </button>
              <button
                type="submit"
                form="productForm"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isSubmitting ? 'Syncing...' : modalMode === 'create' ? 'Deploy Product' : 'Update Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
