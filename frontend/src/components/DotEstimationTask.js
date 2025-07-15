import React, { useState, useEffect, useRef } from 'react';

export default function DotEstimationTask({ image, onSubmit, timeLimit = 15, remaining }) {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef();

  useEffect(() => {
    setTimeLeft(timeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [image]);

  const handleSubmit = (auto = false) => {
    clearInterval(timerRef.current);
    onSubmit({ answer: input, timeSpent: timeLimit - timeLeft, auto });
    setInput('');
  };

  return (
    <div>
      <h3>Estimate the number of dots</h3>
      <div style={{ margin: '1em 0' }}>
        <img src={image} alt="dots" style={{ maxWidth: 400, maxHeight: 400, border: '1px solid #ccc' }} />
      </div>
      <div>Time left: <b>{timeLeft}s</b></div>
      <input
        type="number"
        placeholder="Your estimate"
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{ margin: '1em 0', width: 120 }}
      />
      <button onClick={() => handleSubmit(false)}>Submit</button>
      {typeof remaining === 'number' && (
        <div style={{ marginTop: '1em' }}>Remaining: {remaining}</div>
      )}
    </div>
  );
}
