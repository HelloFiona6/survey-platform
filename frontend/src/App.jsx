import React, {useRef, useState} from 'react';
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
import {CSSTransition, SwitchTransition} from 'react-transition-group';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);

  // 新增：为动画内容创建 ref
  const nodeRef = useRef(null);
  const tasksRef = useRef([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1);

  // 只在 mainTasks 之前显示 hero 和 overlay
  const showHero = !['mainTasks', 'feedback', 'end', 'admin'].includes(page);

  let pageElement;
  switch (page) {
    default:
    case 'login':
      pageElement = <LoginPage onLogin={user => {
        setUser(user);
        if (user.group === 'admin') {
          setPage('admin');
        } else {
          setPage('consent');
        }
      }}/>;
      break;
    case 'consent':
      pageElement = <ConsentPage onConsent={() => setPage('tutorial')}/>;
      break;
    case 'tutorial':
      pageElement = <TutorialPage group={user.group} onContinue={() => {
        setCurrentTaskIndex(x => 0);
        if (user.group === 'untrained') setPage('mainTasks');
        else setPage('practice');
      }}/>;
      break;
    case 'practice':
      pageElement = <PracticePage group={user.group} onComplete={() => {
        if (currentTaskIndex + 1 < tasksRef.current.length) {
          alert(`Only having ${tasksRef.current.length} tasks, but current task is ${currentTaskRef.current}`);
          return;
        }
        setCurrentTaskIndex(x => x + 1);
        if (tasksRef.current[currentTaskIndex].type !== 'practice') {
          if (user.group === 'expert') setPage('strategy');
          else setPage('mainTasks');
        }
      }}/>;
      break;
    case 'mainTasks':
      pageElement = <MainTasksPage user={user} onComplete={() => setPage('feedback')}/>;
      break;
    case 'strategy':
      pageElement = <StrategyPage onContinue={() => setPage('mainTasks')}/>;
      break;
    case 'feedback':
      pageElement = <FeedbackPage user={user} onSubmit={() => {
        if (currentTaskIndex + 1 < tasksRef.current.length) {
          setCurrentTaskIndex(x => x + 1);
          setPage('mainTasks')
        } else {
          setPage('end');
        }
      }}/>;
      break;
    case 'end':
      pageElement = <EndPage/>;
      break;
    case 'admin':
      pageElement = <AdminPage onLogout={() => {
        setUser(null);
        setPage('login');
      }}/>;
      break;
  }


  return (
    <>
      {showHero && (
        <>
          <div className="hero-bg"/>
          <div className="overlay"/>
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
                {pageElement}
              </div>
            ) : (
              // mainTasks及之后直接用卡片风格
              pageElement
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </>
  );
}

export default App;
