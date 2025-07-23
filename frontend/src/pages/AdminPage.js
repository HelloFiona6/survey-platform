import React, { useEffect, useState } from 'react';
import {backendUrl} from "../index";

const SIDEBAR_WIDTH = 220;

// 日期格式化函数
function formatDateEn(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}

export default function AdminPage({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [responses, setResponses] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', email: '', group: 'untrained' });
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('users');

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 过滤和排序后的用户
  const filteredUsers = users
    .filter(u =>
      (!search || u.username.toLowerCase().includes(search.toLowerCase()) || String(u.id).includes(search)) &&
      (!groupFilter || u.group === groupFilter) &&
      (!dateFrom || new Date(u.created_at) >= new Date(dateFrom)) &&
      (!dateTo || new Date(u.created_at) <= new Date(dateTo))
    )
    .sort((a, b) => {
      let v1 = a[sortBy], v2 = b[sortBy];
      if (sortBy === 'created_at') {
        v1 = new Date(v1); v2 = new Date(v2);
      }
      if (v1 < v2) return sortOrder === 'asc' ? -1 : 1;
      if (v1 > v2) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Load users and responses
  const loadUsers = () => {
    fetch(new URL('/api/users', backendUrl)).then(r => r.json()).then(setUsers);
  };
  const loadResponses = () => {
    fetch(new URL('/api/responses', backendUrl)).then(r => r.json()).then(setResponses);
  };
  useEffect(() => { loadUsers(); loadResponses(); }, []);

  // Add user
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.group) {
      setError('All fields required'); return;
    }
    setError('');
    const res = await fetch(new URL('/api/user', backendUrl), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    if (res.ok) {
      setNewUser({ username: '', password: '', email: '', group: 'untrained' });
      loadUsers();
    } else {
      setError('Add failed');
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await fetch(new URL(`/api/user/${id}`, backendUrl), { method: 'DELETE' });
    loadUsers();
  };

  // Edit user
  const handleEditUser = (user) => setEditUser(user);
  const handleUpdateUser = async () => {
    if (!editUser.password || !editUser.group) { setError('All fields required'); return; }
    setError('');
    await fetch(new URL(`/api/user/${editUser.id}`, backendUrl), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: editUser.password, group: editUser.group, email: editUser.email })
    });
    setEditUser(null); loadUsers();
  };

  return (
    <div style={{
      display: 'flex', minHeight: '80vh', background: '#f5f6fa',
      borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <div style={{
        width: SIDEBAR_WIDTH, background: 'rgba(255,255,255,0.95)', borderRight: '1px solid #e0e0e0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0'
      }}>
        <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 40, letterSpacing: -1 }}>
          Admin Panel
        </div>
        <button
          className={tab === 'users' ? 'sidebar-btn active' : 'sidebar-btn'}
          onClick={() => setTab('users')}
        >User Management</button>
        <button
          className={tab === 'responses' ? 'sidebar-btn active' : 'sidebar-btn'}
          onClick={() => setTab('responses')}
        >Data Analytics</button>
        <div style={{ flex: 1 }} />
        <button
          className="sidebar-btn"
          style={{ color: '#e00', marginBottom: 0, marginTop: 40 }}
          onClick={onLogout}
        >Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3.5rem 3rem', background: 'none', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        {tab === 'users' && (
          <>
            <div style={{
              background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              padding: '2.5rem 2rem', minWidth: 900, maxWidth: 1400, width: '100%', minHeight: 600
            }}>
              <h2 style={{ fontWeight: 700, marginBottom: 24 }}>User Management</h2>
              <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  placeholder="Search by username or ID"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ minWidth: 180 }}
                />
                <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
                  <option value="">All Groups</option>
                  <option value="untrained">untrained</option>
                  <option value="exposure">exposure</option>
                  <option value="expert">expert</option>
                  <option value="admin">admin</option>
                </select>
                <label>
                  From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </label>
                <label>
                  To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="id">ID</option>
                  <option value="username">Username</option>
                  <option value="created_at">Created</option>
                </select>
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
                <button className="apple-btn" style={{ background: '#eee', color: '#333' }} onClick={() => {
                  setSearch(''); setGroupFilter(''); setDateFrom(''); setDateTo(''); setSortBy('id'); setSortOrder('asc');
                }}>Reset</button>
              </div>
              <div style={{
                display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center',
              }}>
                <input placeholder="Username" value={newUser.username} onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} style={{ flex: 1 }} />
                <input placeholder="Password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} style={{ flex: 1 }} />
                <input placeholder="Email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} style={{ flex: 1 }} />
                <select value={newUser.group}
                  onChange={e => setNewUser(u => ({ ...u, group: e.target.value }))}
                  style={{ flex: 1 }}>
                  <option value="untrained">untrained</option>
                  <option value="exposure">exposure</option>
                  <option value="expert">expert</option>
                  <option value="admin">admin</option>
                </select>
                <button className="apple-btn" onClick={handleAddUser}>Add</button>
              </div>
              {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
              <div style={{
                background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 0, overflow: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f8f8f8' }}>
                      <th style={{ padding: 10 }}>ID</th>
                      <th>Username</th>
                      <th>Group</th>
                      <th>Email</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} style={{ background: editUser && editUser.id === u.id ? '#f0f8ff' : undefined }}>
                        <td style={{ padding: 10 }}>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{editUser && editUser.id === u.id ? (
                          <select value={editUser.group} onChange={e => setEditUser(eu => ({ ...eu, group: e.target.value }))}>
                            <option value="untrained">untrained</option>
                            <option value="exposure">exposure</option>
                            <option value="expert">expert</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : u.group}</td>
                        <td>{editUser && editUser.id === u.id ? (
                          <input placeholder="Email" value={editUser.email || ''} onChange={e => setEditUser(eu => ({ ...eu, email: e.target.value }))} />
                        ) : u.email}</td>
                        <td>{formatDateEn(u.created_at)}</td>
                        <td>
                          {editUser && editUser.id === u.id ? (
                            <>
                              <input placeholder="Password" value={editUser.password}
                                onChange={e => setEditUser(eu => ({ ...eu, password: e.target.value }))} />
                              <button className="apple-btn" onClick={handleUpdateUser}>Save</button>
                              <button className="apple-btn" style={{ background: '#eee', color: '#333' }} onClick={() => setEditUser(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="apple-btn" onClick={() => handleEditUser({ ...u, password: '' })}>Edit</button>
                              <button className="apple-btn" style={{ background: '#fff0f0', color: '#e00' }} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {tab === 'responses' && (
          <>
            <div style={{
              background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              padding: '2.5rem 2rem', minWidth: 900, maxWidth: 1400, width: '100%', minHeight: 600
            }}>
              <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Data Analytics</h2>
              <div style={{
                background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 0, overflow: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f8f8f8' }}>
                      <th style={{ padding: 10 }}>User</th>
                      <th>Group</th>
                      <th>QID</th>
                      <th>Phase</th>
                      <th>Answer</th>
                      <th>Correct</th>
                      <th>Time(s)</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map(r => (
                      <tr key={r.id}>
                        <td style={{ padding: 10 }}>{r.username}</td>
                        <td>{r.group}</td>
                        <td>{r.question_id}</td>
                        <td>{r.phase}</td>
                        <td>{r.response}</td>
                        <td>{String(r.correct)}</td>
                        <td>{r.time_spent}</td>
                        <td>{formatDateEn(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        .sidebar-btn {
          background: none;
          border: none;
          color: #222;
          font-size: 1.1rem;
          font-weight: 500;
          padding: 0.7em 1.2em;
          margin-bottom: 12px;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
          width: 90%;
          text-align: left;
          cursor: pointer;
        }
        .sidebar-btn.active, .sidebar-btn:hover {
          background: #f0f4fa;
          color: #0071e3;
        }
        .apple-btn {
          background: #0071e3;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          padding: 0.5em 1.2em;
          margin-left: 6px;
          margin-right: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .apple-btn:hover {
          background: #005bb5;
        }
      `}</style>
    </div>
  );
} 