'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import ImageLightbox from '../components/ImageLightbox';
import SizeChartModal from '@/app/components/SizeChartModal';
import Navbar from '@/app/components/Navbar';
import ProductReviews from '@/app/components/ProductReviews';
import { useCart } from '@/app/context/CartContext';
import type { AuthUser } from '@/app/components/AccountModal';
import { formatPKR } from '@/lib/currency';
import type { ProductDTO } from '@/types/product';
import SliderSection from '@/app/components/SliderSection';
import GlobalProductCard from '../components/ProductCard';

const COLOR_MAP: Record<string, string> = {
  golden: '#FFD700',
  gold: '#FFD700',
  yellow: '#FACC15',
  silver: '#E5E7EB',
  maroon: '#7F1D1D',
  beige: '#F5F5DC',
  nude: '#F3D2C1',
  'rose gold': '#E1B3A8',
  rosegold: '#E1B3A8',
  black: '#111111',
  white: '#FFFFFF',
  red: '#DC2626',
  blue: '#2563EB',
  pink: '#DB2777',
  purple: '#7C3AED',
  tan: '#B45309',
  brown: '#78350F',
  peach: '#FFD1B3',
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

  const productMedia = useMemo(() => {
    if (!product) return [];
    
    // Combine cover image and additional images, then deduplicate
    const allImages = [
      product.image,
      ...(Array.isArray(product.images) ? product.images : [])
    ].filter((url): url is string => typeof url === 'string' && url.length > 0);
    
    const uniqueImages = Array.from(new Set(allImages));
    
    const media = uniqueImages.map(url => ({ type: 'image', url }));
    if (product.videoUrl) {
      media.unshift({ type: 'video', url: product.videoUrl });
    }
    return media;
  }, [product?.images, product?.image, product?.videoUrl]);

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

  const fallbackImage = product.image ?? (product.images?.[0]) ?? '/main_logo.png';
  const currentMedia = productMedia[selectedImageIndex] || { type: 'image', url: fallbackImage };
  const mainImage = currentMedia.type === 'image' ? currentMedia.url : fallbackImage;

  const isAdminUser = authUser?.role === 'ADMIN';

  const handleNextImage = () => {
    if (productMedia.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % productMedia.length);
  };

  const handlePreviousImage = () => {
    if (productMedia.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + productMedia.length) % productMedia.length);
  };

  const openLightbox = () => {
    if (productMedia.length > 0 && currentMedia.type === 'image') {
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
  
  const handleBuyNow = () => {
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
    router.push('/checkout');
  };

  const availableSizes = Array.from(new Set(product.variants?.map((v) => v.size) || []))
    .filter(Boolean)
    .sort((a, b) => {
      const numA = parseFloat(a as string);
      const numB = parseFloat(b as string);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return (a as string).localeCompare(b as string);
    });

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
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-10 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 md:mb-10 gap-2 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href={`/products?collectionId=${product.collectionId}`} className="hover:text-black">{product.collection?.name}</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 mb-20 items-start">
          {/* LEFT: Image Gallery (Sticky) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 lg:sticky lg:top-24">
            {/* Thumbnails (Desktop side) */}
            <div className="hidden md:flex flex-col gap-3 w-16 flex-shrink-0">
              {productMedia.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${selectedImageIndex === idx ? 'border-purple-600 scale-105 shadow-md' : 'border-transparent hover:border-gray-200'
                    }`}
                >
                  {item.type === 'image' ? (
                    <Image src={item.url} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black relative flex items-center justify-center">
                      {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                         <Image 
                           src={`https://img.youtube.com/vi/${
                              item.url.includes('v=') 
                                ? item.url.split('v=')[1]?.split('&')[0] 
                                : item.url.split('/').pop()
                           }/mqdefault.jpg`} 
                           alt="Video Preview"
                           fill
                           className="object-cover opacity-60"
                         />
                      ) : (
                        <video 
                          src={item.url} 
                          muted 
                          loop 
                          autoPlay 
                          playsInline
                          className="w-full h-full object-cover opacity-60" 
                        />
                      )}
                      <div className="absolute inset-0 bg-purple-600/10" />
                      <svg className="w-6 h-6 text-white relative z-10 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Main Image Container (Fixed Aspect) */}
            <div className={`relative flex-1 aspect-[4/5] max-h-[80vh] bg-[#F9F9F9] rounded-2xl overflow-hidden group ${currentMedia.type === 'image' ? 'cursor-zoom-in' : ''}`} onClick={openLightbox}>
              {currentMedia.type === 'image' ? (
                <Image
                  src={currentMedia.url}
                  alt={product.name}
                  fill
                  className="object-contain p-4 md:p-8 transition-transform duration-700 group-hover:scale-110"
                  priority
                />
              ) : (
                <div className="w-full h-full p-0 flex items-center justify-center bg-black">
                   {currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be') ? (
                     <iframe
                        src={`https://www.youtube.com/embed/${
                          currentMedia.url.includes('v=') 
                            ? currentMedia.url.split('v=')[1]?.split('&')[0] 
                            : currentMedia.url.split('/').pop()
                        }?autoplay=1&mute=1&loop=1&playlist=${
                          currentMedia.url.includes('v=') 
                            ? currentMedia.url.split('v=')[1]?.split('&')[0] 
                            : currentMedia.url.split('/').pop()
                        }`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                     />
                   ) : (
                     <video
                       src={currentMedia.url}
                       controls
                       playsInline
                       preload="metadata"
                       className="w-full h-full object-contain"
                       autoPlay
                       muted
                       loop
                     />
                   )}
                </div>
              )}
              <div className="absolute top-4 left-4">
                {product.isNew && (
                  <span className="bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm">New</span>
                )}
              </div>
            </div>

            {/* Thumbnails (Mobile bottom) */}
            <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar py-2">
              {productMedia.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 relative ${selectedImageIndex === idx ? 'border-purple-600' : 'border-transparent'
                    }`}
                >
                  {item.type === 'image' ? (
                    <Image src={item.url} alt="" width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black relative flex items-center justify-center">
                      {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                         <Image 
                           src={`https://img.youtube.com/vi/${
                              item.url.includes('v=') 
                                ? item.url.split('v=')[1]?.split('&')[0] 
                                : item.url.split('/').pop()
                           }/mqdefault.jpg`} 
                           alt="Video Preview"
                           fill
                           className="object-cover opacity-60"
                         />
                      ) : (
                        <video 
                          src={item.url} 
                          muted 
                          loop 
                          autoPlay 
                          playsInline
                          className="w-full h-full object-cover opacity-60" 
                        />
                      )}
                      <svg className="w-5 h-5 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* RIGHT: Product Info (Scrollable) */}
          <div className="lg:col-span-5 space-y-10 lg:max-h-[85vh] lg:overflow-y-auto no-scrollbar lg:pr-6 pb-10">
            <header className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 bg-purple-600"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-600">{product.collection?.name}</p>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-[1.1]">
                {product.name}
              </h1>
              <p className="text-sm font-bold text-gray-400 italic tracking-wide">"{product.shortDescription}"</p>
            </header>

            {/* Pricing */}
            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-2xl sm:text-4xl font-black text-black tracking-tighter">{formatPKR(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex items-center gap-2">
                  <span className="text-xl text-gray-300 line-through font-medium">{formatPKR(product.originalPrice)}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white bg-[#6B21A8] px-2 py-1 rounded">
                    SALE
                  </span>
                </div>
              )}
            </div>

            {/* Selection Options */}
            <div className="space-y-10 pt-4">
              {availableColors.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Color</label>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">{selectedColor || 'Select'}</span>
                  </div>
                  <div className="flex flex-wrap gap-5 items-center">
                    {availableColors.map((color) => {
                      const colorHex = COLOR_MAP[color.toLowerCase()] || '#E5E7EB';
                      const isSelected = selectedColor === color;
                      const isOutOfStock = !product.variants?.some(v => v.color === color && v.stock > 0);
                      
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`group relative flex items-center justify-center p-1 ${isOutOfStock ? 'opacity-30' : ''}`}
                          title={isOutOfStock ? `${color} (Out of Stock)` : color}
                        >
                          {/* Selection Ring */}
                          <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
                            isSelected ? 'border-purple-600 scale-100' : 'border-transparent scale-50 opacity-0'
                          }`} />
                          
                          {/* Color Circle */}
                          <div 
                            className={`w-7 h-7 rounded-full border border-gray-100 shadow-sm transition-all duration-300 ${
                              isSelected ? 'scale-[0.6]' : 'group-hover:scale-110'
                            }`}
                            style={{ backgroundColor: colorHex }}
                          />

                          {/* Out of stock line */}
                          {isOutOfStock && (
                            <div className="absolute w-[120%] h-[1px] bg-gray-400 rotate-45 pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableSizes.length > 0 && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Size</label>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">{selectedSize || 'Select'}</span>
                    </div>
                    <button onClick={() => setIsSizeChartOpen(true)} className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-600 hover:text-purple-800 underline underline-offset-4 transition-colors">Size Chart</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size) => {
                      const isOutOfStock = selectedColor 
                        ? !product.variants?.some(v => v.size === size && v.color === selectedColor && v.stock > 0)
                        : !product.variants?.some(v => v.size === size && v.stock > 0);

                      return (
                        <button
                          key={size}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          disabled={isOutOfStock}
                          className={`relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-[12px] sm:text-[13px] font-black transition-all border-2 overflow-hidden ${
                            selectedSize === size
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-200'
                            : isOutOfStock
                            ? 'bg-gray-50 text-gray-200 border-gray-100 cursor-not-allowed'
                            : 'bg-white text-gray-900 border-gray-100 hover:border-purple-600 hover:text-purple-600'
                          }`}
                        >
                          {size}
                          {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-[150%] h-[1px] bg-gray-300 rotate-45" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-5">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Quantity</label>
              <div className="flex items-center w-36 border-2 border-gray-100 rounded-sm overflow-hidden bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                </button>
                <span className="flex-1 text-center text-[13px] font-black text-gray-900">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="w-full py-4 sm:py-5 bg-white border-2 border-purple-600 text-purple-600 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] hover:bg-[#5B1A8F] hover:text-white transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isAdminUser ? 'Admin Mode' : !product.inStock ? 'Sold Out' : 'Add to Bag'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart}
                className="w-full py-4 sm:py-5 bg-purple-500 text-white font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] hover:bg-[#5B1A8F] transition-all duration-500 shadow-2xl shadow-purple-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Buy it Now
              </button>
            </div>

            {/* Delivery & Offers Banner */}
            <div className="pt-8 space-y-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {/* Online Payment Benefit */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-5 border-b border-green-100 group">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200 transition-transform group-hover:scale-110">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-green-700 uppercase tracking-wider">Free Delivery</p>
                  <p className="text-[10px] text-green-600/70 font-medium">Only on Bank Transfer &amp; Online Payments</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-3 py-1 rounded-full">Free</span>
              </div>

              {/* Direct Bank Transfer Discount */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 p-5 border-b border-amber-100 group">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200 transition-transform group-hover:scale-110">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1M12 16v1m4-12V3c0-1.105-.895-2-2-2H4c-1.105 0-2 .895-2 2v18c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2h-2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider">5% Extra Discount</p>
                  <p className="text-[10px] text-amber-600/70 font-medium">Exclusively on Direct Bank Transfers</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-3 py-1 rounded-full">Save 5%</span>
              </div>

              {/* Standard Shipping (COD) */}
              <div className="flex items-center gap-4 bg-white p-5 group">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-100 transition-transform group-hover:scale-110">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Standard Shipping (COD)</p>
                  <p className="text-[10px] text-gray-400 font-medium">Pay on delivery in 3-5 business days</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-900 tracking-tighter">Rs. 300 – 350</p>
                </div>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="pt-10 space-y-0">
              <Accordion title="Product Details" isOpenDefault={true}>
                <div className="space-y-8">
                  {/* Product Story */}
                  <div>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>

                  {/* Key Features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mb-4">Key Features</h4>
                      <ul className="space-y-2.5">
                        {product.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-[12px] text-gray-600 leading-relaxed">
                            <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mb-6 flex items-center gap-2">
                        <span>Specifications</span>
                        <div className="h-[1px] flex-1 bg-purple-100" />
                      </h4>
                      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        {Object.entries(product.specifications as Record<string, string>).map(([key, val], i) => (
                          <div 
                            key={i} 
                            className={`flex gap-8 px-6 py-5 text-[11px] border-b border-gray-50 last:border-0 ${
                              i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'
                            }`}
                          >
                            <div className="w-1/3 flex-shrink-0">
                              <span className="text-gray-400 uppercase tracking-[0.2em] font-black leading-relaxed">
                                {key}
                              </span>
                            </div>
                            <div className="flex-1">
                              <span className="text-gray-900 font-black leading-relaxed text-right md:text-left block md:inline">
                                {val}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Accordion>

              <Accordion title="Advantages & Selling Points">
                <div className="space-y-3">
                  {product.advantages && product.advantages.length > 0 ? (
                    product.advantages.map((adv, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-purple-100 bg-gradient-to-r from-white to-purple-50/30 hover:shadow-md hover:border-purple-200 transition-all duration-300 group">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <span className="text-[12px] font-bold text-gray-700">{adv}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">Premium craftsmanship, designed for you.</p>
                  )}
                </div>
              </Accordion>

              <Accordion title="Shipping & Returns">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100 space-y-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Shipping</h5>
                      <p className="text-[10px] leading-relaxed text-gray-500 font-medium">Standard: Rs. 300 – 350. Free on instant payments &amp; bank transfers.</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100 space-y-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Returns</h5>
                      <p className="text-[10px] leading-relaxed text-gray-500 font-medium">Faulty or size issues only. No returns for change of mind.</p>
                    </div>
                  </div>
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* RELATED PRODUCTS */}
        <div className="border-t border-gray-100 pt-20 mt-20">
          <SliderSection
            title="You May Also Like"
            subtitle="Complete The Look"
            viewAllLink={`/products?collectionId=${product.collectionId}`}
            accentColor="#6B21A8"
          >
            {relatedProducts.map((p) => (
              <GlobalProductCard key={p.id} product={p} index={0} />
            ))}
          </SliderSection>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-20 border-t border-gray-100 pt-20">
          <ProductReviews
            productId={product.slug}
            productName={product.name}
            productImage={product.image || product.images?.[0]}
          />
        </div>
      </div>

      {/* Lightbox & Size Chart */}
      <ImageLightbox
        images={productMedia.filter(m => m.type === 'image').map(m => m.url)}
        currentIndex={product.videoUrl ? Math.max(0, selectedImageIndex - 1) : selectedImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNext={handleNextImage}
        onPrevious={handlePreviousImage}
        onSelectImage={(index) => setSelectedImageIndex(index)}
      />
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
    </div>
  );
}

// Simple Accordion Component for Details
function Accordion({ title, children, isOpenDefault = false }: { title: string, children: React.ReactNode, isOpenDefault?: boolean }) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 hover:text-purple-600 transition-colors"
      >
        <span>{title}</span>
        <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && <div className="pb-8 animate-in fade-in slide-in-from-top-4 duration-500">{children}</div>}
    </div>
  );
}


