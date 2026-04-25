import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';
import type { Listing, User } from '../types';
import { formatDate, formatPrice, initial } from '../utils';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [author, setAuthor] = useState<User | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const me = auth.get();

  useEffect(() => {
    if (!id) return;
    api.listings.get(id)
      .then(async l => {
        setListing(l);
        try { setAuthor(await api.users.get(l.authorId)); } catch { /* ignore */ }
      })
      .catch(() => setListing(null));
  }, [id]);

  if (listing === undefined) return <div className="loading-page"><span className="spinner" /></div>;
  if (listing === null) return <div className="empty">Объявление не найдено</div>;

  const onDelete = async () => {
    if (!confirm('Удалить объявление?')) return;
    try { await api.listings.remove(listing.id); navigate('/'); }
    catch (e) { setError((e as Error).message); }
  };

  const isOwner = me?.id === listing.authorId;
  const photos = listing.photos ?? [];

  return (
    <div className="detail">
      {/* Left: gallery */}
      <div>
        {photos.length > 0 ? (
          <>
            <div className="detail-img"
                 style={{ backgroundImage: `url(${photos[activePhoto]})`,
                          backgroundSize: 'cover', backgroundPosition: 'center', fontSize: 0 }} />
            {photos.length > 1 && (
              <div className="photo-grid" style={{ marginTop: 12 }}>
                {photos.map((src, i) => (
                  <img key={i} src={src} alt="" className="photo-thumb"
                       onClick={() => setActivePhoto(i)}
                       style={{ cursor: 'pointer',
                                outline: i === activePhoto ? '2px solid var(--accent)' : 'none',
                                outlineOffset: 2 }} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="detail-img">{initial(listing.title)}</div>
        )}
      </div>

      {/* Right: info */}
      <div className="detail-side">
        <div>
          <span className="chip chip--sm">{listing.category}</span>
        </div>
        <h1>{listing.title}</h1>
        <div className="detail-price">{formatPrice(listing.price)}</div>
        <div className="detail-desc">{listing.description}</div>

        {/* Seller block */}
        {author ? (
          <div className="seller-card">
            <Link to={`/users/${author.id}`} className="seller-card__top">
              <div className="avatar">{initial(author.username)}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{author.username}</div>
                <div className="detail-meta">на сайте с {formatDate(author.registeredAt)}</div>
              </div>
            </Link>
            {(author.phone || author.telegram) && (
              <div className="seller-card__contacts">
                {author.phone && (
                  <a href={`tel:${author.phone}`} className="contact-btn">
                    📞 {author.phone}
                  </a>
                )}
                {author.telegram && (
                  <a href={`https://t.me/${author.telegram}`} target="_blank"
                     rel="noopener noreferrer" className="contact-btn contact-btn--tg">
                    ✈ @{author.telegram}
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="seller-card">
            <div className="seller-card__top">
              <div className="avatar">?</div>
              <div className="detail-meta">Автор: {listing.authorId.slice(0, 8)}…</div>
            </div>
          </div>
        )}

        <div className="detail-meta">Опубликовано {formatDate(listing.createdAt)}</div>
        {isOwner && <button className="btn danger" onClick={onDelete}>Удалить</button>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
