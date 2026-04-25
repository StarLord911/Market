import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';
import { CATEGORIES } from '../types';

export default function NewListing() {
  const me = auth.get();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!me) {
    return (
      <>
        <div className="page-head"><h1>Новое объявление</h1></div>
        <div className="notice">
          Чтобы разместить объявление, нужно <Link to="/register">зарегистрироваться</Link>.
        </div>
      </>
    );
  }

  const applyFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPreviews(Array.from(files).map(f => ({ url: URL.createObjectURL(f), name: f.name })));
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (fileRef.current) fileRef.current.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    applyFiles(e.dataTransfer.files);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await api.listings.create({
        authorId: me.id,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
      });
      const files = fileRef.current?.files;
      if (files && files.length > 0) {
        await api.listings.uploadPhotos(created.id, files);
      }
      navigate(`/listings/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-head"><h1>Новое объявление</h1></div>
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

        <div className="field">
          <label>Фотографии</label>
          <input ref={fileRef} type="file"
                 accept="image/jpeg,image/png,image/webp,image/gif" multiple
                 style={{ display: 'none' }}
                 onChange={e => applyFiles(e.target.files)} />
          {previews.length === 0 ? (
            <div
              className={`upload-zone${dragging ? ' upload-zone--over' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <div className="upload-zone__icon">↑</div>
              <div className="upload-zone__text">Перетащите фото сюда или <span>выберите файлы</span></div>
              <div className="upload-zone__hint">JPG, PNG, WEBP — до 50 МБ</div>
            </div>
          ) : (
            <div className="upload-preview">
              {previews.map((p, i) => (
                <div key={i} className="upload-preview__item">
                  <img src={p.url} alt={p.name} />
                  <button type="button" className="upload-preview__remove"
                          onClick={() => removePreview(i)} aria-label="Удалить">×</button>
                </div>
              ))}
              <button type="button" className="upload-preview__add"
                      onClick={() => fileRef.current?.click()}>+ ещё</button>
            </div>
          )}
        </div>

        {error && <div className="error">{error}</div>}
        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Публикация…' : 'Опубликовать'}
        </button>
      </form>
    </>
  );
}
