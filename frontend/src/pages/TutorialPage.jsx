import React from 'react';

export default function TutorialPage({group, onContinue}) {
  return (
    <div className="App">
      <h2>Instructions</h2>
      <p>
        {group === 'untrained'
          ? 'Basic instructions for the task will be shown here.'
          : group === 'exposure'
            ? 'Instructions and practice info for exposure group will be shown here.'
            : 'Instructions, practice, and strategy info for expert group will be shown here.'}
      </p>
      <button onClick={onContinue}>Continue</button>
    </div>
  );
}


