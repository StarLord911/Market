import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ListingCard from '../components/ListingCard';
import { useFavorites } from '../hooks/useFavorites';
import type { Listing } from '../types';
import { CATEGORIES } from '../types';

const CITIES = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург',
  'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Уфа',
  'Ростов-на-Дону', 'Другое',
];

function FilterGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="filter-group">
      <button className={`filter-group__header${value ? ' filter-group__header--active' : ''}`} onClick={() => setOpen(o => !o)}>
        <span>{value || title}</span>
        <span className="filter-group__arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="filter-group__list">
          <button
            className={`sidebar-item${!value ? ' sidebar-item--active' : ''}`}
            onClick={() => onChange('')}
          >Все</button>
          {options.map(c => (
            <button
              key={c}
              className={`sidebar-item${value === c ? ' sidebar-item--active' : ''}`}
              onClick={() => onChange(value === c ? '' : c)}
            >{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceFilter({
  min, max, onMin, onMax,
}: {
  min: string; max: string; onMin: (v: string) => void; onMax: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasValue = min || max;
  const label = hasValue
    ? [min && `от ${min} ₽`, max && `до ${max} ₽`].filter(Boolean).join(' ')
    : 'Цена, ₽';
  return (
    <div className="filter-group">
      <button className={`filter-group__header${hasValue ? ' filter-group__header--active' : ''}`} onClick={() => setOpen(o => !o)}>
        <span>{label}</span>
        <span className="filter-group__arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="filter-group__list">
          <div className="price-range">
            <input
              type="number" min={0} placeholder="от"
              value={min} onChange={e => onMin(e.target.value)}
            />
            <span className="price-range__sep">—</span>
            <input
              type="number" min={0} placeholder="до"
              value={max} onChange={e => onMax(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<Listing[] | null>(null);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const { ids, toggle } = useFavorites();

  useEffect(() => {
    api.listings.list({ page: 1, pageSize: 100, sort: 'Newest' })
      .then(res => setItems(res.items))
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    return items.filter(l => {
      const matchCity = !city || l.city === city;
      const matchCat = !category || l.category === category;
      const matchMin = min === null || l.price >= min;
      const matchMax = max === null || l.price <= max;
      return matchCity && matchCat && matchMin && matchMax;
    });
  }, [items, city, category, priceMin, priceMax]);

  const hasFilters = city || category || priceMin || priceMax;

  return (
    <div className="home-layout">
      <aside className="sidebar">
        <FilterGroup title="Город" options={CITIES} value={city} onChange={setCity} />
        <FilterGroup title="Категория" options={CATEGORIES as unknown as string[]} value={category} onChange={setCategory} />
        <PriceFilter min={priceMin} max={priceMax} onMin={setPriceMin} onMax={setPriceMax} />
        {hasFilters && (
          <button className="sidebar-reset" onClick={() => { setCity(''); setCategory(''); setPriceMin(''); setPriceMax(''); }}>
            Сбросить фильтры
          </button>
        )}
      </aside>

      <div className="home-main">
        {!hasFilters && (
          <section className="hero">
            <h1>Доска объявлений нового поколения</h1>
            <p>Покупайте и продавайте всё что угодно. Минимум кликов, максимум удобства.</p>
            <Link to="/listings/new" className="btn primary">Разместить объявление</Link>
          </section>
        )}

        <section className="section">
          <div className="section-head">
            <div>
              <h2>
                {hasFilters
                  ? [city, category].filter(Boolean).join(' · ')
                  : 'Свежие объявления'}
              </h2>
              {filtered && (
                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
                  {filtered.length} {pluralize(filtered.length)}
                </div>
              )}
            </div>
            {!hasFilters && <Link to="/listings">Смотреть все →</Link>}
          </div>

          {filtered === null && <div className="loading-page"><span className="spinner" /></div>}
          {filtered?.length === 0 && <div className="empty">Ничего не найдено</div>}
          {filtered && filtered.length > 0 && (
            <div className="grid">
              {(hasFilters ? filtered : filtered.slice(0, 12)).map(l => (
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
      </div>
    </div>
  );
}

function pluralize(n: number) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'объявление';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'объявления';
  return 'объявлений';
}
