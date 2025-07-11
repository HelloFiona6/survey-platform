import React from 'react';
export default function MainTasksPage({ user, onComplete }) {
  return (
    <div className="App">
      <h2>Main Tasks</h2>
      <p>Main tasks for user {user && user.username} (group: {user && user.group}) will be shown here.</p>
      <button onClick={onComplete}>Complete Main Tasks</button>
    </div>
  );
} 