import React, { useState, useEffect, useRef } from 'react';
import BubbleProgressBar from './BubbleProgressBar';

export default function DotEstimationTask({
  image, filename, distribution, onSubmit,
  timeLimit = 30, remaining, total, current, title = 'Estimate the number of dots'
}) {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showInfo, setShowInfo] = useState(false);
  const timerRef = useRef();
  const inputRef = useRef();
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
    <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto', padding: '0 0 2.5em 0' }}>
      {/* 标题 */}
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, letterSpacing: -1 }}>{title}</div>
      {/* 进度条 */}
      <BubbleProgressBar total={total} current={current} />
      {/* 倒计时在图片外部右上角 */}
      <div style={{
        position: 'absolute', top: 18, right: 18, zIndex: 10,
        background: '#fff', color: '#0071e3', borderRadius: 14,
        padding: '4px 20px', fontWeight: 700, fontSize: 22,
        boxShadow: '0 2px 8px #0001', border: '2px solid #e0e0e0',
        minWidth: 70, textAlign: 'center', letterSpacing: 1
      }}>{timeLeft}s</div>
      {/* info icon */}
      <div style={{ position: 'fixed', left: 24, bottom: 24, zIndex: 100 }}>
        <span
          style={{
            display: 'inline-block',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#f5f6fa',
            color: '#0071e3',
            fontWeight: 700,
            fontSize: 20,
            textAlign: 'center',
            lineHeight: '32px',
            boxShadow: '0 2px 8px #0001',
            cursor: 'pointer',
            userSelect: 'none',
            border: '2px solid #e0e0e0',
          }}
          title="Show image info"
          onClick={() => setShowInfo(v => !v)}
        >i</span>
        {showInfo && (
          <div
            style={{
              position: 'absolute',
              bottom: 38,
              left: 0,
              minWidth: 180,
              background: '#fff',
              color: '#222',
              borderRadius: 10,
              boxShadow: '0 4px 16px #0002',
              padding: '1em',
              fontSize: 15,
              zIndex: 100,
              textAlign: 'left',
            }}
          >
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
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
            <button onClick={() => handleSubmit(false)} style={{ width: 180, fontSize: 18, borderRadius: 10, padding: '0.7em 0', boxShadow: '0 2px 8px #0071e355', background: '#0071e3', color: '#fff', fontWeight: 700, border: 'none' }}>Submit</button>
          </div>
        </>
      )}
      {isSubmitted && (
        <div style={{textAlign:'center',margin:'2em 0',color:'#888',fontSize:20,fontWeight:500}}>submitted, wait for processing...</div>
      )}
    </div>
  );
}
