'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MobileNavProps {
  onOpenAccount: (mode?: 'login' | 'register') => void;
  onOpenCart: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInfluencer: boolean;
  cartCount: number;
}

export default function MobileNav({
  onOpenAccount,
  onOpenCart,
  isAuthenticated,
  isAdmin,
  isInfluencer,
  cartCount,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg text-lavender-dark hover:bg-lavender-light transition"
        aria-label="Toggle menu"
      >
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          strokeWidth="2.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-lavender-dark/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FULL SOLID SIDE BAR */}
      <div
  className={`
    fixed top-0 left-0 
    h-screen w-[85vw] sm:w-80 
    bg-white 
    text-gray-900 
    shadow-2xl 
    z-50 
    transition-transform duration-500 ease-in-out
    md:hidden
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `}
>

        <div className="flex flex-col h-full p-8">

          {/* Logo + Close */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center">
              <Image
                src="/main_logo.png"
                alt="Step & Style Logo"
                width={140}
                height={45}
                className="h-10 object-contain"
              />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 -ml-2">
                Step & Style
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-lavender-light transition-all"
            >
              <svg
                className="w-6 h-6 text-lavender-dark"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="text-sm font-black uppercase tracking-[0.2em] p-4 hover:bg-lavender-light hover:text-lavender-dark rounded-xl transition-all"
            >
              All Products
            </Link>

            <Link
              href="/products?gender=WOMEN"
              onClick={() => setIsOpen(false)}
              className="text-sm font-black uppercase tracking-[0.2em] p-4 hover:bg-lavender-light hover:text-lavender-dark rounded-xl transition-all"
            >
              Women
            </Link>

            <Link
              href="/products?gender=MEN"
              onClick={() => setIsOpen(false)}
              className="text-sm font-black uppercase tracking-[0.2em] p-4 hover:bg-lavender-light hover:text-lavender-dark rounded-xl transition-all"
            >
              Men
            </Link>

            {/* Category Dropdown */}
            <div>
              <button
                onClick={() => setIsCategoryOpen((prev) => !prev)}
                className="w-full text-left text-sm font-black uppercase tracking-[0.2em] p-4 hover:bg-lavender-light hover:text-lavender-dark rounded-xl flex items-center justify-between transition-all"
              >
                <span>Collections</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCategoryOpen && (
                <div className="ml-4 mt-2 space-y-1 border-l-2 border-lavender-light pl-4">
                  <Link
                    href="/products?collectionId=bridal"
                    onClick={() => {
                      setIsOpen(false);
                      setIsCategoryOpen(false);
                    }}
                    className="block text-xs font-bold uppercase tracking-widest p-3 hover:text-lavender-dark transition-colors"
                  >
                    Bridal
                  </Link>
                  <Link
                    href="/products?collectionId=heels"
                    onClick={() => {
                      setIsOpen(false);
                      setIsCategoryOpen(false);
                    }}
                    className="block text-xs font-bold uppercase tracking-widest p-3 hover:text-lavender-dark transition-colors"
                  >
                    Casual & Heels
                  </Link>
                </div>
              )}
            </div>

            <div className="h-[1px] bg-lavender-light my-4 mx-4" />

            <Link
              href="/#about"
              onClick={() => setIsOpen(false)}
              className="text-sm font-black uppercase tracking-[0.2em] p-4 hover:bg-lavender-light hover:text-lavender-dark rounded-xl transition-all"
            >
              Our Story
            </Link>

            <Link
              href="/affiliate"
              onClick={() => setIsOpen(false)}
              className="text-sm font-black uppercase tracking-[0.2em] p-4 text-[#6B21A8] bg-[#F5F3FF] rounded-xl transition-all"
            >
              Affiliate
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="text-sm font-black uppercase tracking-[0.2em] p-4 bg-lavender-light text-lavender-dark rounded-xl hover:bg-lavender-main transition-all"
              >
                Admin Console
              </Link>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAccount('login');
              }}
              className="text-sm font-black uppercase tracking-[0.2em] p-4 border border-lavender-main rounded-xl hover:bg-lavender-light transition-all text-left"
            >
              {isAuthenticated ? 'My Account' : 'Sign In'}
            </button>
          </nav>

          {/* Cart Button */}
          <button
            className="w-full bg-lavender-dark text-white font-black uppercase tracking-[0.2em] py-5 mt-8 rounded-2xl shadow-xl hover:bg-[#110C1F] transition-all"
            onClick={() => {
              setIsOpen(false);
              onOpenCart();
            }}
          >
            My Cart ({cartCount})
          </button>
        </div>
      </div>
    </>
  );
}
