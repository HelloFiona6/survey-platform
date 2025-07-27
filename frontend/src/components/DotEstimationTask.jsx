import React, { useState, useEffect, useRef } from 'react';
import BubbleProgressBar from './BubbleProgressBar';
import './GenericTask.css'

export default function DotEstimationTask({
  image, filename, distribution, onSubmit,
  timeLimit = 30, total, current, title = 'Estimate the number of dots'
}) {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showInfo, setShowInfo] = useState(false);
  const timerRef = useRef(-1);
  const inputRef = useRef(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setIsSubmitted(false);
    setTimeUp(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeUp(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    // 自动聚焦输入框
    if (inputRef.current) inputRef.current.focus();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [image]);

  const handleSubmit = (auto = false) => {
    if (isSubmitted) return; // 防止多次提交
    clearInterval(timerRef.current);
    setIsSubmitted(true);
    setTimeUp(false);
    onSubmit({ answer: input, timeSpent: timeLimit - timeLeft, auto });
    setInput('');
  };

  return (
    <div id={"task-container"}>
      {/* 标题 */}
      <div className={"title"}>{title}</div>
      {/* 进度条 */}
      <BubbleProgressBar total={total} current={current} />
      {/* 倒计时在图片外部右上角 */}
      <div id={"timer"}>{timeLeft}s</div>
      {/* info icon */}
      <div className={"info"}>
        <span
          className={"icon"}
          title="Show image info"
          onClick={() => setShowInfo(v => !v)}
        >i</span>
        {showInfo && (
          <div className={"popup"}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Image Info</div>
            <div><b>Filename:</b> {filename || 'N/A'}</div>
            {distribution && <div><b>Distribution:</b> {distribution}</div>}
          </div>
        )}
      </div>
      {/* 图片、输入框、按钮区域 */}
      {!isSubmitted && (
        <>
          {!timeUp && (
            <div style={{ margin: '2.5em 0 2.5em 0', display: 'flex', justifyContent: 'center' }}>
              <img src={image} alt="dots" style={{ maxWidth: 420, maxHeight: 420, border: '1.5px solid #ccc', borderRadius: 16, boxShadow: '0 4px 24px #0001' }} />
            </div>
          )}
          <div className={"form"}>
            {timeUp && (
              <div style={{ color: '#0071e3', fontSize: 18, marginBottom: 8, fontWeight: 500 }}>
                Time is up, but you can still submit your answer
              </div>
            )}
            <input
              type="number"
              placeholder="Your estimate"
              value={input}
              onChange={e => setInput(e.target.value)}
              ref={inputRef}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSubmit(false);
                }
              }}
              style={{ margin: '1em 0', width: 160, fontSize: 18, borderRadius: 10, padding: '0.7em 1em', border: '1.5px solid #e0e0e0', boxShadow: '0 2px 8px #0001' }}
            />
            <button onClick={
              () => {
                const str = inputRef.current.value;
                if (str.trim() === '' || isNaN(Number(str))) {
                    alert('Please enter a number');
                }
                else {
                    handleSubmit(false);
                }
              }
            } >Submit</button>
          </div>
        </>
      )}
      {isSubmitted && (
        <div className={"submitted-banner"}>submitted, wait for processing...</div>
      )}
    </div>
  );
}
