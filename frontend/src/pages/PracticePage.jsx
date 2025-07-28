import React, {useEffect, useRef, useState} from 'react';
import {backendUrl} from "../index";

export default function PracticePage({group, onComplete}) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(-1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(new URL(`/api/practice-questions?group=${group}`, backendUrl));
        if (!res.ok) {
          throw new Error('Backend error: ' + res.statusText);
        }
        const data = await res.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        alert(err);  // includes those from res.json()
      }
    })();
  }, [group]);

  useEffect(() => {
    if (loading || showFeedback) return;
    setTimeLeft(15);
    timerRef.current && clearInterval(timerRef.current);
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
  }, [current, loading, showFeedback]);

  const handleSubmit = async (auto = false) => {
    if (submitting || showFeedback) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    const q = questions[current];
    // Submit answer to backend (optional for practice)
    // Show feedback (correct answer)
    let correct = q.answer;
    setFeedback(`Correct answer: ${correct}`);
    setShowFeedback(true);
    setSubmitting(false);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setInput('');
    if (current + 1 >= questions.length) {
      onComplete();
    } else {
      setCurrent(current + 1);
    }
  };

  if (loading) return <div className="App"><h2>Loading practice questions...</h2></div>;
  if (!questions.length) return <div className="App"><h2>No practice questions available.</h2></div>;
  const q = questions[current];
  let imgSrc = q.image;
  return (
    <div className="App">
      <h2>Practice Task {current + 1} / {questions.length}</h2>
      <div style={{margin: '1em 0'}}>
        {imgSrc ? (
          <img src={imgSrc} alt="practice" style={{maxWidth: 400, maxHeight: 400, border: '1px solid #ccc'}}/>
        ) : <div>No image</div>}
      </div>
      {!showFeedback && (
        <>
          <div>Time left: <b>{timeLeft}s</b></div>
          <div style={{margin: '1em 0'}}>
            <input
              type="number"
              placeholder="Estimate number of dots"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={submitting}
            />
          </div>
          <button onClick={() => handleSubmit(false)} disabled={submitting}>Submit</button>
        </>
      )}
      {showFeedback && (
        <div style={{margin: '1em 0', color: 'green'}}>
          <div>{feedback}</div>
          <button onClick={handleNext}>Next</button>
        </div>
      )}
      <div style={{marginTop: '1em'}}>Remaining: {questions.length - current - 1}</div>
    </div>
  );
} 