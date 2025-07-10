import React from 'react';

function LoginPage({ username, setUsername, group, setGroup, onRegister, error }) {
  return (
    <div className="App">
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
      <button onClick={onRegister}>Enter</button>
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default LoginPage; 