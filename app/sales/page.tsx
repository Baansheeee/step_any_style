import { prisma } from '@/lib/prisma';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { serializeProduct } from '@/lib/products';
import ProductCard from '../products/components/ProductCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flash Sale - Premium Footwear Deals | Step & Styl',
  description: 'Limited time offers on premium bridal heels, slippers, and more. Shop our exclusive sale collection now.',
};

export default async function SalesPage() {
  // Fetch active sale event to filter only targeted products
  const activeEvent = await prisma.saleEvent.findFirst({
    where: { isActive: true }
  });

  let productsRaw: any[] = [];

  if (activeEvent) {
    const targetCollections = (activeEvent.targetCollections as string[]) || [];
    const targetProducts = (activeEvent.targetProducts as string[]) || [];

    const orConditions: any[] = [];
    if (targetCollections.length > 0) {
      orConditions.push({ collectionId: { in: targetCollections } });
    }
    if (targetProducts.length > 0) {
      orConditions.push({ id: { in: targetProducts } });
    }

    if (orConditions.length > 0) {
      productsRaw = await prisma.product.findMany({
        where: { OR: orConditions },
        orderBy: { createdAt: 'desc' },
        include: { collection: true }
      });
    } else {
      productsRaw = [];
    }
  } else {
    // Fallback if no active event is present, though the page shouldn't normally be linked
    productsRaw = await prisma.product.findMany({
      where: {
        discount: { gt: 0 }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        collection: true
      }
    });
  }

  const saleProducts = productsRaw.map(serializeProduct);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-24 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 mb-6">
              <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600">Limited Collection</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-gray-900 mb-4 text-center">
              Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B21A8] to-[#A855F7]">Deals</span>
            </h1>
            <div className="h-1 w-12 bg-gray-900 mb-6" />
            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-center max-w-xl leading-relaxed">
              Premium comfort meets unbelievable prices. Discover our curated collection of discounted favorites.
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        {saleProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {saleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-widest">No Active Sales</h2>
            <p className="text-gray-500 text-sm font-medium tracking-wide">Stay tuned for our upcoming promotional events.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
