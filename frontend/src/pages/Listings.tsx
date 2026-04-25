import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { Listing } from '../types';
import { CATEGORIES } from '../types';
import ListingCard from '../components/ListingCard';

export default function Listings() {
  const [items, setItems] = useState<Listing[] | null>(null);
  const [params, setParams] = useSearchParams();
  const q = params.get('q')?.toLowerCase() ?? '';
  const activeCategory = params.get('category') ?? '';

  useEffect(() => {
    api.listings.list().then(setItems).catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    return items.filter(l => {
      const matchCat = !activeCategory || l.category === activeCategory;
      const matchQ = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [items, q, activeCategory]);

  const setCategory = (cat: string) => {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      if (cat) next.set('category', cat); else next.delete('category');
      return next;
    });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{q ? `Поиск: «${q}»` : activeCategory || 'Все объявления'}</h1>
          {filtered && <div className="count">{filtered.length} {pluralize(filtered.length)}</div>}
        </div>
      </div>

      <div className="category-chips" style={{ marginBottom: 24 }}>
        <button className={`chip${!activeCategory ? ' chip--active' : ''}`}
                onClick={() => setCategory('')}>Все</button>
        {CATEGORIES.map(c => (
          <button key={c} className={`chip${activeCategory === c ? ' chip--active' : ''}`}
                  onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {filtered === null && <div className="loading-page"><span className="spinner" /></div>}
      {filtered?.length === 0 && <div className="empty">Ничего не найдено</div>}
      {filtered && filtered.length > 0 && (
        <div className="grid">
          {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </>
  );
}

function pluralize(n: number) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'объявление';
  if ([2,3,4].includes(mod10) && ![12,13,14].includes(mod100)) return 'объявления';
  return 'объявлений';
}
