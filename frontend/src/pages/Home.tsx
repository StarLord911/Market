import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ListingCard from '../components/ListingCard';
import { useFavorites } from '../hooks/useFavorites';
import type { Listing } from '../types';

export default function Home() {
  const [items, setItems] = useState<Listing[] | null>(null);
  const { ids, toggle } = useFavorites();

  useEffect(() => {
    api.listings.list().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Доска объявлений нового поколения</h1>
        <p>Покупайте и продавайте всё что угодно. Минимум кликов, максимум удобства.</p>
        <Link to="/listings/new" className="btn primary">Разместить объявление</Link>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Свежие объявления</h2>
          <Link to="/listings">Смотреть все →</Link>
        </div>

        {items === null && <div className="loading-page"><span className="spinner" /></div>}
        {items?.length === 0 && (
          <div className="empty">
            Объявлений пока нет. <Link to="/listings/new" style={{ textDecoration: 'underline' }}>Добавьте первое</Link>.
          </div>
        )}
        {items && items.length > 0 && (
          <div className="grid">
            {items.slice(0, 12).map(l => (
              <ListingCard
                key={l.id}
                listing={l}
                isFavorited={ids.has(l.id)}
                onToggleFavorite={toggle}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
