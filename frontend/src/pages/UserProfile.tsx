import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';
import type { Listing, User } from '../types';
import ListingCard from '../components/ListingCard';
import { formatDate, initial } from '../utils';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const me = auth.get();
  const isOwner = me?.id === id;

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [listings, setListings] = useState<Listing[]>([]);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.users.get(id).then(u => {
      setUser(u);
      setPhone(u.phone ?? '');
      setTelegram(u.telegram ?? '');
    }).catch(() => setUser(null));
    api.listings.list()
      .then(all => setListings(all.filter(l => l.authorId === id)))
      .catch(() => setListings([]));
  }, [id]);

  const onSaveContacts = async () => {
    if (!id) return;
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await api.users.updateContacts(id, { phone, telegram });
      setUser(updated);
      setEditing(false);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (user === undefined) return <div className="loading-page"><span className="spinner" /></div>;
  if (user === null) return <div className="empty">Пользователь не найден</div>;

  return (
    <>
      <div className="user-card" style={{ alignItems: 'flex-start', gap: 20, marginTop: 32, padding: 24 }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 24, flexShrink: 0 }}>
          {initial(user.username)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ marginBottom: 4 }}>{user.username}</h2>
          <div className="meta" style={{ marginBottom: 8 }}>{user.email} · с {formatDate(user.registeredAt)}</div>

          {!editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {user.phone && (
                <a href={`tel:${user.phone}`} className="contact-row">
                  <span className="contact-icon">📞</span> {user.phone}
                </a>
              )}
              {user.telegram && (
                <a href={`https://t.me/${user.telegram}`} target="_blank" rel="noopener noreferrer" className="contact-row">
                  <span className="contact-icon">✈</span> @{user.telegram}
                </a>
              )}
              {!user.phone && !user.telegram && !isOwner && (
                <span className="meta">Контакты не указаны</span>
              )}
              {isOwner && (
                <button className="btn ghost sm" style={{ marginTop: 8, alignSelf: 'flex-start' }}
                        onClick={() => setEditing(true)}>
                  {user.phone || user.telegram ? 'Изменить контакты' : '+ Добавить контакты'}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, marginTop: 8 }}>
              <div className="field">
                <label>Телефон</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                       placeholder="+7 900 000-00-00" />
              </div>
              <div className="field">
                <label>Telegram</label>
                <input value={telegram} onChange={e => setTelegram(e.target.value)}
                       placeholder="@username" />
              </div>
              {saveError && <div className="error">{saveError}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn primary sm" onClick={onSaveContacts} disabled={saving}>
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
                <button className="btn ghost sm" onClick={() => { setEditing(false); setSaveError(null); }}>
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 32 }}>
        <h2>Объявления</h2>
      </div>

      {listings.length === 0 ? (
        <div className="empty">Пока нет объявлений</div>
      ) : (
        <div className="grid">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </>
  );
}
