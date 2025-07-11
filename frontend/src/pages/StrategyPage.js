import React, { useEffect, useState } from 'react';
export default function StrategyPage({ onContinue }) {
  const [strategy, setStrategy] = useState('');
  useEffect(() => {
    // Optionally fetch from backend
    setStrategy(
      'Strategy examples:\n- Multiply horizontal and vertical density\n- Sample a section and extrapolate\n- Use visual grouping'
    );
  }, []);
  return (
    <div className="App">
      <h2>Strategy Page</h2>
      <pre style={{ textAlign: 'left', background: '#f8f8f8', padding: 16, borderRadius: 8 }}>{strategy}</pre>
      <button onClick={onContinue}>Continue</button>
    </div>
  );
} 