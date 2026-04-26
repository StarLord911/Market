import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';
import { CATEGORIES } from '../types';

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const me = auth.get();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.listings.get(id)
      .then(l => {
        if (me?.id !== l.authorId) { navigate(`/listings/${id}`); return; }
        setTitle(l.title);
        setDescription(l.description);
        setPrice(String(l.price));
        setCategory(l.category);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.listings.update(id!, {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
      });
      navigate(`/listings/${id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-page"><span className="spinner" /></div>;

  return (
    <>
      <div className="page-head"><h1>Редактировать объявление</h1></div>
      <form className="form" onSubmit={onSubmit}>

        <div className="field">
          <label>Заголовок</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
                 maxLength={200} required placeholder="iPhone 15 Pro 256GB" />
        </div>

        <div className="field">
          <label>Описание</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
                    required placeholder="Состояние, комплектация, причина продажи…" />
        </div>

        <div className="field">
          <label>Цена, ₽</label>
          <input type="number" min={0} step={1} value={price}
                 onChange={e => setPrice(e.target.value)} required placeholder="0" />
        </div>

        <div className="field">
          <label>Категория</label>
          <div className="category-chips">
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                className={`chip${category === c ? ' chip--active' : ''}`}
                onClick={() => setCategory(c)}
              >{c}</button>
            ))}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button className="btn" type="button" onClick={() => navigate(`/listings/${id}`)}>
            Отмена
          </button>
        </div>
      </form>
    </>
  );
}
