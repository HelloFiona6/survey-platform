import React, {useEffect, useState} from 'react';
import DotEstimationTask from '../components/DotEstimationTask';
import SortByCountTask from '../components/SortByCountTask';
import {backendUrl} from "../index";

// export default function MainTasksPage({user, onComplete}) {
//   let images = [
//     {id: '1', uri: 'https://placehold.co/150x150/FF5733/FFFFFF?text=Image+1', alt: 'Image 1'},
//     {id: '2', uri: 'https://placehold.co/150x150/33FF57/FFFFFF?text=Image+2', alt: 'Image 2'},
//     {id: '3', uri: 'https://placehold.co/150x150/3357FF/FFFFFF?text=Image+3', alt: 'Image 3'},
//     {id: '4', uri: 'https://placehold.co/150x150/FF33DA/FFFFFF?text=Image+4', alt: 'Image 4'},
//     {id: '5', uri: 'https://placehold.co/150x150/DAFF33/FFFFFF?text=Image+5', alt: 'Image 5'},
//   ];
//   return (
//     <div className="App">
//       <h2>Main Tasks</h2>
//       <p>Main tasks for user {user && user.username} (group: {user && user.group}) will be shown here.</p>
//       <ImageSorter images={images}/>
//       <button onClick={onComplete}>Complete Main Tasks</button>
//     </div>
//   );
// }
export default function MainTasksPage({user, task, onComplete}) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // 获取任务题目
  useEffect(() => {
    (async () => {
      // 假设后端返回 [{type: 'dots', image: ...}, {type: 'ranking', images: [...]}, ...]
      try {
        const res = await fetch(new URL(`/api/dot-task?user_id=${user.id}&task=${task.id}`, backendUrl));
        if (res.ok && res.status === 200) {
          const data = await res.json();
          setQuestions(data);
          setLoading(false);
        } else {
          throw new Error('Backend error: ' + res.statusText);
        }
      } catch (e) {
        alert(e);  // includes those from res.json()
      }
    })();
  }, [user.id, task]);

  // 提交点数估计答案
  const handleDotSubmit = ({answer, timeSpent, auto}) => {
    const task = questions[current];
    fetch(new URL('/api/response', backendUrl), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id: user.id,
        question_id: task.id,
        phase: 'test',
        response: answer,
        correct: null,
        time_spent: timeSpent,
      }),
    }).catch(e => alert(e));
    if (current + 1 < questions.length) setCurrent(current + 1);
    else onComplete();
  };

  // 提交图片排序答案
  const handleRankingSubmit = (order) => {
    const task = questions[current];
    fetch(new URL('/api/response', backendUrl), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id: user.id,
        question_id: task.id,
        phase: 'test',
        response: JSON.stringify(order),
        correct: null,
        time_spent: null,
      }),
    }).catch(e => alert(e));
    if (current + 1 < questions.length) setCurrent(current + 1);
    else onComplete();
  };

  if (loading) return <div>Loading tasks...</div>;
  if (!questions.length) return <div>No tasks available.</div>;

  const question = questions[current];
  if (question.type === 'dot_count') {
    let filename = '';
    if (question.image) {
      const parts = question.image.split('/');
      filename = parts[parts.length - 1];
    }
    return (
      <DotEstimationTask
        image={question.image}
        filename={filename}
        distribution={question.distribution}
        onSubmit={handleDotSubmit}
        timeLimit={15}
        total={questions.length}
        current={current}
        title="Estimate the number of dots"
      />
    );
  }
  if (question.type === 'ranking') {
    // TODO images should be Array<Object>, need API wrangling
    return (
      <SortByCountTask
        images={[{id: "I1", src: question.image, alt: "image"}]}
        onSubmit={handleRankingSubmit}
        timeLimit={30}
      />
    );
  }
  return null;
} 
