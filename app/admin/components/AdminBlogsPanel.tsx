'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Blog {
  id: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
  author?: string;
  category?: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminBlogsPanel() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({
    type: 'idle',
    message: '',
  });

  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data.user?.role === 'ADMIN') {
            setAuthToken('admin-token');
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    };

    fetchAuthToken();
  }, []);

  useEffect(() => {
    if (!authToken) return;

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/blogs', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        setBlogs(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [authToken]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    setIsDeletingId(id);
    setDeleteStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }

      setBlogs(blogs.filter(blog => blog.id !== id));
      setDeleteStatus({ type: 'success', message: 'Blog deleted successfully' });
    } catch (err) {
      setDeleteStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete blog',
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
          <p className="text-sm text-gray-500">
            Create and manage blog posts with images, videos, and rich content.
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
        >
          + New Blog
        </Link>
      </div>

      {deleteStatus.type !== 'idle' && (
        <div
          className={`rounded-lg p-4 text-sm ${
            deleteStatus.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {deleteStatus.message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          Loading blogs...
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          <p className="mb-4">No blogs created yet</p>
          <Link
            href="/admin/blogs/new"
            className="text-purple-600 hover:text-purple-700 font-bold"
          >
            Create your first blog
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col h-full">
              <div className="w-full h-40 bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                {blog.image ? (
                  <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{blog.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap ${
                    blog.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-purple-600 font-mono">/{blog.slug}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{blog.description || 'No description provided.'}</p>
                <div className="flex gap-2 text-xs text-gray-500 pt-2">
                  {blog.author && <span>By {blog.author}</span>}
                  {blog.category && <span>•</span>}
                  {blog.category && <span>{blog.category}</span>}
                </div>
                <p className="text-xs text-gray-400">Created: {formatDate(blog.createdAt)}</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 justify-center">
                <Link
                  href={`/admin/blogs/${blog.id}`}
                  className="px-6 py-1.5 text-sm border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition"
                >
                  Edit
                </Link>
                <button
                  className="px-3 py-1.5 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-60 transition"
                  onClick={() => handleDelete(blog.id)}
                  disabled={isDeletingId === blog.id}
                >
                  {isDeletingId === blog.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
