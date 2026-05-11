'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import ReviewsSlideshow from "./components/ReviewsSlideshow";
import ScrollAnimate from "./components/ScrollAnimate";
import { products as seedProducts } from "./data/products";
import GlobalProductCard from "./products/components/ProductCard";
import SliderSection from "./components/SliderSection";
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

  // Reusable Collection Card Component
  const CollectionCard = ({ collection, index }: { collection: CollectionDTO; index: number }) => (
    <ScrollAnimate key={collection.id} animation="fade-in" delay={`${index * 0.12}s`}>
      <Link href={`/products?collectionId=${collection.id}`} className="relative group block overflow-hidden rounded-3xl">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={collection.image || '/final_logo.jpeg'}
            alt={collection.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-[#6B21A8]/10 transition-all duration-500" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
            <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-[0.15em] drop-shadow-lg mb-2">{collection.name}</h3>
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em] border border-white/50 px-5 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
              Shop Now
            </span>
          </div>
        </div>
      </Link>
    </ScrollAnimate>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════ */}
      {/*                  WOMEN'S SECTION                       */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Hero Section - Women */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-[#F5F3FF]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        >
          <source src="/banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-[#6B21A8]/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <ScrollAnimate animation="fade-in">
            <h1 className="text-white text-5xl md:text-8xl font-black mb-6 tracking-tighter uppercase drop-shadow-lg">
              The Women&apos;s Edit
            </h1>
            <p className="text-white text-lg md:text-xl mb-10 max-w-xl font-medium tracking-wide drop-shadow-md">
              Elegance in every step. Discover our curated collection of luxury heels and sandals.
            </p>
            <Link
              href="/products?gender=WOMEN"
              className="bg-[#E9D5FF] text-[#6B21A8] px-12 py-4 text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 shadow-2xl border border-white/20"
            >
              Shop Women
            </Link>
          </ScrollAnimate>
        </div>
      </section>

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

      {/* Shop By Collection Slider - Women */}
      {womenCollections.length > 0 && (
        <SliderSection 
          title="Shop By Collection" 
          subtitle="Curated For Her" 
          viewAllLink="/products?gender=WOMEN"
          accentColor="#A855F7"
          itemWidth="min-w-[280px] md:min-w-[380px]"
        >
          {womenCollections.map((collection, index) => (
            <CollectionCard key={collection.id} collection={collection} index={index} />
          ))}
        </SliderSection>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/*                   MEN'S SECTION                        */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Hero Section - Men */}
      <section className="bg-[#FAF9FF] border-y border-[#F5F3FF]">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 items-stretch">
          <div className="relative h-[60vh] md:h-auto overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80&w=1000"
              alt="Men's Collection"
              fill
              className="object-cover transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-[#6B21A8]/10" />
          </div>
          <div className="flex flex-col justify-center p-12 md:p-24 space-y-8">
            <ScrollAnimate animation="slide-in-right">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#A855F7]">New Arrivals</h2>
              <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
                The Men&apos;s <br /> Essentials
              </h3>
              <p className="text-gray-500 text-lg font-light leading-relaxed max-w-md">
                Refined style for the modern man. From polished loafers to everyday sneakers, find your signature look.
              </p>
              <Link
                href="/products?gender=MEN"
                className="inline-block bg-[#E9D5FF] text-[#6B21A8] px-12 py-5 text-sm font-black uppercase tracking-[0.2em] hover:bg-[#6B21A8] hover:text-white transition-all duration-300 shadow-xl"
              >
                Shop Men
              </Link>
            </ScrollAnimate>
          </div>
        </div>
      </section>

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

      {/* Shop By Collection Slider - Men */}
      {menCollections.length > 0 && (
        <SliderSection 
          title="Shop By Collection" 
          subtitle="Crafted For Him" 
          viewAllLink="/products?gender=MEN"
          accentColor="#6B21A8"
          itemWidth="min-w-[280px] md:min-w-[380px]"
        >
          {menCollections.map((collection, index) => (
            <CollectionCard key={collection.id} collection={collection} index={index} />
          ))}
        </SliderSection>
      )}

      {/* Trending Products Slider */}
      <SliderSection 
        title="Trending Now" 
        subtitle="Most Wanted" 
        viewAllLink="/products"
        accentColor="#B45309"
      >
        {productList.filter(p => p.isTrending).map((product, index) => (
          <GlobalProductCard key={product.id} product={product} index={index} />
        ))}
      </SliderSection>

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
