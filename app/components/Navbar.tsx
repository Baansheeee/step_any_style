import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import MobileNav from "./MobileNav";
import AccountModal, { AuthMode, AuthUser } from "./AccountModal";
import CartDrawer from "./CartDrawer";
import { useCart } from "@/app/context/CartContext";
import type { CollectionDTO } from "@/types/product";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalMode, setAccountModalMode] = useState<AuthMode>('register');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const { totalCount: cartCount } = useCart();
  const isAdmin = authUser?.role === 'ADMIN';
  const isInfluencer = authUser?.role === 'INFLUENCER';
  const [collections, setCollections] = useState<CollectionDTO[]>([]);

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
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
        : 'bg-white border-b border-transparent'
        }`}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-20">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center -ml-3 sm:-ml-6 md:-ml-12">
              <Link href="/" className="group flex items-center justify-center">
                <Image
                  src="/main_logo.png"
                  alt="Step & Style"
                  width={240}
                  height={80}
                  className="object-contain h-16 md:h-24 w-auto transition-all duration-300 group-hover:scale-105"
                  priority
                />
                <div className="flex items-center -ml-6 md:-ml-10 gap-1">
                  <span className="text-[11px] md:text-[15px] font-black uppercase tracking-[0.2em] text-gray-900 transition-all group-hover:text-[#6B21A8]">
                    Step
                  </span>
                  <span className="text-[14px] md:text-[18px] font-black uppercase tracking-[0.2em] text-yellow-600 transition-all">
                    &
                  </span>
                  <span className="text-[11px] md:text-[15px] font-black uppercase tracking-[0.2em] text-gray-900 transition-all group-hover:text-[#6B21A8]">
                    Style
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 ml-16 h-full">
              <Link
                href="/products?gender=WOMEN"
                className="group h-full flex items-center"
              >
                <span className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 group-hover:text-[#6B21A8] transition-all border-b-2 border-transparent group-hover:border-[#A855F7] py-1">
                  Women
                </span>
              </Link>
              <Link
                href="/products?gender=MEN"
                className="group h-full flex items-center"
              >
                <span className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 group-hover:text-[#6B21A8] transition-all border-b-2 border-transparent group-hover:border-[#A855F7] py-1">
                  Men
                </span>
              </Link>
              <Link
                href="/products"
                className="group h-full flex items-center"
              >
                <span className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 group-hover:text-[#6B21A8] transition-all border-b-2 border-transparent group-hover:border-[#A855F7] py-1">
                  Products
                </span>
              </Link>

              {/* Category Dropdown */}
              <div className="relative h-full flex items-center" ref={categoryMenuRef}>
                <button
                  onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                  className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-[#6B21A8] transition-all flex items-center h-full"
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
                className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6B21A8] hover:text-purple-900 transition-all bg-purple-50 px-4 py-2 rounded-full flex items-center"
              >
                Affiliate
              </Link>


              <div className="h-4 w-[1px] bg-gray-200 mx-2" />

              <div className="relative h-full flex items-center" ref={accountMenuRef}>
                <button
                  onClick={authUser ? () => setIsAccountMenuOpen((prev) => !prev) : () => openAccountModal('login')}
                  className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-[#6B21A8] transition-all h-full flex items-center"
                >
                  {authUser ? 'Account' : 'Login'}
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

              <button
                className="relative flex items-center group h-full"
                onClick={() => setIsCartDrawerOpen(true)}
              >
                <span className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 group-hover:text-[#6B21A8] transition-all">Cart</span>
                <div className="ml-2 w-6 h-6 bg-[#E9D5FF] text-[#6B21A8] text-[10px] flex items-center justify-center rounded-full font-black group-hover:bg-[#6B21A8] group-hover:text-white transition-colors">
                  {cartCount}
                </div>
              </button>
            </div>

            {/* Mobile Nav */}
            <MobileNav
              onOpenAccount={openAccountModal}
              onOpenCart={() => setIsCartDrawerOpen(true)}
              isAuthenticated={!!authUser}
              isAdmin={isAdmin}
              isInfluencer={isInfluencer}
              cartCount={cartCount}
              onLogout={handleLogout}
            />
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
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        currentUserRole={authUser?.role ?? null}
      />
    </>
  );
}
