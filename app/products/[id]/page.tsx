'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ImageLightbox from '../components/ImageLightbox';
import SizeChartModal from '@/app/components/SizeChartModal';
import Navbar from '@/app/components/Navbar';
import ProductReviews from '@/app/components/ProductReviews';
import { useCart } from '@/app/context/CartContext';
import type { AuthUser } from '@/app/components/AccountModal';
import { formatPKR } from '@/lib/currency';
import type { ProductDTO } from '@/types/product';

const COLOR_MAP: Record<string, string> = {
  golden: '#D4AF37',
  gold: '#D4AF37',
  silver: '#C0C0C0',
  maroon: '#800000',
  beige: '#F5F5DC',
  nude: '#E3BC9A',
  'rose gold': '#B76E79',
  rosegold: '#B76E79',
  black: '#111111',
  white: '#FFFFFF',
  red: '#DC2626',
  blue: '#2563EB',
  pink: '#DB2777',
  purple: '#7C3AED',
};

const getColorCode = (color: string) => {
  const normalized = color.toLowerCase().trim();
  return COLOR_MAP[normalized] || normalized;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDTO[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { addItem } = useCart();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true);
        setLoadError(null);
        const response = await fetch(`/api/products/${productId}`, { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) {
          if (response.status === 404) {
            if (isMounted) {
              setProduct(null);
              setLoadError('Product not found.');
            }
            return;
          }
          throw new Error(payload.error || 'Failed to load product.');
        }
        if (!isMounted) return;
        setProduct(payload.data);
        setSelectedImageIndex(0);

        const relatedResponse = await fetch('/api/products', { cache: 'no-store' });
        const relatedPayload = await relatedResponse.json();
        if (relatedResponse.ok && Array.isArray(relatedPayload.data)) {
          const list = relatedPayload.data
            .filter(
              (item: ProductDTO) => item.slug !== payload.data.slug && item.collectionId === payload.data.collectionId,
            )
            .slice(0, 3);
          setRelatedProducts(list);
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load product.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingProduct(false);
        }
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setAuthUser(data.user ?? null);
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      } finally {
        setIsCheckingUser(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-600">
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-600">
          {loadError ?? 'Product not found.'}
        </div>
      </div>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const fallbackImage = product.image ?? productImages[0] ?? '/IPL logo Main JPG.png';
  const mainImage = productImages[selectedImageIndex] || fallbackImage;

  const isAdminUser = authUser?.role === 'ADMIN';

  const handleNextImage = () => {
    if (productImages.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePreviousImage = () => {
    if (productImages.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const openLightbox = () => {
    if (productImages.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) return;
    if (availableColors.length > 0 && !selectedColor) return;

    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      },
      quantity,
    );
  };

  const availableSizes = Array.from(new Set(product.variants?.map((v) => v.size) || [])).filter(
    Boolean,
  );
  const availableColors = Array.from(new Set(product.variants?.map((v) => v.color) || [])).filter(
    Boolean,
  );

  const selectedVariant = product.variants?.find(
    (v) => 
      (!availableSizes.length || v.size === selectedSize) && 
      (!availableColors.length || v.color === selectedColor)
  );

  const canAddToCart =
    product.inStock &&
    !isAdminUser &&
    !isCheckingUser &&
    (availableSizes.length === 0 || selectedSize) &&
    (availableColors.length === 0 || selectedColor) &&
    (selectedVariant ? selectedVariant.stock > 0 : true);


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-purple-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`#${product.collection?.slug || ''}`} className="hover:text-purple-600">
            {product.collection?.name || 'Premium'} Collection
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Product Image Gallery */}
          <div className="relative">
            {/* Main Image */}
            {mainImage ? (
              <div 
                className={`h-96 md:h-[500px] rounded-2xl overflow-hidden mb-4 cursor-pointer group relative ${
                  product.collection?.name === 'Kemei' 
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
                    : 'bg-gradient-to-br from-pink-100 to-purple-100'
                }`}
                onClick={openLightbox}
              >
                <Image
                  src={mainImage}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                {/* Click to enlarge overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 shadow-lg">
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Navigation Arrows (only show if multiple images) */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviousImage();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10"
                      aria-label="Previous image"
                    >
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10"
                      aria-label="Next image"
                    >
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className={`h-96 md:h-[500px] rounded-2xl flex items-center justify-center ${
                product.collection?.name === 'Kemei' 
                  ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
                  : 'bg-gradient-to-br from-pink-100 to-purple-100'
              }`}>
                <div className="text-center">
                  <div className="w-48 h-48 md:w-64 md:h-64 mx-auto bg-white rounded-full shadow-2xl flex items-center justify-center mb-4">
                    <span className="text-8xl md:text-9xl">
                      {product.collection?.name === 'Kemei' ? '✨' : '💫'}
                    </span>
                  </div>
                  <p className={`font-semibold text-lg ${
                    product.collection?.name === 'Kemei' ? 'text-purple-600' : 'text-pink-600'
                  }`}>
                    {product.collection?.name} Footwear
                  </p>
                </div>
              </div>
            )}

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? product.collection?.name === 'Kemei'
                          ? 'border-purple-600 ring-2 ring-purple-200'
                          : 'border-pink-600 ring-2 ring-pink-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                product.collection?.name === 'Kemei'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-pink-100 text-pink-700'
              }`}>
                {product.collection?.name}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-4">
                <span
                  className={`text-4xl font-bold bg-gradient-to-r ${
                    product.collection?.name === 'Kemei'
                      ? 'from-purple-600 to-pink-600'
                      : 'from-pink-600 to-purple-600'
                  } bg-clip-text text-transparent`}
                >
                  {formatPKR(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      {formatPKR(product.originalPrice)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      Save {formatPKR(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Variants selection */}
            <div className="space-y-6 mb-8">
              {availableColors.length > 0 && (
                <div className="animate-in fade-in slide-in-from-left duration-500">
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Color:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#A855F7] text-white shadow-md'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableSizes.length > 0 && (
                <div className="animate-in fade-in slide-in-from-left duration-500 delay-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-lg font-bold text-gray-900">
                      Size:
                    </label>
                    <button 
                      onClick={() => setIsSizeChartOpen(true)}
                      className="flex items-center gap-1.5 text-[#A855F7] font-bold text-sm hover:underline transition-all"
                    >
                      <svg className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h1m-1 4h1m-1 4h1m3-12h3c.552 0 1 .448 1 1v14c0 .552-.448 1-1 1h-3m-6 0H6c-.552 0-1-.448-1-1V5c0-.552.448-1 1-1h3m0 0v16" />
                      </svg>
                      Size Chart
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.sort((a, b) => {
                      const numA = parseFloat(a);
                      const numB = parseFloat(b);
                      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                      return a.localeCompare(b);
                    }).map((size) => {
                      const isSelected = selectedSize === size;
                      // Check if out of stock (if color is selected, check specifically for that color)
                      const isOutOfStock = selectedColor 
                        ? !product.variants?.some(v => v.size === size && v.color === selectedColor && v.stock > 0)
                        : !product.variants?.some(v => v.size === size && v.stock > 0);

                      return (
                        <button
                          key={size}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all duration-200 font-bold text-sm relative ${
                            isSelected
                              ? 'bg-[#A855F7] border-[#A855F7] text-white shadow-md'
                              : isOutOfStock
                              ? 'border-gray-200 bg-gray-50/50 text-gray-400 cursor-not-allowed diagonal-line'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {product.inStock ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-2xl w-fit border border-green-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-bold text-xs uppercase tracking-widest">In Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-2xl w-fit border border-red-100">
                  <span className="font-bold text-xs uppercase tracking-widest">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Quantity:
              </label>
              <div className="flex items-center w-fit border border-gray-200 rounded-xl p-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-lg font-bold w-12 text-center text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>


            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`w-full py-4 rounded-full font-semibold text-lg transition-all shadow-lg mb-4 ${
                product.collection?.name === 'Kemei'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
              } text-white disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
            >
              {isAdminUser 
                ? 'Admins cannot purchase' 
                : !canAddToCart && product.inStock
                ? 'Select Size & Color'
                : 'Add to Cart'}
            </button>
            {isAdminUser && (
              <p className="text-sm text-red-500 mb-6">
                Please manage inventory and orders from the admin dashboard instead of the storefront.
              </p>
            )}

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Key Features:</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advantages Section */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            <span className={`bg-gradient-to-r ${
              product.collection?.name === 'Kemei'
                ? 'from-purple-600 to-pink-600'
                : 'from-pink-600 to-purple-600'
            } bg-clip-text text-transparent`}>
              Advantages & Benefits
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {product.advantages.map((advantage, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                  product.collection?.name === 'Kemei'
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300'
                    : 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 hover:border-pink-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    product.collection?.name === 'Kemei'
                      ? 'bg-purple-100'
                      : 'bg-pink-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      product.collection?.name === 'Kemei' ? 'text-purple-600' : 'text-pink-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">{advantage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Specifications Section */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            <span className={`bg-gradient-to-r ${
              product.collection?.name === 'Kemei'
                ? 'from-purple-600 to-pink-600'
                : 'from-pink-600 to-purple-600'
            } bg-clip-text text-transparent`}>
              Specifications
            </span>
          </h2>
          <div className={`max-w-3xl mx-auto rounded-2xl p-6 md:p-8 ${
            product.collection?.name === 'Kemei'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
              : 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200'
          }`}>
            <div className="grid sm:grid-cols-2 gap-6">
              {Object.entries(product.specifications as Record<string, unknown>).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
                  <dt className="text-sm font-medium text-gray-500 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">{String(value)}</dd>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <ProductReviews 
          productId={product.slug}
          productName={product.name}
          productImage={product.image || product.images?.[0]}
        />

        {/* Related Products */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            More {product.collection?.name} Products
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">
                {loadError ? 'No additional products available.' : 'Exploring more items soon.'}
              </p>
            ) : (
              relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border ${
                    relatedProduct.collection?.name === 'Kemei' ? 'border-purple-100' : 'border-pink-100'
                  }`}
                >
                  <div
                    className={`h-48 ${
                      relatedProduct.collection?.name === 'Kemei'
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                        : 'bg-gradient-to-br from-pink-100 to-purple-100'
                    } flex items-center justify-center overflow-hidden`}
                  >
                    {relatedProduct.image ? (
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-6xl">
                        {relatedProduct.collection?.name === 'Kemei' ? '✨' : '💫'}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{relatedProduct.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{relatedProduct.shortDescription}</p>
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-2xl font-bold bg-gradient-to-r ${
                          relatedProduct.collection?.name === 'Kemei'
                            ? 'from-purple-600 to-pink-600'
                            : 'from-pink-600 to-purple-600'
                        } bg-clip-text text-transparent`}
                      >
                        {formatPKR(relatedProduct.price)}
                      </span>
                      <span className="text-purple-600 font-medium">View Details →</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={productImages.length ? productImages : [fallbackImage]}
        currentIndex={selectedImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNext={handleNextImage}
        onPrevious={handlePreviousImage}
        onSelectImage={(index) => setSelectedImageIndex(index)}
      />

      {/* Size Chart Modal */}
      <SizeChartModal 
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />
    </div>
  );
}


