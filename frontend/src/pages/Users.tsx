import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { User } from '../types';
import { formatDate, initial } from '../utils';

export default function Users() {
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    api.users.list().then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <>
      <div className="page-head"><h1>Пользователи</h1></div>
      {users === null && <div className="loading-page"><span className="spinner" /></div>}
      {users?.length === 0 && <div className="empty">Никто ещё не зарегистрировался</div>}
      {users && users.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {users.map(u => (
            <Link key={u.id} to={`/users/${u.id}`} className="user-card" style={{ marginBottom: 0 }}>
              <div className="avatar">{initial(u.username)}</div>
              <div>
                <h3>{u.username}</h3>
                <div className="meta">{u.email}</div>
                <div className="meta">с {formatDate(u.registeredAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
