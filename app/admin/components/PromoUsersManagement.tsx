'use client';

import { useEffect, useState } from 'react';
import AccountModal, { AuthUser, AuthMode } from '@/app/components/AccountModal';

interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  validUntil: string;
  createdAt: string;
  influencer?: {
    id: string;
    defaultPrefix: string;
    commissionRate: string;
    user: {
      name: string | null;
  email: string;
    };
  } | null;
}

interface Influencer {
  id: string;
  defaultPrefix: string;
  commissionRate: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    promoCodes: number;
  };
}

const randomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'STYLE-';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
};

export default function PromoUsersManagement() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [promoCodeStatus, setPromoCodeStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [influencerStatus, setInfluencerStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [isPromoCodesLoading, setIsPromoCodesLoading] = useState(true);
  const [isSavingPromoCode, setIsSavingPromoCode] = useState(false);
  const [isLoadingInfluencers, setIsLoadingInfluencers] = useState(true);
  const [isInfluencerModalOpen, setIsInfluencerModalOpen] = useState(false);
  const [influencerModalMode, setInfluencerModalMode] = useState<AuthMode>('register');

  const [promoCodeForm, setPromoCodeForm] = useState({
    code: '',
    validUntil: '',
    discountPercent: '',
    influencerId: '',
    prefix: '',
  });


  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsPromoCodesLoading(true);
        setIsLoadingInfluencers(true);
        const [codesResponse, influencersResponse] = await Promise.all([
          fetch('/api/promo-codes', { cache: 'no-store' }),
          fetch('/api/influencers', { cache: 'no-store' }),
        ]);

        if (!codesResponse.ok) {
          const payload = await codesResponse.json();
          throw new Error(payload.error || 'Failed to load promo codes.');
        }

        if (!influencersResponse.ok) {
          const payload = await influencersResponse.json();
          throw new Error(payload.error || 'Failed to load influencers.');
        }

        const codesData = await codesResponse.json();
        const influencerData = await influencersResponse.json();
        setPromoCodes(codesData.codes ?? []);
        setInfluencers(influencerData.influencers ?? []);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load data.';
        setPromoCodeStatus({ type: 'error', message });
        setInfluencerStatus({ type: 'error', message });
      } finally {
        setIsPromoCodesLoading(false);
        setIsLoadingInfluencers(false);
      }
    };

    fetchAll();
  }, []);

  const handleCreatePromoCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setPromoCodeStatus({ type: 'idle', message: '' });

    if (!promoCodeForm.validUntil) {
      setPromoCodeStatus({ type: 'error', message: 'Please select a validity date.' });
      return;
    }

    const discountValue = parseInt(promoCodeForm.discountPercent, 10);
    if (Number.isNaN(discountValue) || discountValue <= 0 || discountValue > 100) {
      setPromoCodeStatus({ type: 'error', message: 'Discount must be between 1 and 100%.' });
      return;
    }

    setIsSavingPromoCode(true);

    try {
      const payload = {
        code: promoCodeForm.code || undefined,
        validUntil: promoCodeForm.validUntil,
        discountPercent: discountValue,
        influencerId: promoCodeForm.influencerId || undefined,
        prefix: promoCodeForm.prefix || undefined,
      };

      const response = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.code) {
        throw new Error(data.error || 'Failed to save promo code.');
      }

      setPromoCodes((prev) => [data.code as PromoCode, ...prev]);
      setPromoCodeStatus({ type: 'success', message: 'Promo code saved successfully.' });
      setPromoCodeForm({
        code: '',
        validUntil: '',
        discountPercent: '',
        influencerId: '',
        prefix: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save promo code.';
      setPromoCodeStatus({ type: 'error', message });
    } finally {
      setIsSavingPromoCode(false);
    }
  };

  const handleInfluencerAuthSuccess = async (user: AuthUser) => {
    // Refresh influencers list after successful registration
    try {
      const response = await fetch('/api/influencers', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setInfluencers(data.influencers ?? []);
      }
    } catch (error) {
      console.error('Failed to refresh influencers:', error);
    }
    setIsInfluencerModalOpen(false);
  };

  const selectedInfluencer = promoCodeForm.influencerId
    ? influencers.find((inf) => inf.id === promoCodeForm.influencerId)
    : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Promo & Influencer Management</h2>
          <p className="text-sm text-gray-600 mt-2">
            Generate promo codes, track influencer performance, and manage campaigns.
          </p>
        </div>
        <button
          onClick={() => {
            setInfluencerModalMode('register');
            setIsInfluencerModalOpen(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
        >
          + Add Influencer
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Promo Codes</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">Generate & Track Campaign Codes</h3>
            <p className="text-sm text-gray-600 mt-1">
              Admin-only code generation. Select an influencer to auto-generate their next code.
            </p>
          </div>
          <button
            onClick={() =>
              setPromoCodeForm((prev) => ({ ...prev, code: randomCode(), influencerId: '', prefix: '' }))
            }
            className="self-start md:self-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
          >
            Generate Random Code
          </button>
        </div>

        <form onSubmit={handleCreatePromoCode} className="grid md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Promo Code</label>
            <input
              type="text"
              value={promoCodeForm.code}
              onChange={(e) => setPromoCodeForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg text-gray-900 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-slate-400 uppercase disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder={selectedInfluencer ? `${selectedInfluencer.defaultPrefix}_AUTO` : 'STYLE-XXXXX'}
              disabled={!!selectedInfluencer}
            />
            <p className="text-xs text-gray-600 mt-2">
              {selectedInfluencer
                ? 'Code will be auto-generated using the influencer prefix.'
                : 'Enter a custom code or click "Generate Random Code".'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Assign to Influencer (optional)</label>
            <select
              value={promoCodeForm.influencerId}
              onChange={(e) =>
                setPromoCodeForm((prev) => ({
                  ...prev,
                  influencerId: e.target.value,
                  code: e.target.value ? '' : prev.code,
                }))
              }
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-slate-400"
            >
              <option value="">General Campaign</option>
              {influencers.map((inf) => (
                <option key={inf.id} value={inf.id}>
                  {inf.user.name || inf.user.email} ({inf.defaultPrefix})
                </option>
              ))}
            </select>
          </div>
          {!selectedInfluencer && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Prefix (optional)</label>
              <input
                type="text"
                value={promoCodeForm.prefix}
                onChange={(e) => setPromoCodeForm((prev) => ({ ...prev, prefix: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg text-gray-900 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-slate-400 uppercase"
                placeholder="FOOT_GEN"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Validity *</label>
            <input
              type="date"
              required
              value={promoCodeForm.validUntil}
              onChange={(e) => setPromoCodeForm((prev) => ({ ...prev, validUntil: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-slate-400"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Discount Percentage (%) *</label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={promoCodeForm.discountPercent}
              onChange={(e) => setPromoCodeForm((prev) => ({ ...prev, discountPercent: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg text-gray-900 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-slate-400"
              placeholder="e.g. 20"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSavingPromoCode}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-60"
            >
              {isSavingPromoCode ? 'Saving...' : 'Save Promo Code'}
            </button>
          </div>
        </form>

        {promoCodeStatus.type !== 'idle' && (
          <div
            className={`p-4 rounded-lg text-sm font-medium mb-4 ${
              promoCodeStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {promoCodeStatus.message}
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
            <h4 className="text-lg font-semibold text-gray-900">Promo Codes Table</h4>
            <span className="text-sm text-gray-600 font-medium">
              Total Codes: {isPromoCodesLoading ? '...' : promoCodes.length}
            </span>
          </div>

          {isPromoCodesLoading ? (
            <div className="p-6 text-center text-gray-500">Loading promo codes...</div>
          ) : promoCodes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No promo codes generated yet. Use the generator above to create your first code.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Promo Code</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Influencer</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Discount (%)</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Valid Till</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {promoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-white transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded">{promo.code}</span>
                      </td>
                      <td className="px-6 py-3">
                        {promo.influencer ? (
                          <div>
                            <p className="font-semibold text-gray-900">{promo.influencer.user.name || promo.influencer.user.email}</p>
                            <p className="text-xs text-gray-600">{promo.influencer.defaultPrefix}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600 font-medium">General</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-900 font-semibold">{promo.discountPercent}%</td>
                      <td className="px-6 py-3 text-gray-700">
                        {new Date(promo.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(promo.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Influencers</h3>
            <p className="text-sm text-gray-600 mt-1">Overview of all active promo partners.</p>
          </div>
        </div>

        {isLoadingInfluencers ? (
          <p className="text-gray-600 text-sm">Loading influencers...</p>
        ) : influencers.length === 0 ? (
          <p className="text-gray-600 text-sm">No influencers yet. Create one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Prefix</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Commission</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Promo Codes</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-slate-200">
                {influencers.map((inf) => (
                  <tr key={inf.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-semibold text-gray-900">{inf.user.name || '—'}</td>
                    <td className="px-6 py-3 text-gray-700">{inf.user.email}</td>
                    <td className="px-6 py-3 font-mono text-purple-700 font-semibold">{inf.defaultPrefix}</td>
                    <td className="px-6 py-3 text-gray-900 font-semibold">{(Number(inf.commissionRate) * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3 text-gray-900 font-semibold">{inf._count?.promoCodes ?? 0}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          inf.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {inf.status}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <AccountModal
        isOpen={isInfluencerModalOpen}
        mode={influencerModalMode}
        onClose={() => setIsInfluencerModalOpen(false)}
        onModeChange={setInfluencerModalMode}
        onAuthSuccess={handleInfluencerAuthSuccess}
        preSelectInfluencer={true}
      />
    </div>
  );
}
