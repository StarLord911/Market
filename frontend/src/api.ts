import type { Comment, Listing, ListingsQuery, PagedResult, User } from './types';

const json = { 'Content-Type': 'application/json' };

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? ': ' + text : ''}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listings: {
    list: (params?: ListingsQuery) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.city) qs.set('city', params.city);
      if (params?.q) qs.set('q', params.q);
      if (params?.sort) qs.set('sort', params.sort);
      if (params?.page !== undefined) qs.set('page', String(params.page));
      if (params?.pageSize !== undefined) qs.set('pageSize', String(params.pageSize));
      if (params?.minPrice !== undefined) qs.set('minPrice', String(params.minPrice));
      if (params?.maxPrice !== undefined) qs.set('maxPrice', String(params.maxPrice));
      const query = qs.toString() ? `?${qs}` : '';
      return fetch(`/api/listings${query}`).then(handle<PagedResult<Listing>>);
    },
    get: (id: string) => fetch(`/api/listings/${id}`).then(handle<Listing>),
    create: (data: { authorId: string; title: string; description: string; price: number; category: string }) =>
      fetch('/api/listings', { method: 'POST', headers: json, body: JSON.stringify(data) })
        .then(handle<Listing>),
    remove: (id: string) =>
      fetch(`/api/listings/${id}`, { method: 'DELETE' }).then(handle<void>),
    update: (id: string, data: { title?: string; description?: string; price?: number; category?: string }) =>
      fetch(`/api/listings/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify(data) })
        .then(handle<Listing>),
    uploadPhotos: (id: string, files: FileList) => {
      const form = new FormData();
      Array.from(files).forEach(f => form.append('files', f));
      return fetch(`/api/listings/${id}/photos`, { method: 'POST', body: form })
        .then(handle<Listing>);
    },
  },
  favorites: {
    list: (userId: string) =>
      fetch(`/api/listings/favorites/${userId}`).then(handle<Listing[]>),
    add: (listingId: string, userId: string) =>
      fetch(`/api/listings/${listingId}/favorites`, { method: 'POST', headers: json, body: JSON.stringify({ userId }) })
        .then(handle<void>),
    remove: (listingId: string, userId: string) =>
      fetch(`/api/listings/${listingId}/favorites/${userId}`, { method: 'DELETE' }).then(handle<void>),
  },
  comments: {
    list: (listingId: string) =>
      fetch(`/api/listings/${listingId}/comments`).then(handle<Comment[]>),
    create: (listingId: string, data: { authorId: string; authorName: string; text: string }) =>
      fetch(`/api/listings/${listingId}/comments`, { method: 'POST', headers: json, body: JSON.stringify(data) })
        .then(handle<Comment>),
  },
  users: {
    list: () => fetch('/api/users').then(handle<User[]>),
    get: (id: string) => fetch(`/api/users/${id}`).then(handle<User>),
    register: (data: { username: string; email: string; phone?: string; telegram?: string }) =>
      fetch('/api/users', { method: 'POST', headers: json, body: JSON.stringify(data) })
        .then(handle<User>),
    updateContacts: (id: string, data: { phone: string; telegram: string }) =>
      fetch(`/api/users/${id}/contacts`, { method: 'PATCH', headers: json, body: JSON.stringify(data) })
        .then(handle<User>),
  },
};
