/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import ReviewsSlideshow from "./components/ReviewsSlideshow";
import ScrollAnimate from "./components/ScrollAnimate";
import HomeCollectionsCarousel from "./components/HomeCollectionsCarousel";
import TrendingProductsCarousel from "./components/TrendingProductsCarousel";
import SaleBanner from "./components/SaleBanner";
import { products as seedProducts } from "./data/products";
import GlobalProductCard from "./products/components/ProductCard";
import SliderSection from "./components/SliderSection";
import TrustBanner from "./components/TrustBanner";
import AffiliateBanner from "./components/AffiliateBanner";
import type { ProductDTO, CollectionDTO } from "@/types/product";

export default function Home() {
  const seedToDto = (product: typeof seedProducts[number]): ProductDTO => ({
    id: product.id,
    slug: product.id,
    name: product.name,
    collectionId: null,
    collection: {
      id: 'seed',
      name: product.brand,
      slug: product.brand.toLowerCase(),
      description: null,
      image: null,
      targetGender: 'UNISEX',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    inStock: product.inStock,
    image: (product as any).image ?? product.images?.[0] ?? null,
    images: product.images ?? [],
    advantages: product.advantages ?? [],
    specifications: product.specifications ?? {},
    features: product.features ?? [],
    variants: [],
    videoUrl: null,
    rating: 5,
    saleCount: 0,
    isNew: false,
    isTrending: false,
    discount: (product as any).discount ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [productList, setProductList] = useState<ProductDTO[]>(() => seedProducts.map(seedToDto));
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [reviewMedia, setReviewMedia] = useState<any[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsFetchingProducts(true);
        const response = await fetch('/api/products', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok || !Array.isArray(payload.data)) {
          throw new Error(payload.error || 'Failed to load products');
        }
        if (isMounted) {
          setProductList(payload.data);
        }
      } catch (error) {
        console.warn('Unable to fetch products', error);
      } finally {
        if (isMounted) {
          setIsFetchingProducts(false);
        }
      }
    };

    const loadCollections = async () => {
      try {
        const response = await fetch('/api/collections', { cache: 'no-store' });
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.collections)) {
          if (isMounted) {
            setCollections(payload.collections);
          }
        }
      } catch (error) {
        console.warn('Unable to fetch collections', error);
      }
    };

    const loadReviewMedia = async () => {
      try {
        const response = await fetch('/api/reviews/media', { cache: 'no-store' });
        if (!response.ok) {
          console.warn(`Review media fetch failed with status: ${response.status}`);
          return;
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.warn('Expected JSON but received:', text.substring(0, 100));
          return;
        }
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.media)) {
          if (isMounted) {
            setReviewMedia(payload.media);
          }
        }
      } catch (error) {
        console.warn('Unable to fetch review media', error);
      }
    };

    loadProducts();
    loadCollections();
    loadReviewMedia();

    return () => {
      isMounted = false;
    };
  }, []);

  // Products filtered by gender
  const womenProducts = useMemo(() =>
    productList.filter(p => p.collection?.targetGender === 'WOMEN').slice(0, 8),
    [productList]
  );

  const menProducts = useMemo(() =>
    productList.filter(p => p.collection?.targetGender === 'MEN').slice(0, 8),
    [productList]
  );

  // Collections filtered by gender
  const womenCollections = useMemo(() =>
    collections.filter(c => c.targetGender === 'WOMEN'),
    [collections]
  );

  const menCollections = useMemo(() =>
    collections.filter(c => c.targetGender === 'MEN'),
    [collections]
  );



  // Reusable Product Card Wrapper
  const ProductCardWrapper = ({ product, index }: { product: ProductDTO; index: number }) => (
    <ScrollAnimate key={product.id} animation="fade-in" delay={`${index * 0.1}s`}>
      <GlobalProductCard product={product} index={index} />
    </ScrollAnimate>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════ */}
      {/*                  WOMEN'S SECTION                       */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Hero Section - Women */}
      <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden bg-[#F5F3FF]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        >
          <source src="/mp_.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-[#6B21A8]/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <ScrollAnimate animation="fade-in" className="flex flex-col items-center">
            <h1 className="text-white text-3xl sm:text-5xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter uppercase drop-shadow-lg text-center">
              The Shop&apos;s Edit
            </h1>
            <p className="text-white text-sm md:text-xl mb-8 md:mb-10 max-w-xl font-medium tracking-wide drop-shadow-md px-4 md:px-0 text-center mx-auto">
              Elegance in every step. Discover our curated
              collection of `must-have` styles at irresistible prices. Your perfect pair awaits.
            </p>
            <Link
              href="/products?gender=WOMEN"
              className="bg-[#E9D5FF] text-[#6B21A8] px-10 md:px-12 py-4 md:py-4 text-[11px] md:text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 shadow-2xl border border-white/20"
            >
              Shop
            </Link>
          </ScrollAnimate>
        </div>
      </section>

      {/* Trending Products Carousel - Top Section */}
      {productList.filter(p => p.isTrending).length > 0 && (
        <TrendingProductsCarousel products={productList.filter(p => p.isTrending)} />
      )}

      {/* Sale Banner - Dynamically displayed when there's an active sale event */}
      <SaleBanner />

      {/* Hero Section - Women */}
      <section className="bg-[#FAF9FF] border-y border-[#F5F3FF]">
        {/* Desktop View */}
        <div className="hidden md:grid max-w-[1600px] mx-auto md:grid-cols-2 items-stretch">
          <div className="relative min-h-[280px] sm:min-h-[350px] overflow-hidden">
            <Image
              src="/women.png"
              alt="Women's Collection"
              fill
              className="object-cover transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-[#A855F7]/10" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 md:p-24 space-y-6 md:space-y-8">
            <ScrollAnimate animation="slide-in-right">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#A855F7]">Exclusive Collections</h2>
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
                The Women&apos;s
              </h3>
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none bg-gradient-to-r from-[#A855F7] to-[#460e7b] bg-clip-text text-transparent">
                Essentials
              </h3>
              <p className="text-gray-500 text-lg font-light leading-relaxed max-w-md">
                Elegance in every step. Discover our curated collection of luxury heels, elegant sandals, and statement footwear.
              </p>
              <Link
                href="/products?gender=WOMEN"
                className="inline-block bg-[#E9D5FF] text-[#6B21A8] px-10 md:px-12 py-4 md:py-5 text-[11px] md:text-sm font-black uppercase tracking-[0.2em] hover:bg-[#6B21A8] hover:text-white transition-all duration-300 shadow-xl mt-10"
              >
                Shop Women
              </Link>
            </ScrollAnimate>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden relative h-[380px] w-full overflow-hidden">
          <Image
            src="/women.png"
            alt="Women's Collection"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-purple-950/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-center space-y-3">
            <ScrollAnimate animation="fade-in">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-300 block mb-1">
                Exclusive Collections
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                The Women&apos;s Essentials
              </h3>
              <p className="text-gray-300 text-xs font-light max-w-xs mx-auto mt-2 leading-relaxed">
                Elegance in every step. Discover our curated collection of luxury heels, elegant sandals, and statement footwear.
              </p>
              <div className="pt-4">
                <Link
                  href="/products?gender=WOMEN"
                  className="inline-block bg-white text-black hover:bg-[#E9D5FF] hover:text-[#6B21A8] px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl"
                >
                  Shop Women
                </Link>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Shop By Collection Slider - Women */}
      {womenCollections.length > 0 && (
        <HomeCollectionsCarousel
          collections={womenCollections}
          title="Shop By Collection"
          subtitle="Curated For Her"
          viewAllLink="/products?gender=WOMEN"
          accentColor="#A855F7"
        />
      )}

      {/* Women's Products Slider */}
      <SliderSection
        title="In The Spotlight: Women"
        subtitle="Trending Now"
        viewAllLink="/products?gender=WOMEN"
        accentColor="#A855F7"
      >
        {womenProducts.map((product, index) => (
          <GlobalProductCard key={product.id} product={product} index={index} />
        ))}
      </SliderSection>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*                   MEN'S SECTION                        */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Hero Section - Men */}
      <section className="bg-[#FAF9FF] border-y border-[#F5F3FF]">
        {/* Desktop View */}
        <div className="hidden md:grid max-w-[1600px] mx-auto md:grid-cols-2 items-stretch">
          <div className="relative min-h-[280px] sm:min-h-[350px] overflow-hidden">
            <Image
              src="/men.png"
              alt="Men's Collection"
              fill
              className="object-cover transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-[#6B21A8]/10" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 md:p-24 space-y-6 md:space-y-8">
            <ScrollAnimate animation="slide-in-right">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#A855F7]">Exclusive Collections</h2>
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
                The Men&apos;s
              </h3>
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none bg-gradient-to-r from-[#A855F7] to-[#460e7b] bg-clip-text text-transparent">
                Essentials
              </h3>
              <p className="text-gray-500 text-lg font-light leading-relaxed max-w-md">
                Refined style for the modern man. From polished loafers to everyday sneakers, find your signature look.
              </p>
              <Link
                href="/products?gender=MEN"
                className="inline-block bg-[#E9D5FF] text-[#6B21A8] px-10 md:px-12 py-4 md:py-5 text-[11px] md:text-sm font-black uppercase tracking-[0.2em] hover:bg-[#6B21A8] hover:text-white transition-all duration-300 shadow-xl mt-10"
              >
                Shop Men
              </Link>
            </ScrollAnimate>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden relative h-[380px] w-full overflow-hidden">
          <Image
            src="/men.png"
            alt="Men's Collection"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-purple-950/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-center space-y-3">
            <ScrollAnimate animation="fade-in">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-300 block mb-1">
                Exclusive Collections
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                The Men&apos;s Essentials
              </h3>
              <p className="text-gray-300 text-xs font-light max-w-xs mx-auto mt-2 leading-relaxed">
                Refined style for the modern man. From polished loafers to everyday sneakers, find your signature look.
              </p>
              <div className="pt-4">
                <Link
                  href="/products?gender=MEN"
                  className="inline-block bg-white text-black hover:bg-[#E9D5FF] hover:text-[#6B21A8] px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl"
                >
                  Shop Men
                </Link>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Shop By Collection Slider - Men */}
      {menCollections.length > 0 && (
        <HomeCollectionsCarousel
          collections={menCollections}
          title="Shop By Collection"
          subtitle="Crafted For Him"
          viewAllLink="/products?gender=MEN"
          accentColor="#6B21A8"
        />
      )}

      {/* Men's Products Slider */}
      {menProducts.length > 0 && (
        <SliderSection
          title="In The Spotlight: Men"
          subtitle="Modern Classic"
          viewAllLink="/products?gender=MEN"
          accentColor="#6B21A8"
        >
          {menProducts.map((product, index) => (
            <GlobalProductCard key={product.id} product={product} index={index} />
          ))}
        </SliderSection>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/*                   KIDS SECTION                         */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Hero Section - Kids */}
      <section className="bg-[#FAF9FF] border-y border-[#F5F3FF]">
        {/* Desktop View */}
        <div className="hidden md:grid max-w-[1600px] mx-auto md:grid-cols-2 items-stretch">
          <div className="relative min-h-[280px] sm:min-h-[350px] overflow-hidden">
            <Image
              src="/kids1.png"
              alt="Kids Collection"
              fill
              className="object-cover transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-[#A855F7]/10" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 md:p-24 space-y-6 md:space-y-8">
            <ScrollAnimate animation="slide-in-right">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#A855F7]">Exclusive Collections</h2>
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
                The Kids&apos;
              </h3>
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none bg-gradient-to-r from-[#A855F7] to-[#460e7b] bg-clip-text text-transparent">
                Collection
              </h3>
              <p className="text-gray-500 text-lg font-light leading-relaxed max-w-md">
                Comfortable and stylish footwear designed for growing feet. From playful sneakers to elegant party shoes, find the perfect fit for your little ones.
              </p>
              <Link
                href="/products?gender=KIDS"
                className="inline-block bg-[#E9D5FF] text-[#6B21A8] px-10 md:px-12 py-4 md:py-5 text-[11px] md:text-sm font-black uppercase tracking-[0.2em] hover:bg-[#6B21A8] hover:text-white transition-all duration-300 shadow-xl mt-10"
              >
                Shop Kids
              </Link>
            </ScrollAnimate>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden relative h-[380px] w-full overflow-hidden">
          <Image
            src="/kids1.png"
            alt="Kids Collection"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-purple-950/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-center space-y-3">
            <ScrollAnimate animation="fade-in">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-300 block mb-1">
                Exclusive Collections
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                The Kids&apos; Collection
              </h3>
              <p className="text-gray-300 text-xs font-light max-w-xs mx-auto mt-2 leading-relaxed">
                Comfortable and stylish footwear designed for growing feet. From playful sneakers to elegant party shoes, find the perfect fit.
              </p>
              <div className="pt-4">
                <Link
                  href="/products?gender=KIDS"
                  className="inline-block bg-white text-black hover:bg-[#E9D5FF] hover:text-[#6B21A8] px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl"
                >
                  Shop Kids
                </Link>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>



      {/* Trust Indicators Scroll Banner */}
      <TrustBanner />

      {/* Affiliate Program Call to Action */}
      <AffiliateBanner />

      {/* ═══════════════════════════════════════════════════════ */}
      {/*              COMMUNITY & REVIEWS                       */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* As Seen On You */}
      {reviewMedia.length > 0 && (
        <section className="py-24 px-6 md:px-20 max-w-[1600px] mx-auto border-t border-[#F5F3FF] bg-[#FAF9FF]">
          <ScrollAnimate animation="fade-in" className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase text-gray-900">As Seen On You</h2>
            <p className="text-[#A855F7] font-medium tracking-widest text-xs uppercase italic">Tag @StepAndStyle to be featured</p>
          </ScrollAnimate>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {reviewMedia.map((item, index) => {
              const isDynamic = typeof item === 'object';
              const mediaUrl = isDynamic ? item.url : item;
              const productSlug = isDynamic ? item.productSlug : '#';
              const isVideo = isDynamic && item.type === 'video';

              return (
                <ScrollAnimate key={`media-${index}`} animation="scale-in" delay={`${index * 0.1}s`} className="relative aspect-square overflow-hidden bg-white group rounded-xl shadow-sm">
                  <Link href={isDynamic ? `/products/${productSlug}` : '#'}>
                    {isVideo ? (
                      <div className="w-full h-full bg-black relative flex items-center justify-center">
                        {mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ? (
                          <Image
                            src={`https://img.youtube.com/vi/${mediaUrl.split('/').pop()?.split('=')[1] || mediaUrl.split('/').pop()}/mqdefault.jpg`}
                            alt="Video"
                            fill
                            className="object-cover opacity-80"
                          />
                        ) : (
                          <video
                            src={mediaUrl}
                            className="w-full h-full object-cover opacity-80"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                        )}
                        <div className="absolute inset-0 bg-purple-600/5 group-hover:bg-purple-600/20 transition-colors" />
                      </div>
                    ) : (
                      <Image
                        src={mediaUrl}
                        alt="Social"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-purple-600/30 transition-colors flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-[9px] font-black tracking-widest uppercase border border-white px-4 py-2 bg-purple-600/20 backdrop-blur-sm mb-2">Shop The Look</span>
                      {isDynamic && <span className="text-white/80 text-[8px] font-bold uppercase tracking-tight">@{item.userName}</span>}
                    </div>
                  </Link>
                </ScrollAnimate>
              );
            })}
          </div>
          <ScrollAnimate animation="fade-in" className="text-center mt-12">
            <Link href="/reviews">
              <button className="bg-[#E9D5FF] text-[#6B21A8] px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#6B21A8] hover:text-white transition-all shadow-xl">
                Get Inspired
              </button>
            </Link>
          </ScrollAnimate>
        </section>
      )}

      <ReviewsSlideshow />
    </div>
  );
}
