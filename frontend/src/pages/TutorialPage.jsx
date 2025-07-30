import React from 'react';

export default function TutorialPage({group, onContinue}) {
  return (
    <div className="App">
      <h2>Instructions</h2>
      <p>
        {group === 'untrained'
          ? 'You will directly go through several tasks, and give feedback. \n\nEnter the number of dots, and click \"next\". You have time limit of 15s each. \n\nAn info button is in the lower-right corner.'
          : group === 'exposure'
            ? 'You will first practice with unlimited time, and go through several tasks with time limit of 15s each, and give feedback. \n\nEnter the number of dots, and click "next". \n\nAn info button is in the lower-right corner.'
            : 'You will first practice with unlimited time, read some strategies, and go through several tasks with time limit of 15s each, and give feedback. \n\nEnter the number of dots, and click "next". \n\nAn info button is in the lower-right corner.'
            }
      </p>
      <button onClick={onContinue}>Continue</button>
    </div>
  );
}


