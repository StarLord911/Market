import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty" style={{ padding: '120px 0' }}>
      <h1 style={{ marginBottom: 12 }}>404</h1>
      <p style={{ marginBottom: 24 }}>Страница не найдена</p>
      <Link to="/" className="btn ghost">На главную</Link>
    </div>
  );
}
