import React from 'react';

function TaskSelector({ onSelect }) {
  return (
    <div className="App">
      <h2>Select Task</h2>
      <button onClick={() => onSelect('dots')}>Dots</button>
      <button onClick={() => onSelect('mst')} style={{ marginLeft: '1em' }}>MST</button>
    </div>
  );
}

export default TaskSelector; 