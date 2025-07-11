import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [group, setGroup] = useState('untrained');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username) {
      setError('Please enter a username.');
      return;
    }
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, group }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin({ ...data, username });
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (e) {
      setError('Network error.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="App" style={{ minWidth: 320, boxShadow: '0 2px 12px #0001', padding: 32, borderRadius: 12, background: '#fff' }}>
        <h2>Login / Register</h2>
        <div style={{ margin: '1em 0' }}>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div style={{ margin: '1em 0' }}>
          <label>
            <input
              type="radio"
              name="group"
              value="untrained"
              checked={group === 'untrained'}
              onChange={() => setGroup('untrained')}
            />
            Untrained
          </label>
          <label style={{ marginLeft: '1em' }}>
            <input
              type="radio"
              name="group"
              value="exposure"
              checked={group === 'exposure'}
              onChange={() => setGroup('exposure')}
            />
            Exposure
          </label>
          <label style={{ marginLeft: '1em' }}>
            <input
              type="radio"
              name="group"
              value="expert"
              checked={group === 'expert'}
              onChange={() => setGroup('expert')}
            />
            Expert
          </label>
        </div>
        <button onClick={handleRegister}>Enter</button>
        {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
      </div>
    </div>
  );
} 