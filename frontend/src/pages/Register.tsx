import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { auth } from '../auth';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await api.users.register({
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        telegram: telegram.trim() || undefined,
      });
      auth.set({ id: user.id, username: user.username });
      navigate(`/users/${user.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-head"><h1>Регистрация</h1></div>
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label>Имя пользователя</label>
          <input value={username} onChange={e => setUsername(e.target.value)}
                 required placeholder="vlad" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                 required placeholder="vlad@example.com" />
        </div>
        <div className="field">
          <label>Телефон <span style={{ color: 'var(--muted)', fontWeight: 400 }}>— необязательно</span></label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                 placeholder="+7 900 000-00-00" />
        </div>
        <div className="field">
          <label>Telegram <span style={{ color: 'var(--muted)', fontWeight: 400 }}>— необязательно</span></label>
          <input value={telegram} onChange={e => setTelegram(e.target.value)}
                 placeholder="@username" />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Создаём…' : 'Создать аккаунт'}
        </button>
      </form>
    </>
  );
}
