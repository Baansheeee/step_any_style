'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import ReviewsSlideshow from "./components/ReviewsSlideshow";
import BannerSlideshow from "./components/BannerSlideshow";
import ScrollAnimate from "./components/ScrollAnimate";
import { formatPKR } from "@/lib/currency";
import type { ProductDTO } from "@/types/product";
import { products as seedProducts } from "./data/products";

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [productList, setProductList] = useState<ProductDTO[]>(() => seedProducts.map(seedToDto));
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

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const bridalProducts = useMemo(
    () => productList.filter((product) => product.collection?.name?.toLowerCase() === 'bridal').slice(0, 3),
    [productList],
  );
  const footwearProducts = useMemo(
    () => productList.filter((product) => product.collection?.name?.toLowerCase() !== 'bridal').slice(0, 3),
    [productList],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <Navbar />

      {/* Banner Slideshow Section */}
      <BannerSlideshow />

      {/* Products Section - Bridal Collection */}
      <section id="products" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimate animation="fade-in" delay="0s">
          <div className="text-center mb-12">
            <h2 id="bridal" className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Luxury Bridal Collection
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Exquisite heels and slippers for your special day, hand-crafted for elegance and comfort.
            </p>
          </div>
          </ScrollAnimate>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {bridalProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                {isFetchingProducts ? 'Loading products...' : 'Bridal items coming soon.'}
              </div>
            ) : (
              bridalProducts.map((product, index) => (
                <ScrollAnimate key={product.id} animation="fade-in" delay={`${index * 0.1}s`}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-purple-100 block group"
                  >
                    <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden relative">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="text-4xl text-purple-200">{product.name.charAt(0)}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 transition-all duration-300"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{product.shortDescription}</p>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {formatPKR(product.price)}
                        </span>
                        <span className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-center">
                          View Details
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollAnimate>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Products Section - Casual & Party Footwear */}
      <section id="footwear" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimate animation="fade-in" delay="0s">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Premium Footwear & Heels
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Step into style with our collection of comfort slippers and high-end heels for every occasion.
            </p>
          </div>
          </ScrollAnimate>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {footwearProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                {isFetchingProducts ? 'Loading products...' : 'Footwear coming soon.'}
              </div>
            ) : (
              footwearProducts.map((product, index) => (
                <ScrollAnimate key={product.id} animation="fade-in" delay={`${index * 0.1}s`}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-pink-100 block group"
                  >
                    <div className="h-64 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden relative">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="text-4xl text-pink-200">{product.name.charAt(0)}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/10 transition-all duration-300"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{product.shortDescription}</p>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPKR(product.price)}
                        </span>
                        <span className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-pink-700 hover:to-pink-700 transition-all font-semibold text-center">
                          View Details
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollAnimate>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimate animation="fade-in" delay="0s">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Why Choose Our Footwear?
            </span>
          </h2>
          </ScrollAnimate>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12">
            <ScrollAnimate animation="fade-in" delay="0s">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all border border-purple-100">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Materials</h3>
              <p className="text-gray-600 text-sm md:text-base">
                We use only the finest velvet, silk, and synthetic leather for a truly luxurious feel.
              </p>
            </div>
            </ScrollAnimate>
            <ScrollAnimate animation="fade-in" delay="0.1s">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all border border-purple-100">
              <div className="text-5xl mb-4">☁️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Maximum Comfort</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Designed with cushioned insoles and ergonomic support to keep you comfortable all day.
              </p>
            </div>
            </ScrollAnimate>
            <ScrollAnimate animation="fade-in" delay="0.2s">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all border border-purple-100">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Exquisite Design</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Each piece is carefully designed to blend modern trends with timeless elegance.
              </p>
            </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimate animation="fade-in" delay="0s">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              About Step & Style
            </span>
          </h2>
          </ScrollAnimate>
          <ScrollAnimate animation="fade-in" delay="0.1s">
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            We are dedicated to providing the highest quality bridal heels, luxury slippers, and party footwear. 
            Our products combine professional craftsmanship with innovative comfort technology, giving you the best 
            experience for your special occasions. Step into luxury with our premium collection.
          </p>
          </ScrollAnimate>
        </div>
      </section>

      {/* Reviews Slideshow Section */}
      <ReviewsSlideshow />

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
            <Image
                src="/IPL logo Main JPG.png"
                alt="Footwear Store Logo"
                width={150}
                height={50}
                className="object-contain mb-4"
              />
              <p className="text-gray-400 text-sm">Luxury footwear for every special moment in your life.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#bridal" className="hover:text-white transition-colors">Bridal Heels</Link></li>
                <li><Link href="#footwear" className="hover:text-white transition-colors">Casual Slippers</Link></li>
                <li><Link href="#products" className="hover:text-white transition-colors">All Products</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Shipping</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Facebook</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Step & Style. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
