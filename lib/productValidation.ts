import type { ProductPayload } from '@/types/product';

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter((entry) => entry.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
};

const toObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return {};
    }
  }

  return {};
};

export function parseProductPayload(
  body: any,
  {
    requireSlug = true,
    allowPartial = false,
  }: {
    requireSlug?: boolean;
    allowPartial?: boolean;
  } = {},
): { data: ProductPayload; error?: string } {
  if (!body || typeof body !== 'object') {
    return { data: {}, error: 'Invalid payload.' };
  }

  const data: ProductPayload = {};

  if (requireSlug && (body.slug === undefined || body.slug === null || String(body.slug).trim() === '')) {
    return { data: {}, error: 'Slug is required.' };
  }

  if (body.slug !== undefined && body.slug !== null) {
    const rawSlug = String(body.slug).trim();
    if (!rawSlug) {
      if (requireSlug) return { data: {}, error: 'Slug is required.' };
    } else {
      const normalized = toSlug(rawSlug);
      if (!normalized) {
        return { data: {}, error: 'Slug must contain alphanumeric characters.' };
      }
      data.slug = normalized;
    }
  }

  const requiredFields: Array<{ key: keyof ProductPayload; label: string }> = [
    { key: 'name', label: 'Product name' },
    { key: 'description', label: 'Description' },
    { key: 'shortDescription', label: 'Short description' },
  ];

  for (const field of requiredFields) {
    if (body[field.key] !== undefined) {
      const value = String(body[field.key]).trim();
      if (!value) {
        return { data: {}, error: `${field.label} cannot be empty.` };
      }
      (data as any)[field.key] = value;
    } else if (!allowPartial) {
      return { data: {}, error: `${field.label} is required.` };
    }
  }

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (Number.isNaN(price) || price <= 0) {
      return { data: {}, error: 'Price must be a positive number.' };
    }
    data.price = price;
  } else if (!allowPartial) {
    return { data: {}, error: 'Price is required.' };
  }

  if (body.originalPrice !== undefined && body.originalPrice !== null && body.originalPrice !== '') {
    const originalPrice = Number(body.originalPrice);
    if (Number.isNaN(originalPrice) || originalPrice <= 0) {
      return { data: {}, error: 'Original price must be a positive number.' };
    }
    data.originalPrice = originalPrice;
  } else if (body.originalPrice === null || body.originalPrice === '') {
    data.originalPrice = null;
  }
  
  if (body.discount !== undefined && body.discount !== null && body.discount !== '') {
    const discount = Number(body.discount);
    if (Number.isNaN(discount) || discount < 0) {
      return { data: {}, error: 'Discount must be a non-negative number.' };
    }
    data.discount = discount;
  } else {
    data.discount = 0;
  }

  if (body.inStock !== undefined) {
    data.inStock = Boolean(body.inStock);
  }

  if (body.image !== undefined) {
    const imageValue = String(body.image ?? '').trim();
    data.image = imageValue ? imageValue : null;
  }

  if (body.images !== undefined) {
    data.images = toStringArray(body.images);
  }

  if (body.videoUrl !== undefined) {
    const videoValue = String(body.videoUrl ?? '').trim();
    data.videoUrl = videoValue ? videoValue : null;
  }

  if (body.advantages !== undefined) {
    data.advantages = toStringArray(body.advantages);
  }

  if (body.features !== undefined) {
    data.features = toStringArray(body.features);
  }

  if (body.specifications !== undefined) {
    data.specifications = toObject(body.specifications);
  }

  if (body.variants !== undefined && Array.isArray(body.variants)) {
    data.variants = body.variants.map((v: any) => ({
      id: String(v.id || Date.now()),
      color: String(v.color || '').trim(),
      size: String(v.size || '').trim(),
      stock: Number(v.stock) || 0,
    })).filter((v: any) => v.color && v.size && v.stock > 0);
  }

  if (body.collectionId !== undefined) {
    const collId = String(body.collectionId ?? '').trim();
    data.collectionId = collId || null;
  }

  return { data };
}


