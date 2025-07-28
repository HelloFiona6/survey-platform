import React, {useState} from 'react';
import {backendUrl} from "../index";

export default function LoginPage({onLogin}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    try {
      const res = await fetch(new URL('/api/login', backendUrl), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (e) {
      setError('Network error.');
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{width: '100%', boxSizing: 'border-box'}}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{width: '100%', boxSizing:"border-box", marginTop: '1em'}}
      />
      <button onClick={handleLogin} style={{width: '100%'}}>Login</button>
      {error && <div style={{color: 'red', marginTop: '1em'}}>{error}</div>}
    </div>
  );
} 