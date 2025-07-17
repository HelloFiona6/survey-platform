import {useMemo, useRef, useState} from "react";
import './ImageSorter.css'
/**
 * ImageSorter Component
 *
 * A React component that displays a row of images and allows users to reorder them via drag and drop.
 * It provides visual feedback during the drag operation, including a placeholder at the original
 * position and a grayed-out image at the new hovered position.
 *
 * @param {Object} props - The component props.
 * @param {Object[]} props.images - An array of {id, src, alt} objects
 */
function ImageSorter({images}) {
  // State to hold the current order of images
  const [imageList, setImageList] = useState(images);

  // State to track the ID of the image currently being dragged
  const [draggingImageId, setDraggingImageId] = useState(null);

  // Dummy state to force re-render when hoveredOverDisplayIndex changes,
  // ensuring useMemo re-evaluates for immediate visual feedback.
  const [reorderTrigger, setReorderTrigger] = useState(false);

  // useRef to store the original index of the item being dragged in the actual imageList
  const draggedItemOriginalIndex = useRef(null);
  // useRef to store the index of the item being dragged over in the *current display order*
  const hoveredOverDisplayIndex = useRef(null);

  const dragIcon = new Image();
  dragIcon.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  /**
   * Handles the start of a drag operation.
   * Stores the ID and original index of the dragged item.
   * @param {DragEvent} e - The drag event.
   * @param {string} imageId - The ID of the image being dragged.
   * @param {number} originalIndex - The original index of the image in the imageList.
   */
  function handleDragStart(e, imageId, originalIndex) {
    draggedItemOriginalIndex.current = originalIndex;
    setDraggingImageId(imageId); // Set state to trigger re-render for styling
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(dragIcon,0,0)
    console.log('Drag started for ID:', imageId, 'at original index:', originalIndex);
  }

  /**
   * Handles the drag over event.
   * Prevents default to allow dropping.
   * Updates the hoveredOverDisplayIndex and forces a re-render for immediate visual reordering.
   * @param {DragEvent} e - The drag event.
   * @param {number} displayIndex - The index of the image being dragged over in the current display list.
   */
  function handleDragOver(e, displayIndex) {
    e.preventDefault(); // Necessary to allow dropping
    // Only update if the hover target changes, and it's not dragging over itself in the reordered list
    if (hoveredOverDisplayIndex.current !== displayIndex) {
      hoveredOverDisplayIndex.current = displayIndex;
      setReorderTrigger(prev => !prev); // Force re-render for useMemo
      console.log('Dragging over display index:', displayIndex);
    }
  }

  /**
   * Handles the drop event.
   * Reorders the image list based on drag and drop indices.
   */
  function handleDrop() {
    // Check if a valid drag operation was in progress
    if (draggingImageId === null || draggedItemOriginalIndex.current === null || hoveredOverDisplayIndex.current === null) {
      // Reset if a drop happens without a valid drag state (e.g., dropped outside valid target)
      setDraggingImageId(null);
      draggedItemOriginalIndex.current = null;
      hoveredOverDisplayIndex.current = null;
      setReorderTrigger(false);
      return;
    }

    let newImageList = [...imageList];
    const draggedContent = newImageList.splice(draggedItemOriginalIndex.current, 1)[0];
    newImageList.splice(hoveredOverDisplayIndex.current, 0, draggedContent);

    setImageList(newImageList); // Update the actual image list state

    // Reset all drag-related states/refs
    setDraggingImageId(null);
    draggedItemOriginalIndex.current = null;
    hoveredOverDisplayIndex.current = null;
    setReorderTrigger(false);
    console.log('Drop completed. New order:', newImageList.map(img => img.id));
  }

  /**
   * Handles the drag end event.
   * Resets drag-related states/refs, useful for cases where drag is canceled (e.g., dropping outside).
   */
  const handleDragEnd = () => {
    // Reset all drag-related states/refs
    setDraggingImageId(null);
    draggedItemOriginalIndex.current = null;
    hoveredOverDisplayIndex.current = null;
    setReorderTrigger(false);
    console.log('Drag ended.');
  };

  /**
   * Memoized list for display, which includes the immediate reordering effect
   * and a placeholder at the original position of the dragged item.
   */
  const finalDisplayList = useMemo(() => {
    // If no drag is in progress, return the original imageList with no placeholders
    if (draggingImageId === null || draggedItemOriginalIndex.current === null || hoveredOverDisplayIndex.current === null) {
      return imageList.map(img => ({...img, isPlaceholder: false}));
    }

    let tempImageList = [...imageList];
    const draggedItem = tempImageList[draggedItemOriginalIndex.current];

    // The image list when the user hasn't dropped the image
    let listWithPlaceholderAtOriginalSpot = imageList.map(
      (img, idx) => idx === draggedItemOriginalIndex.current ? { // Special placeholder object
        id: 'placeholder', uri: '', alt: 'Placeholder', isPlaceholder: true
      } : {
        ...img, isPlaceholder: false
      });

    // the dragged image is inserted to another position
    listWithPlaceholderAtOriginalSpot.splice(draggedItemOriginalIndex.current, 1);
    listWithPlaceholderAtOriginalSpot.splice(hoveredOverDisplayIndex.current, 0, {
      ...draggedItem, isPlaceholder: false
    });

    return listWithPlaceholderAtOriginalSpot;
  }, [imageList, draggingImageId, draggedItemOriginalIndex.current, hoveredOverDisplayIndex.current, reorderTrigger]);

  return (<div className={"image-list"}>
    {finalDisplayList.map((image, index) => {
      const isCurrentlyDragged = image.id === draggingImageId && !image.isPlaceholder;
      const isPlaceholder = image.isPlaceholder;

      return (<div
        key={image.id === 'placeholder' ? `placeholder-${index}` : image.id} // Unique key for placeholder
        draggable={!isPlaceholder} // Only allow dragging real images
        onDragStart={!isPlaceholder ? (e) => handleDragStart(e, image.id, imageList.findIndex(img => img.id === image.id)) : null}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        className={`image-holder
          ${isCurrentlyDragged ? "dragging" : ""}
          ${hoveredOverDisplayIndex.current === index && !isCurrentlyDragged && !isPlaceholder ? 'hovered-over' : ''}  // rather useless
        `}
      >
        {/* Number Label for each position */}
        <p className={"index"}>#{index + 1}</p>

        {/* Render placeholder content or actual image */}
        {isPlaceholder ? (
          <div className="placeholder">Drag Here</div>
        ) : (
          <img src={image.uri} alt={image.alt}
            onError={(e) => {
              e.target.onerror = null; // Prevents infinite loop if fallback also fails
              e.target.src = `https://placehold.co/150x150/CCCCCC/000000?text=Error`;
              console.error(`Failed to load image: ${image.uri}`);
            }}
          />
        )}
        {/*{!isPlaceholder && <p className="mt-2 text-sm text-gray-700">{image.alt}</p>}*/}
      </div>);
    })}
  </div>);
}

export default ImageSorter;