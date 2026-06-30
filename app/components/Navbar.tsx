"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import MobileNav from "./MobileNav";
import AccountModal, { AuthMode, AuthUser } from "./AccountModal";
import TopBanner from "./TopBanner";
import CartDrawer from "./CartDrawer";
import { useSaleStatus } from "../hooks/useSaleStatus";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import type { CollectionDTO } from "@/types/product";
import { User, Heart, ShoppingBag } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalMode, setAccountModalMode] = useState<AuthMode>('register');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const { totalCount: cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const isAdmin = authUser?.role === 'ADMIN';
  const isInfluencer = authUser?.role === 'INFLUENCER';
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const saleInfo = useSaleStatus();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (data.user) {
          setAuthUser(data.user);
        }
      } catch {
        // Ignore - user is simply not authenticated
      }
    };

    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        const data = await response.json();
        if (data.success) {
          setCollections(data.collections);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };

    fetchCurrentUser();
    fetchCollections();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAccountModal = useCallback((mode: AuthMode = 'login') => {
    setAccountModalMode(mode);
    setIsAccountModalOpen(true);
    setIsAccountMenuOpen(false);
  }, []);

  const handleAuthSuccess = useCallback((user: AuthUser) => {
    setAuthUser(user);
    setIsAccountModalOpen(false);
    setIsAccountMenuOpen(false);

    // Redirect to respective dashboard based on role
    if (user.role === 'ADMIN') {
      window.location.href = '/admin';
    } else if (user.role === 'INFLUENCER') {
      window.location.href = '/influencer';
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthUser(null);
      setIsAccountMenuOpen(false);
    }
  }, []);

  return (
    <>
      <TopBanner />
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-[#A855F7]/95 backdrop-blur-md shadow-lg shadow-purple-500/20'
        : 'bg-[#A855F7]'
        }`}>
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="group flex items-center -ml-1 sm:-ml-3">
                <Image
                  src="/logo_main.png"
                  alt="Step & Styl"
                  width={400}
                  height={150}
                  className="object-contain h-24 md:h-28 lg:h-32 w-auto transition-all duration-300 group-hover:scale-105 brightness-0 invert origin-left transform scale-125 md:scale-100"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-[2.5] justify-center items-center space-x-4 lg:space-x-6 xl:space-x-8 h-full">
              <Link
                href="/products?gender=WOMEN"
                className="group h-full flex items-center"
              >
                <span className="text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-all border-b-2 border-transparent group-hover:border-yellow-300 py-1">
                  Women
                </span>
              </Link>
              <Link
                href="/products?gender=MEN"
                className="group h-full flex items-center"
              >
                <span className="text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-all border-b-2 border-transparent group-hover:border-yellow-300 py-1">
                  Men
                </span>
              </Link>
              <Link
                href="/kids"
                className="group h-full flex items-center"
              >
                <span className="text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-all border-b-2 border-transparent group-hover:border-yellow-300 py-1">
                  Kids
                </span>
              </Link>
              <Link
                href="/new-arrivals"
                className="group h-full flex items-center"
              >
                <span className="text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-all border-b-2 border-transparent group-hover:border-yellow-300 py-1 whitespace-nowrap">
                  New Arrivals
                </span>
              </Link>

              {/* Dynamic Sale Link */}
              {saleInfo?.show && (
                <Link
                  href="/sales"
                  className="group h-full flex items-center"
                >
                  <span className="text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.2em] text-yellow-300 group-hover:text-yellow-200 transition-all border-b-2 border-transparent group-hover:border-yellow-300 py-1 flex items-center gap-2">
                    Sale
                    <span className="flex h-1.5 w-1.5 rounded-full bg-yellow-300 animate-ping" />
                  </span>
                </Link>
              )}

              <Link
                href="/products"
                className="group h-full flex items-center"
              >
                <span className="text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-all border-b-2 border-transparent group-hover:border-yellow-300 py-1">
                  Shop
                </span>
              </Link>

              {/* Category Dropdown */}
              <div className="relative h-full flex items-center" ref={categoryMenuRef}>
                <button
                  onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                  className="text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.2em] text-white/80 hover:text-white transition-all flex items-center h-full whitespace-nowrap"
                >
                  Category
                  <svg
                    className={`ml-2 w-3 h-3 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCategoryMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white shadow-2xl border border-[#F5F3FF] py-6 z-50 rounded-xl">
                    {collections.length === 0 ? (
                      <span className="block px-8 py-2 text-gray-400 text-[10px] italic uppercase tracking-[0.2em]">No collections</span>
                    ) : (
                      collections.map((coll) => (
                        <Link
                          key={coll.id}
                          href={`/products?collectionId=${coll.id}`}
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="block px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 hover:bg-[#F5F3FF] hover:text-[#6B21A8] transition-colors"
                        >
                          {coll.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/affiliate"
                className="text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.2em] text-yellow-300 hover:text-yellow-200 transition-all bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full flex items-center border border-white/10"
              >
                Affiliate
              </Link>


            </div>

            {/* Icons (Extreme Right) */}
            <div className="hidden md:flex flex-1 justify-end items-center space-x-2 lg:space-x-4 h-full">

              <div className="relative h-full flex items-center" ref={accountMenuRef}>
                <button
                  onClick={authUser ? () => setIsAccountMenuOpen((prev) => !prev) : () => openAccountModal('login')}
                  className="text-white/80 hover:text-white transition-all flex items-center justify-center p-2"
                  title={authUser ? 'Account' : 'Login'}
                >
                  <User size={22} strokeWidth={2} />
                </button>

                {authUser && isAccountMenuOpen && (
                  <div className="absolute right-0 top-full -mt-2 w-64 bg-white shadow-2xl border border-[#F5F3FF] p-8 z-50 rounded-2xl">
                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Authenticated as</p>
                      <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{authUser.name || authUser.email}</p>
                    </div>
                    <div className="space-y-5">
                      {authUser.role === 'ADMIN' && (
                        <Link href="/admin" className="block text-[11px] font-black uppercase tracking-[0.2em] text-[#6B21A8] hover:text-purple-900" onClick={() => setIsAccountMenuOpen(false)}>Admin Console</Link>
                      )}
                      {authUser.role === 'INFLUENCER' && (
                        <Link href="/influencer" className="block text-[11px] font-black uppercase tracking-[0.2em] text-[#6B21A8] hover:text-purple-900" onClick={() => setIsAccountMenuOpen(false)}>Dashboard</Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left text-[11px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-700">Sign Out</button>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/wishlist"
                className="relative flex items-center group p-2 text-white/80 hover:text-white transition-all"
                title="Wishlist"
              >
                <Heart size={22} strokeWidth={2} />
                {wishlistCount > 0 && (
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-yellow-300 text-[#A855F7] text-[10px] flex items-center justify-center rounded-full font-black group-hover:bg-white transition-colors">
                    {wishlistCount}
                  </div>
                )}
              </Link>

              <button
                className="relative flex items-center group p-2 text-white/80 hover:text-white transition-all"
                onClick={() => setIsCartOpen(true)}
                title="Cart"
              >
                <ShoppingBag size={22} strokeWidth={2} />
                {cartCount > 0 && (
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-yellow-300 text-[#A855F7] text-[10px] flex items-center justify-center rounded-full font-black group-hover:bg-white transition-colors">
                    {cartCount}
                  </div>
                )}
              </button>
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden flex-1 flex justify-end">
              <MobileNav
                onOpenAccount={openAccountModal}
                onOpenCart={() => setIsCartOpen(true)}
                isAuthenticated={!!authUser}
                isAdmin={isAdmin}
                isInfluencer={isInfluencer}
                cartCount={cartCount}
                onLogout={handleLogout}
                collections={collections}
              />
            </div>
          </div>
        </div>
      </nav>

      <AccountModal
        isOpen={isAccountModalOpen}
        mode={accountModalMode}
        onClose={() => setIsAccountModalOpen(false)}
        onModeChange={(mode) => setAccountModalMode(mode)}
        onAuthSuccess={handleAuthSuccess}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        currentUserRole={authUser?.role ?? null}
      />
    </>
  );
}
