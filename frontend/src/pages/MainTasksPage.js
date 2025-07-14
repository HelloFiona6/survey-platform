import React from 'react';
import ImageSorter from '../components/ImageSorter'

export default function MainTasksPage({user, onComplete}) {
  return (
    <div className="App">
      <h2>Main Tasks</h2>
      <p>Main tasks for user {user && user.username} (group: {user && user.group}) will be shown here.</p>
      <ImageSorter images={[
        {id: '1', uri: 'https://placehold.co/150x150/FF5733/FFFFFF?text=Image+1', alt: 'Image 1'},
        {id: '2', uri: 'https://placehold.co/150x150/33FF57/FFFFFF?text=Image+2', alt: 'Image 2'},
        {id: '3', uri: 'https://placehold.co/150x150/3357FF/FFFFFF?text=Image+3', alt: 'Image 3'},
        {id: '4', uri: 'https://placehold.co/150x150/FF33DA/FFFFFF?text=Image+4', alt: 'Image 4'},
        {id: '5', uri: 'https://placehold.co/150x150/DAFF33/FFFFFF?text=Image+5', alt: 'Image 5'},
      ]}/>
      <button onClick={onComplete}>Complete Main Tasks</button>
    </div>
  );
}