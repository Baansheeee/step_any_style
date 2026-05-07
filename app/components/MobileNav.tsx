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
        className="md:hidden p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition"
        aria-label="Toggle menu"
      >
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          strokeWidth="2"
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
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FULL SOLID SIDE BAR */}
      <div
  className={`
    fixed top-0 left-0 
    h-screen w-72 
    bg-purple-700 
    text-white 
    shadow-2xl 
    z-50 
    transition-transform duration-300 
    md:hidden
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `}
>

        <div className="flex flex-col h-full p-6">

          {/* Logo + Close */}
          <div className="flex justify-between items-center mb-8">
            <Image
              src="/IPL logo Main JPG.png"
              alt="Step & Style Logo"
              width={120}
              height={40}
              className="h-10 object-contain"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-purple-600 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 flex-1">
            <Link
              href="#products"
              onClick={() => setIsOpen(false)}
              className="text-lg p-3 hover:bg-purple-600 rounded"
            >
              Products
            </Link>

            {/* Category Dropdown */}
            <div>
              <button
                onClick={() => setIsCategoryOpen((prev) => !prev)}
                className="w-full text-left text-lg p-3 hover:bg-purple-600 rounded flex items-center justify-between"
              >
                <span>Category</span>
                <svg
                  className={`w-5 h-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCategoryOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="#bridal"
                    onClick={() => {
                      setIsOpen(false);
                      setIsCategoryOpen(false);
                    }}
                    className="block text-base p-2 hover:bg-purple-600 rounded"
                  >
                    Bridal
                  </Link>
                  <Link
                    href="#footwear"
                    onClick={() => {
                      setIsOpen(false);
                      setIsCategoryOpen(false);
                    }}
                    className="block text-base p-2 hover:bg-purple-600 rounded"
                  >
                    Casual & Heels
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="#features"
              onClick={() => setIsOpen(false)}
              className="text-lg p-3 hover:bg-purple-600 rounded"
            >
              Features
            </Link>

            <Link
              href="#about"
              onClick={() => setIsOpen(false)}
              className="text-lg p-3 hover:bg-purple-600 rounded"
            >
              About
            </Link>

            <Link
              href="/affiliate"
              onClick={() => setIsOpen(false)}
              className="text-lg p-3 hover:bg-purple-600 rounded"
            >
              Affiliate Program
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="text-lg p-3 border border-white/40 rounded hover:bg-purple-600"
              >
                Admin Dashboard
              </Link>
            )}
            {isInfluencer && (
              <Link
                href="/influencer"
                onClick={() => setIsOpen(false)}
                className="text-lg p-3 border border-white/40 rounded hover:bg-purple-600"
              >
                Influencer Dashboard
              </Link>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAccount('register');
              }}
              className="text-lg p-3 border border-white/40 rounded hover:bg-purple-600 text-left"
            >
              {isAuthenticated ? 'My Account' : 'Login / Register'}
            </button>
          </nav>

          {/* Cart Button */}
          <button
            className="w-full bg-white text-purple-700 font-semibold py-3 mt-6 rounded-full shadow hover:bg-gray-100 transition"
            onClick={() => {
              setIsOpen(false);
              onOpenCart();
            }}
          >
            Cart ({cartCount})
          </button>
        </div>
      </div>
    </>
  );
}
