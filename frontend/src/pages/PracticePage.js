import React, { useState } from 'react';
import DotPracticePage from './DotPracticePage';
import RankingPracticePage from './RankingPracticePage';

export default function PracticePage() {
  const [mode, setMode] = useState(null); // null | 'dot' | 'ranking'

  if (!mode) {
    return (
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <h2>Choose Practice Type</h2>
        <button
          style={buttonStyle}
          onClick={() => setMode('dot')}
        >Practice Dot Estimation</button>
        <button
          style={buttonStyle}
          onClick={() => setMode('ranking')}
        >Practice Image Ranking</button>
      </div>
    );
  }

  if (mode === 'dot') return <DotPracticePage onBack={() => setMode(null)} />;
  if (mode === 'ranking') return <RankingPracticePage onBack={() => setMode(null)} />;
}

const buttonStyle = {
  fontSize: 18,
  padding: '0.7em 2em',
  borderRadius: 8,
  background: '#0071e3',
  color: '#fff',
  fontWeight: 700,
  border: 'none',
  margin: '0 1em'
}; 