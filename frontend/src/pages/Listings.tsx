import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ListingCard from '../components/ListingCard';
import { useFavorites } from '../hooks/useFavorites';
import type { Listing, ListingsSort, PagedResult } from '../types';
import { CATEGORIES } from '../types';

export default function Listings() {
  const [result, setResult] = useState<PagedResult<Listing> | null>(null);
  const [params, setParams] = useSearchParams();
  const { ids, toggle } = useFavorites();
  const q = params.get('q') ?? '';
  const activeCategory = params.get('category') ?? '';
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
  const sort = (params.get('sort') as ListingsSort | null) ?? 'Newest';
  const pageSize = 24;

  useEffect(() => {
    api.listings.list({
      page,
      pageSize,
      sort,
      category: activeCategory || undefined,
      q: q || undefined,
    })
      .then(setResult)
      .catch(() => setResult({ items: [], page, pageSize, total: 0 }));
  }, [activeCategory, page, q, sort]);

  const setCategory = (cat: string) => {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      if (cat) next.set('category', cat);
      else next.delete('category');
      next.delete('page');
      return next;
    });
  };

  const setPage = (nextPage: number) => {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) next.delete('page');
      else next.set('page', String(nextPage));
      return next;
    });
  };

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{q ? `Поиск: «${q}»` : activeCategory || 'Все объявления'}</h1>
          {result && <div className="count">{result.total} {pluralize(result.total)}</div>}
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

      {result === null && <div className="loading-page"><span className="spinner" /></div>}
      {result?.items.length === 0 && <div className="empty">Ничего не найдено</div>}
      {result && result.items.length > 0 && (
        <div className="grid">
          {result.items.map(l => (
            <ListingCard
              key={l.id}
              listing={l}
              isFavorited={ids.has(l.id)}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      )}

      {result && totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn ghost sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            Назад
          </button>
          <span className="meta" style={{ alignSelf: 'center' }}>
            {page} / {totalPages}
          </span>
          <button className="btn ghost sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
            Вперёд
          </button>
        </div>
      )}
    </>
  );
}

function pluralize(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'объявление';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'объявления';
  return 'объявлений';
}
