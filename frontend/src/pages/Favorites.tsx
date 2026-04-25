import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ListingCard from '../components/ListingCard';
import { useFavorites } from '../hooks/useFavorites';
import type { Listing } from '../types';

export default function Favorites() {
  const { ids, toggle, me } = useFavorites();
  const [items, setItems] = useState<Listing[] | null>(null);

  useEffect(() => {
    if (!me) return;
    api.favorites.list(me.id).then(setItems).catch(() => setItems([]));
  }, [me?.id]);

  useEffect(() => {
    if (!me || items === null) return;
    setItems(prev => prev?.filter(l => ids.has(l.id)) ?? null);
  }, [ids]);

  if (!me) {
    return (
      <div className="empty">
        <Link to="/register" style={{ textDecoration: 'underline' }}>Войдите</Link>, чтобы видеть избранное.
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Избранное</h1>
        {items && items.length > 0 && (
          <div className="count">{items.length} объявл.</div>
        )}
      </div>

      {items === null && <div className="loading-page"><span className="spinner" /></div>}

      {items?.length === 0 && (
        <div className="empty">
          Вы ещё ничего не добавили. Нажмите ♡ на любом объявлении.
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid">
          {items.map(l => (
            <ListingCard
              key={l.id}
              listing={l}
              isFavorited={ids.has(l.id)}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      )}
    </>
  );
}
