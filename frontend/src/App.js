import React, { useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import TaskSelector from './pages/TaskSelector';
import DotsTask from './pages/DotsTask';

function App() {
  const [username, setUsername] = useState('');
  const [group, setGroup] = useState('untrained');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [task, setTask] = useState('');

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
        setUser(data);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (e) {
      setError('Network error.');
    }
  };

  if (!user) {
    return (
      <LoginPage
        username={username}
        setUsername={setUsername}
        group={group}
        setGroup={setGroup}
        onRegister={handleRegister}
        error={error}
      />
    );
  }

  if (!task) {
    return <TaskSelector onSelect={setTask} />;
  }
  if (task === 'dots') {
    return <DotsTask user={user} onBack={() => setTask('')} />;
  }
  return (
    <div className="App">
      <h2>Coming soon...</h2>
      <button onClick={() => setTask('')}>Back to Main</button>
    </div>
  );
}

export default App;
