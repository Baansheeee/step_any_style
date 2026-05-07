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
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/98 backdrop-blur-lg border-b border-purple-200 shadow-lg' 
          : 'bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo with Animation */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-2.5 group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-300 transform group-hover:scale-105 shadow-md group-hover:shadow-lg">
                    <Image
                      src="/IPL logo Main JPG.png"
                      alt="Step & Style - Premium Footwear"
                      width={140}
                      height={45}
                      className="object-contain h-10 w-auto transition-transform duration-300 group-hover:scale-110"
                      priority
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link
                href="#products"
                className="text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 relative group py-2"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </Link>

              {/* Category Dropdown */}
              <div className="relative" ref={categoryMenuRef}>
                <button
                  onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                  className="text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 relative group py-2"
                >
                  Category
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                  <svg
                    className={`ml-1 inline-block w-4 h-4 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCategoryMenuOpen && (
                  <div className="absolute left-0 mt-3 w-48 rounded-2xl bg-white shadow-xl border border-purple-100 p-2 space-y-1 z-50">
                    {collections.length === 0 ? (
                      <span className="block px-4 py-2 text-gray-400 text-xs italic">No collections</span>
                    ) : (
                      collections.map((coll) => (
                        <Link
                          key={coll.id}
                          href={`/#${coll.slug}`}
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                        >
                          {coll.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {['features', 'about'].map((href) => (
                <Link
                  key={href}
                  href={`#${href}`}
                  className="text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 relative group py-2"
                >
                  {href.charAt(0).toUpperCase() + href.slice(1)}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
              <Link
                href="/affiliate"
                className="text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 relative group py-2"
              >
                Affiliate Program
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </Link>

              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={authUser ? () => setIsAccountMenuOpen((prev) => !prev) : () => openAccountModal('register')}
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-all duration-300 relative group py-2"
                >
                  {authUser
                    ? `Account (${authUser.role === 'ADMIN' ? 'Admin' : authUser.role === 'INFLUENCER' ? 'Influencer' : 'User'})`
                    : 'Account'}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                </button>

                {authUser && isAccountMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white shadow-xl border border-purple-100 p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="font-semibold text-gray-800">{authUser.name || authUser.email}</p>
                      <p className="text-xs text-purple-600 font-medium mt-1">{authUser.role === 'ADMIN' ? 'Administrator' : 'Customer'}</p>
                    </div>
                    {authUser.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Go to Admin Dashboard
                      </Link>
                    )}
                    {authUser.role === 'INFLUENCER' && (
                      <Link
                        href="/influencer"
                        className="block text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Go to Influencer Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-sm font-semibold text-red-500 hover:text-red-600 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95 relative overflow-hidden group"
                onClick={() => setIsCartDrawerOpen(true)}
              >
                <span className="relative z-10">Cart ({cartCount})</span>
                <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>

            {/* Mobile Navigation Button */}
            <MobileNav
              onOpenAccount={openAccountModal}
              onOpenCart={() => setIsCartDrawerOpen(true)}
              isAuthenticated={!!authUser}
              isAdmin={isAdmin}
              isInfluencer={isInfluencer}
              cartCount={cartCount}
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
