import { useState, useEffect } from 'react';

export function useSaleStatus() {
  const [saleInfo, setSaleInfo] = useState<{ show: boolean; bannerText: string } | null>(null);

  useEffect(() => {
    const checkSale = async () => {
      try {
        const res = await fetch('/api/sale-status', { cache: 'no-store' });
        const data = await res.json();
        setSaleInfo(data);
      } catch (error) {
        console.error('Failed to check sale status', error);
      }
    };
    checkSale();
  }, []);

  return saleInfo;
}
