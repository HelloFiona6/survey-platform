/*
import React, { useState, useEffect, useRef } from 'react';
import {backendUrl} from "../index";

function DotsTask({ user, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(-1);

  useEffect(() => {
    fetch(new URL('/api/dots-questions?count=10', backendUrl))
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || finished) return;
    setTimeLeft(15);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleNext(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [current, loading, finished]);

  const handleSubmit = async (answer, timeSpent) => {
    setSubmitting(true);
    const q = questions[current];
    await fetch(new URL('/api/response', backendUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        question_id: q.id,
        phase: 'test',
        response: answer,
        correct: null,
        time_spent: 15 - timeSpent,
      }),
    });
    setSubmitting(false);
  };

  const handleNext = async (auto = false) => {
    if (submitting || finished) return;
    clearInterval(timerRef.current);
    await handleSubmit(input, timeLeft);
    setInput('');
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
    }
  };

  if (loading) return <div className="App"><h2>Loading questions...</h2></div>;
  if (finished) return (
    <div className="App">
      <h2>All questions completed!</h2>
      <button onClick={onBack}>Back to Main</button>
    </div>
  );
  const q = questions[current];
  let imgSrc = '';
  try {
    const params = JSON.parse(q.params);
    imgSrc = params.img ? `${backendUrl}/images/${params.img}` : '';
  } catch {}
  return (
    <div className="App">
      <h2>Dots Task ({current + 1} / {questions.length})</h2>
      <div style={{ margin: '1em 0' }}>
        {imgSrc ? (
          <img src={imgSrc} alt="dots" style={{ maxWidth: 400, maxHeight: 400, border: '1px solid #ccc' }} />
        ) : <div>No image</div>}
      </div>
      <div>Time left: <b>{timeLeft}s</b></div>
      <div style={{ margin: '1em 0' }}>
        <input
          type="number"
          placeholder="Estimate number of dots"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={submitting}
        />
      </div>
      <button onClick={() => handleNext(false)} disabled={submitting}>Next</button>
      <div style={{ marginTop: '1em' }}>Remaining: {questions.length - current - 1}</div>
    </div>
  );
}

export default DotsTask; */
