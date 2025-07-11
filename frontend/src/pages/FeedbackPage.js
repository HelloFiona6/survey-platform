import React, { useState } from 'react';

export default function FeedbackPage({ user, onSubmit }) {
  const [confidence, setConfidence] = useState('');
  const [preference, setPreference] = useState('');
  const [strategy, setStrategy] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!confidence || !preference || !strategy) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    // Submit feedback to backend
    await fetch('http://localhost:5000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        confidence,
        preference,
        strategy,
      }),
    });
    onSubmit();
  };

  return (
    <div className="App">
      <h2>Feedback</h2>
      <div style={{ margin: '1em 0' }}>
        <label>
          Confidence (1-5):&nbsp;
          <select value={confidence} onChange={e => setConfidence(e.target.value)}>
            <option value="">Select</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div style={{ margin: '1em 0' }}>
        <label>
          Did you like this task?&nbsp;
          <select value={preference} onChange={e => setPreference(e.target.value)}>
            <option value="">Select</option>
            <option value="like">Like</option>
            <option value="neutral">Neutral</option>
            <option value="dislike">Dislike</option>
          </select>
        </label>
      </div>
      <div style={{ margin: '1em 0' }}>
        <label>
          What strategy did you use?<br />
          <textarea value={strategy} onChange={e => setStrategy(e.target.value)} rows={3} style={{ width: '100%' }} />
        </label>
      </div>
      <button onClick={handleSubmit}>Submit Feedback</button>
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
} 