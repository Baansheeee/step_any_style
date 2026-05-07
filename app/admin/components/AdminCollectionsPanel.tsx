'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { CollectionDTO } from '@/types/product';

interface CollectionFormState {
  name: string;
  slug: string;
  description: string;
  image: string;
}

const defaultFormState: CollectionFormState = {
  name: '',
  slug: '',
  description: '',
  image: '',
};

export default function AdminCollectionsPanel() {
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formValues, setFormValues] = useState<CollectionFormState>(defaultFormState);
  const [selectedCollection, setSelectedCollection] = useState<CollectionDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/collections');
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load collections.');
      }
      setCollections(payload.collections || []);
    } catch (error) {
      console.error('Failed to fetch collections', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load collections.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedCollection(null);
    setFormValues(defaultFormState);
    setIsModalOpen(true);
    setStatus({ type: 'idle', message: '' });
  };

  const openEditModal = (collection: CollectionDTO) => {
    setModalMode('edit');
    setSelectedCollection(collection);
    setFormValues({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      image: collection.image || '',
    });
    setIsModalOpen(true);
    setStatus({ type: 'idle', message: '' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormValues(defaultFormState);
    setSelectedCollection(null);
    setStatus({ type: 'idle', message: '' });
  };

  const handleInputChange = (key: keyof CollectionFormState, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const endpoint =
        modalMode === 'edit' && selectedCollection
          ? `/api/collections/${selectedCollection.id}`
          : '/api/collections';

      const method = modalMode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save collection.');
      }

      setStatus({ type: 'success', message: 'Collection saved successfully.' });
      closeModal();
      fetchCollections();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save collection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection? This will fail if products are linked to it.')) {
      return;
    }

    setIsDeletingId(id);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete collection.');
      }

      setStatus({ type: 'success', message: 'Collection deleted successfully.' });
      fetchCollections();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete collection.',
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collections Management</h2>
          <p className="text-sm text-gray-500">
            Organize your products into collections (e.g., Slippers, Bridal, Heels).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
        >
          + Add Collection
        </button>
      </div>

      {status.type !== 'idle' && (
        <div
          className={`rounded-lg p-4 text-sm ${
            status.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {status.message}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          Loading collections...
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          No collections found. Create your first collection to start organizing products.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col h-full">
              <div className="w-full h-32 bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                {collection.image ? (
                  <Image src={collection.image} alt={collection.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{collection.name}</h3>
                <p className="text-xs text-purple-600 font-mono">/{collection.slug}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{collection.description || 'No description provided.'}</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-600 text-black rounded-lg hover:bg-gray-400 font-medium"
                  onClick={() => openEditModal(collection)}
                >
                  Edit
                </button>
                <button
                  className="flex-1 px-3 py-1.5 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-400 font-medium disabled:opacity-60"
                  onClick={() => handleDelete(collection.id)}
                  disabled={isDeletingId === collection.id}
                >
                  {isDeletingId === collection.id ? 'Deleting...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? 'Add Collection' : 'Edit Collection'}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Collection Name *</label>
                <input
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(e) => {
                    handleInputChange('name', e.target.value);
                    if (modalMode === 'create') {
                      handleInputChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400"
                  placeholder="e.g. Bridal Heels"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  required
                  value={formValues.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400"
                  placeholder="bridal-heels"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  value={formValues.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400"
                  placeholder="/collections/heels.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formValues.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder:text-slate-500 hover:border-slate-400 resize-none"
                  rows={3}
                  placeholder="Describe this footwear collection..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Collection' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
