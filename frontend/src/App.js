import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ConsentPage from './pages/ConsentPage';
import TutorialPage from './pages/TutorialPage';
import PracticePage from './pages/PracticePage';
import StrategyPage from './pages/StrategyPage';
import MainTasksPage from './pages/MainTasksPage';
import FeedbackPage from './pages/FeedbackPage';
import EndPage from './pages/EndPage';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null); // { id, group }
  const [consentGiven, setConsentGiven] = useState(false);

  // ...other global state

  if (page === 'login') {
    return <LoginPage onLogin={(user) => { setUser(user); setPage('consent'); }} />;
  }
  if (page === 'consent') {
    return <ConsentPage onConsent={() => setPage('tutorial')} />;
  }
  if (page === 'tutorial') {
    return <TutorialPage group={user.group} onContinue={() => {
      if (user.group === 'untrained') setPage('mainTasks');
      else setPage('practice');
    }} />;
  }
  if (page === 'practice') {
    return <PracticePage group={user.group} onComplete={() => {
      if (user.group === 'expert') setPage('strategy');
      else setPage('mainTasks');
    }} />;
  }
  if (page === 'strategy') {
    return <StrategyPage onContinue={() => setPage('mainTasks')} />;
  }
  if (page === 'mainTasks') {
    return <MainTasksPage user={user} onComplete={() => setPage('feedback')} />;
  }
  if (page === 'feedback') {
    return <FeedbackPage user={user} onSubmit={() => setPage('end')} />;
  }
  if (page === 'end') {
    return <EndPage />;
  }
  return null;
}

export default App;
