import React, { useState, useRef } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import ConsentPage from './pages/ConsentPage';
import TutorialPage from './pages/TutorialPage';
import PracticePage from './pages/PracticePage';
import StrategyPage from './pages/StrategyPage';
import MainTasksPage from './pages/MainTasksPage';
import FeedbackPage from './pages/FeedbackPage';
import EndPage from './pages/EndPage';
import AdminPage from './pages/AdminPage';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);

  // 新增：为动画内容创建 ref
  const nodeRef = useRef(null);

  // 只在 mainTasks 之前显示 hero 和 overlay
  const showHero = !['mainTasks', 'feedback', 'end', 'admin'].includes(page);

  return (
    <>
      {showHero && (
        <>
          <div
            className="hero-bg"
            style={{
              background: `url(${process.env.PUBLIC_URL}/hero.jpg) center/cover no-repeat`
            }}
          />
          <div className="overlay" />
        </>
      )}
      <SwitchTransition>
        <CSSTransition
          key={page}
          timeout={400}
          classNames="fade"
          unmountOnExit
          nodeRef={nodeRef} // 关键：传递 nodeRef
        >
          <div className="center-content" ref={nodeRef}>
            {showHero ? (
              <div className="hero-content">
                {/* 页面内容 */}
                {page === 'login' && (
                  <LoginPage onLogin={user => {
                    setUser(user);
                    if (user.group === 'admin') {
                      setPage('admin');
                    } else {
                      setPage('consent');
                    }
                  }} />
                )}
                {page === 'consent' && (
                  <ConsentPage onConsent={() => setPage('tutorial')} />
                )}
                {page === 'tutorial' && (
                  <TutorialPage group={user.group} onContinue={() => {
                    if (user.group === 'untrained') setPage('mainTasks');
                    else setPage('practice');
                  }} />
                )}
                {page === 'practice' && (
                  <PracticePage group={user.group} onComplete={() => {
                    if (user.group === 'expert') setPage('strategy');
                    else setPage('mainTasks');
                  }} />
                )}
                {page === 'strategy' && (
                  <StrategyPage onContinue={() => setPage('mainTasks')} />
                )}
              </div>
            ) : (
              // mainTasks及之后直接用卡片风格
              <>
                {page === 'mainTasks' && (
                  <MainTasksPage user={user} onComplete={() => setPage('feedback')} />
                )}
                {page === 'feedback' && (
                  <FeedbackPage user={user} onSubmit={() => setPage('end')} />
                )}
                {page === 'end' && <EndPage />}
                {page === 'admin' && (
                  <AdminPage onLogout={() => { setUser(null); setPage('login'); }} />
                )}
              </>
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </>
  );
}

export default App;
