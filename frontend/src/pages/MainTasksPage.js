import React, { useState, useEffect } from 'react';
import DotEstimationTask from '../components/DotEstimationTask';
// import ImageSorter from '../components/ImageSorter'

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
export default function MainTasksPage({ user, onComplete }) {
  const [tasks, setTasks] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // 获取任务题目
  useEffect(() => {
    // 假设后端返回 [{type: 'dots', image: ...}, {type: 'ranking', images: [...]}, ...]
    fetch(`http://localhost:5000/api/main-tasks?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      });
  }, [user.id]);

  // 提交点数估计答案
  const handleDotSubmit = ({ answer, timeSpent, auto }) => {
    const task = tasks[current];
    fetch('http://localhost:5000/api/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        question_id: task.id,
        phase: 'test',
        response: answer,
        correct: null,
        time_spent: timeSpent,
      }),
    });
    if (current + 1 < tasks.length) setCurrent(current + 1);
    else onComplete();
  };

  // 提交图片排序答案
  const handleRankingSubmit = (order) => {
    const task = tasks[current];
    fetch('http://localhost:5000/api/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        question_id: task.id,
        phase: 'test',
        response: JSON.stringify(order),
        correct: null,
        time_spent: null,
      }),
    });
    if (current + 1 < tasks.length) setCurrent(current + 1);
    else onComplete();
  };

  if (loading) return <div>Loading tasks...</div>;
  if (!tasks.length) return <div>No tasks available.</div>;

  const task = tasks[current];
  if (task.type === 'dots') {
    return (
      <DotEstimationTask
        image={task.image}
        onSubmit={handleDotSubmit}
        timeLimit={15}
        remaining={tasks.length - current - 1}
      />
    );
  }
  // if (task.type === 'ranking') {
  //   return (
  //     <ImageRankingTask
  //       images={task.images}
  //       onSubmit={handleRankingSubmit}
  //       timeLimit={30}
  //     />
  //   );
  // }
  return null;
} 
