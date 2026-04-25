import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '../auth';
import type { CurrentUser } from '../types';

export default function Layout() {
  const [user, setUser] = useState<CurrentUser | null>(auth.get());
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onChange = () => setUser(auth.get());
    window.addEventListener('auth-change', onChange);
    return () => window.removeEventListener('auth-change', onChange);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/listings${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            market<span className="accent">.</span>
          </Link>

          <form className="search" onSubmit={onSearch}>
            <input
              type="search"
              placeholder="Поиск по объявлениям…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <nav className="nav">
            {user ? (
              <>
                <NavLink to="/favorites">♡ Избранное</NavLink>
                <NavLink to={`/users/${user.id}`}>{user.username}</NavLink>
                <button onClick={() => { auth.clear(); navigate('/'); }}>Выйти</button>
                <Link to="/listings/new" className="primary">+ Разместить</Link>
              </>
            ) : (
              <>
                <NavLink to="/register">Регистрация</NavLink>
                <Link to="/listings/new" className="primary">+ Разместить</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">© Market — учебный проект на микросервисах</div>
      </footer>
    </div>
  );
}
