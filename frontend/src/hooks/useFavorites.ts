import { useEffect, useState } from 'react';
import { api } from '../api';
import { auth } from '../auth';

export function useFavorites() {
  const me = auth.get();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!me) return;
    api.favorites.list(me.id)
      .then(items => setIds(new Set(items.map(l => l.id))))
      .catch(() => {});
  }, [me?.id]);

  const toggle = async (listingId: string) => {
    if (!me) return;
    const wasFav = ids.has(listingId);
    setIds(prev => {
      const next = new Set(prev);
      wasFav ? next.delete(listingId) : next.add(listingId);
      return next;
    });
    setLoading(true);
    try {
      if (wasFav) await api.favorites.remove(listingId, me.id);
      else await api.favorites.add(listingId, me.id);
    } catch {
      setIds(prev => {
        const next = new Set(prev);
        wasFav ? next.add(listingId) : next.delete(listingId);
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return { ids, toggle, loading, me };
}
