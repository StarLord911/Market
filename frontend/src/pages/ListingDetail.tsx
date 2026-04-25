import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';
import type { Comment, Listing, User } from '../types';
import { formatDate, formatPrice, initial } from '../utils';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [author, setAuthor] = useState<User | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const me = auth.get();

  useEffect(() => {
    if (!id) return;
    api.listings.get(id)
      .then(async l => {
        setListing(l);
        try { setAuthor(await api.users.get(l.authorId)); } catch { /* ignore */ }
      })
      .catch(() => setListing(null));

    api.comments.list(id).then(setComments).catch(() => {});
  }, [id]);

  if (listing === undefined) return <div className="loading-page"><span className="spinner" /></div>;
  if (listing === null) return <div className="empty">Объявление не найдено</div>;

  const onDelete = async () => {
    if (!confirm('Удалить объявление?')) return;
    try { await api.listings.remove(listing.id); navigate('/'); }
    catch (e) { setError((e as Error).message); }
  };

  const onComment = async () => {
    if (!me) { setCommentError('Войдите, чтобы оставить комментарий'); return; }
    if (!commentText.trim()) { setCommentError('Комментарий не может быть пустым'); return; }
    setSubmitting(true);
    setCommentError(null);
    try {
      const c = await api.comments.create(listing.id, {
        authorId: me.id,
        authorName: me.username,
        text: commentText.trim(),
      });
      setComments(prev => [...prev, c]);
      setCommentText('');
      textareaRef.current?.focus();
    } catch (e) {
      setCommentError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = me?.id === listing.authorId;
  const photos = listing.photos ?? [];

  return (
    <div className="detail">
      {/* Left: gallery + comments */}
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

        {/* Comments */}
        <div className="comments">
          <h3 style={{ marginBottom: 16 }}>
            Комментарии {comments.length > 0 && <span className="comments__count">{comments.length}</span>}
          </h3>

          {comments.length === 0 && (
            <div className="comments__empty">Комментариев пока нет — будьте первым!</div>
          )}

          <div className="comments__list">
            {comments.map(c => (
              <div key={c.id} className="comment">
                <div className="comment__avatar">{c.authorName[0].toUpperCase()}</div>
                <div className="comment__body">
                  <div className="comment__header">
                    <span className="comment__author">{c.authorName}</span>
                    <span className="comment__date">{formatDate(c.createdAt)}</span>
                  </div>
                  <div className="comment__text">{c.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="comment-form">
            <textarea
              ref={textareaRef}
              className="comment-form__input"
              placeholder={me ? 'Напишите комментарий…' : 'Войдите, чтобы оставить комментарий'}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onComment(); }}
              disabled={!me || submitting}
              rows={3}
            />
            {commentError && <div className="error" style={{ marginTop: 8 }}>{commentError}</div>}
            <button
              className="btn primary sm"
              style={{ marginTop: 10, alignSelf: 'flex-end' }}
              onClick={onComment}
              disabled={!me || submitting || !commentText.trim()}
            >
              {submitting ? 'Отправка…' : 'Отправить'}
            </button>
          </div>
        </div>
      </div>

      {/* Right: info */}
      <div className="detail-side">
        <div>
          <span className="chip chip--sm">{listing.category}</span>
        </div>
        <h1>{listing.title}</h1>
        <div className="detail-price">{formatPrice(listing.price)}</div>
        <div className="detail-desc">{listing.description}</div>

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
