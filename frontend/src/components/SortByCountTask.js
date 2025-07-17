import ImageSorter from "./ImageSorter";
import React, {useEffect, useRef, useState} from "react";
import BubbleProgressBar from "./BubbleProgressBar";

/**
 * Sort images by dot numbers ascending, uses ImageSorter, adds submission and timer.
 *
 * @param {{id:String, src:String, alt:String}[]} images passed to ImageSorter
 * @param {function(Number[]): void} onSubmit callback for answer
 * @param {Number} timeLimit assume positive
 * @param total
 * @param current
 * @param title
 * @returns {JSX.Element}
 * @constructor
 */
function SortByCountTask({
  images, onSubmit, timeLimit=30, total=1, current=1, title="Sort the images by number of dots ascending"
}) {
  const [showInfo, setShowInfo] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [order, setOrder] = useRef(images.map(I=>I.id));
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef(-1);
  const [timeUp, setTimeUp] = useState(false);
  useEffect(() => {
    setTimeLeft(timeLimit);
    setIsSubmitted(false);
    setTimeUp(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeUp(true);
          handleSubmit(true)
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [images]);

  const handleSubmit = (auto = false) => {
    if (isSubmitted) return; // 防止多次提交
    clearInterval(timerRef.current);
    setIsSubmitted(true);
    setTimeUp(false);
    onSubmit([]);  // TODO find some props for ImageSorter to return
  };


  return <div id={"task-container"}>
    <div className={"title"}>{title}</div>
    <BubbleProgressBar total={total} current={current} />
    <div id={"timer"}>{timeLeft}</div>
    <div id={"info"}>
      <span className={"icon"} title={"Show image info"} onClick={() => setShowInfo(v=>!v)}>i</span>
      {showInfo && (
        <div className={"popup"}>
          <div>Image Info</div>
          <div>🥳</div>
        </div>
      )}
    </div>
    {!isSubmitted ? (
      <>
        <ImageSorter images={images}/>
        <div className={"form"}>
          {timeUp && (
            <div className={"notice"}>
              Time is up, but you can still submit your answer
            </div>
          )}
          <button onClick={() => handleSubmit(false)}>Submit</button>
        </div>
      </>) : (
      <div id={"time-up-banner"}>submitted, wait for processing... </div>
    )}
  </div>
}

export default SortByCountTask;