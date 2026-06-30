/* eslint-disable react/no-unescaped-entities */
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
import { Heart } from 'lucide-react';
import { useWishlist } from '@/app/context/WishlistContext';

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
  white: '#F5F5F5',
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
  const { addItem, setIsCartOpen } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

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

  // Auto-select first available color and size
  useEffect(() => {
    if (!product) return;
    const colors = Array.from(new Set(product.variants?.map(v => v.color) || [])).filter(Boolean);
    const sizes = Array.from(new Set(product.variants?.map(v => v.size) || [])).filter(Boolean)
      .sort((a, b) => {
        const numA = parseFloat(a); const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
  }, [product]);

  const productMedia = useMemo(() => {
    if (!product) return [];

    // If a color is selected, try to use that color's specific media
    if (selectedColor && product.variants) {
      const colorVariant = product.variants.find(v => v.color === selectedColor);
      if (colorVariant) {
        const colorImages: { type: string; url: string }[] = [];
        if (colorVariant.imageUrl) {
          colorImages.push({ type: 'image', url: colorVariant.imageUrl });
        }
        if (colorVariant.images && colorVariant.images.length > 0) {
          colorVariant.images.forEach(url => {
            if (url && !colorImages.find(m => m.url === url)) {
              colorImages.push({ type: 'image', url });
            }
          });
        }
        if (colorVariant.videoUrl) {
          colorImages.push({ type: 'video', url: colorVariant.videoUrl });
        }
        if (colorImages.length > 0) return colorImages;
      }
    }

    // Fallback to global product images
    const allImages = [
      product.image,
      ...(Array.isArray(product.images) ? product.images : [])
    ].filter((url): url is string => typeof url === 'string' && url.length > 0);
    const uniqueImages = Array.from(new Set(allImages));
    const media = uniqueImages.map(url => ({ type: 'image', url }));
    if (product.videoUrl) {
      media.push({ type: 'video', url: product.videoUrl });
    }
    return media;
  }, [product, selectedColor]);

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

  const fallbackImage = product.image ?? (product.images?.[0]) ?? '/logo_main.png';
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

  const handleAddToCart = () => {
    if (needsSelection) return;

    setIsAddingToCart(true);
    setShowToast(true);

    const finalPrice = product.discount && product.discount > 0 
      ? Math.round(product.price * (1 - product.discount / 100)) 
      : product.price;

    addItem(
      {
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: mainImage,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      },
      quantity,
    );
    
    setTimeout(() => {
      setIsAddingToCart(false);
      setIsCartOpen(true);
    }, 800);
    
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };
  
  const handleBuyNow = () => {
    if (needsSelection) return;

    const finalPrice = product.discount && product.discount > 0 
      ? Math.round(product.price * (1 - product.discount / 100)) 
      : product.price;

    addItem(
      {
        id: product.id,
        name: product.name,
        price: finalPrice,
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

  const needsSelection = 
    (availableSizes.length > 0 && !selectedSize) || 
    (availableColors.length > 0 && !selectedColor);


  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-10 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 md:mb-10 gap-2 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
          <button onClick={() => router.back()} className="hover:text-black flex items-center gap-1 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <span>/</span>
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
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
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${selectedImageIndex === idx ? 'border-gray-900 scale-105 shadow-md' : 'border-transparent hover:border-gray-200'
                    }`}
                >
                  {item.type === 'image' ? (
                    <Image src={item.url || '/logo_main.png'} alt="" width={64} height={64} className="w-full h-full object-cover" />
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
                      <svg className="w-6 h-6 text-white relative z-10 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Main Image Container */}
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
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 relative ${selectedImageIndex === idx ? 'border-gray-900' : 'border-transparent'
                    }`}
                >
                  {item.type === 'image' ? (
                    <Image src={item.url || '/logo_main.png'} alt="" width={56} height={56} className="w-full h-full object-cover" />
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

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 space-y-6 lg:pr-6 pb-10">
            {/* Product Name & Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 leading-tight">
                {product.name}
              </h1>
              <button
                onClick={() => {
                  if (isInWishlist(product.id)) {
                    removeFromWishlist(product.id);
                  } else {
                    addToWishlist({
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      originalPrice: product.originalPrice ?? undefined,
                      image: mainImage,
                    });
                  }
                }}
                className="p-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 rounded-full transition-colors shrink-0"
                title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart 
                  size={24} 
                  className={isInWishlist(product.id) ? "fill-purple-600 text-purple-600" : "text-gray-400"} 
                />
              </button>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-xl sm:text-2xl font-black text-purple-600 tracking-tight">
                {formatPKR(product.discount && product.discount > 0 
                  ? Math.round(product.price * (1 - product.discount / 100)) 
                  : product.price)}
              </span>
              {product.discount && product.discount > 0 ? (
                <span className="text-base text-gray-400 line-through font-medium">
                  {formatPKR(product.price)}
                </span>
              ) : product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-base text-gray-400 line-through font-medium">
                  {formatPKR(product.originalPrice)}
                </span>
              ) : null}
            </div>

            {/* SKU */}
            <p className="text-xs text-gray-400 font-medium">SKU: {product.slug}</p>

            <hr className="border-gray-100" />

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-5 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Color</label>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">{selectedColor || 'Select'}</span>
                </div>
                <div className="flex flex-wrap gap-5 items-center">
                  {availableColors.map((color) => {
                    const colorHex = getColorCode(color);
                    const isSelected = selectedColor === color;
                    const isOutOfStock = !product.variants?.some(v => v.color === color && v.stock > 0);
                    
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedImageIndex(0);
                        }}
                        disabled={isOutOfStock}
                        className={`group relative flex items-center justify-center p-1 ${isOutOfStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title={isOutOfStock ? `${color} (Out of Stock)` : color}
                      >
                        {/* Selection Ring */}
                        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
                          isSelected ? 'border-purple-600 scale-100' : 'border-transparent scale-50 opacity-0'
                        }`} />
                        
                        {/* Color Circle */}
                        <div 
                          className={`w-7 h-7 rounded-full shadow-sm transition-all duration-300 ${
                            isSelected ? 'scale-[0.6]' : 'group-hover:scale-110'
                          } ${color.toLowerCase() === 'white' ? 'border-2 border-gray-300' : 'border border-gray-100'}`}
                          style={{ backgroundColor: colorHex }}
                        />

                        {isOutOfStock && (
                          <div className="absolute w-[120%] h-[1px] bg-gray-400 rotate-45 pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-5 pt-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Size</label>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">{selectedSize || 'Select'}</span>
                  </div>
                  <button 
                    onClick={() => setIsSizeChartOpen(true)} 
                    className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-600 hover:text-purple-800 underline underline-offset-4 transition-colors"
                  >
                    Size Chart
                  </button>
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
                        className={`relative w-12 h-12 flex items-center justify-center text-[12px] font-black transition-all border-2 overflow-hidden ${
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

            <hr className="border-gray-100" />

            {/* Quantity */}
            <div className="space-y-5">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Quantity</label>
              <div className="flex items-center w-36 border-2 border-gray-100 rounded-sm overflow-hidden bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                </button>
                <span className="flex-1 text-center text-[13px] font-black text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart || isAddingToCart}
                className={`w-full py-4 sm:py-5 border-2 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] transition-all duration-500 active:scale-[0.98] ${
                  !canAddToCart
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : isAddingToCart
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white'
                }`}
              >
                {isAdminUser 
                  ? 'Admin Mode' 
                  : !product.inStock 
                  ? 'Sold Out' 
                  : isAddingToCart 
                  ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Added to Bag
                      </span>
                    )
                  : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart}
                className={`w-full py-4 sm:py-5 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] transition-all duration-500 shadow-xl active:scale-[0.98] ${
                  !canAddToCart
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
                }`}
              >
                Buy it Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="text-xs font-bold text-gray-700">Open Parcel Then Pay</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="text-xs font-bold text-gray-700">Free Delivery on All Prepaid Orders</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="text-xs font-bold text-gray-700">7 Day Easy Return & Exchange</span>
              </div>
            </div>

            {/* Description Accordion */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => setDescriptionOpen(!descriptionOpen)}
                className="w-full py-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-purple-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>Description</span>
                </div>
                <svg className={`w-4 h-4 transition-transform duration-300 ${descriptionOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
              {descriptionOpen && (
                <div className="pb-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                  
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {product.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <svg className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mb-3">Specifications</h4>
                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        {Object.entries(product.specifications as Record<string, string>).map(([key, val], i) => (
                          <div key={i} className={`flex gap-6 px-4 py-3 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <span className="w-1/3 text-gray-400 uppercase tracking-wider font-bold">{key}</span>
                            <span className="flex-1 text-gray-900 font-bold">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.advantages && product.advantages.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mb-3">Advantages</h4>
                      <ul className="space-y-2">
                        {product.advantages.map((adv, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <svg className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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
        currentIndex={selectedImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNext={handleNextImage}
        onPrevious={handlePreviousImage}
        onSelectImage={(index) => setSelectedImageIndex(index)}
      />
      <SizeChartModal 
        isOpen={isSizeChartOpen} 
        onClose={() => setIsSizeChartOpen(false)} 
      />

      {/* Toast Notification */}
      <div 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${
          showToast ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest">Product Added to Bag</span>
        </div>
      </div>
    </div>
  );
}
