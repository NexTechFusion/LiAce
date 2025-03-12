
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface ImageResizerProps {
  editorRef: React.RefObject<HTMLDivElement>;
  isUpdatingRef: React.MutableRefObject<boolean>;
  handleContentChange: () => void;
}

const ImageResizer = ({ editorRef, isUpdatingRef, handleContentChange }: ImageResizerProps) => {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const [initialResizeData, setInitialResizeData] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    element: HTMLImageElement;
  } | null>(null);
  const { toast } = useToast();
  
  // Helper function to add resize handles to an image
  const addResizeHandles = (img: HTMLImageElement) => {
    // Check if handles already exist
    if (img.parentElement?.className.includes('image-container')) {
      return;
    }
    
    // Create a container for the image and handles
    const container = document.createElement('div');
    container.className = 'image-container';
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.style.margin = '4px';
    
    // Move image inside the container
    img.parentNode?.insertBefore(container, img);
    container.appendChild(img);
    
    // Add highlight styling
    img.style.outline = '2px solid #3b82f6';
    
    // Create and add resize handles (all 8 directions)
    const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    
    directions.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-${dir}`;
      handle.dataset.position = dir;
      
      // Common handle styles
      handle.style.position = 'absolute';
      handle.style.width = '10px';
      handle.style.height = '10px';
      handle.style.background = '#3b82f6';
      handle.style.borderRadius = '50%';
      handle.style.zIndex = '100';
      handle.style.cursor = `${dir}-resize`;
      
      // Position the handle based on direction
      switch(dir) {
        case 'n':
          handle.style.top = '-5px';
          handle.style.left = '50%';
          handle.style.transform = 'translateX(-50%)';
          break;
        case 'ne':
          handle.style.top = '-5px';
          handle.style.right = '-5px';
          break;
        case 'e':
          handle.style.top = '50%';
          handle.style.right = '-5px';
          handle.style.transform = 'translateY(-50%)';
          break;
        case 'se':
          handle.style.bottom = '-5px';
          handle.style.right = '-5px';
          break;
        case 's':
          handle.style.bottom = '-5px';
          handle.style.left = '50%';
          handle.style.transform = 'translateX(-50%)';
          break;
        case 'sw':
          handle.style.bottom = '-5px';
          handle.style.left = '-5px';
          break;
        case 'w':
          handle.style.top = '50%';
          handle.style.left = '-5px';
          handle.style.transform = 'translateY(-50%)';
          break;
        case 'nw':
          handle.style.top = '-5px';
          handle.style.left = '-5px';
          break;
      }
      
      container.appendChild(handle);
    });
  };

  // Helper function to remove resize handles from an image
  const removeResizeHandles = (img: HTMLImageElement) => {
    // Find the container
    const container = img.parentElement;
    if (!container || !container.className.includes('image-container')) {
      return;
    }
    
    // Remove outline
    img.style.outline = 'none';
    
    // Remove the handles
    const handles = container.querySelectorAll('.resize-handle');
    handles.forEach(handle => handle.remove());
    
    // Move the image back to its original position
    container.parentNode?.insertBefore(img, container);
    container.remove();
  };

  // Apply resizable properties to images
  const applyResizableProperties = (img: HTMLImageElement) => {
    img.draggable = false;
    img.style.position = 'relative';
    img.style.cursor = 'default';
  };

  // Setup event handlers for image resizing
  useEffect(() => {
    if (!editorRef.current) return;

    const handleImageClick = (e: MouseEvent) => {
      if (isUpdatingRef.current) return;
      
      const target = e.target as HTMLElement;
      
      // Check if clicked element is an image
      if (target.tagName === 'IMG') {
        // If we have a previously selected image, remove its highlight
        if (selectedImage && selectedImage !== target) {
          removeResizeHandles(selectedImage);
        }
        
        // Set the new selected image
        const imgElement = target as HTMLImageElement;
        setSelectedImage(imgElement);
        
        // Add resize handles
        addResizeHandles(imgElement);
        
        // Prevent the default editor behavior
        e.stopPropagation();
      } else if (target.className.includes('resize-handle')) {
        // Handle clicks on resize handles
        e.stopPropagation();
      } else if (selectedImage) {
        // If clicked elsewhere, deselect the image
        removeResizeHandles(selectedImage);
        setSelectedImage(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isUpdatingRef.current) return;
      
      const target = e.target as HTMLElement;
      
      // Check if the target is a resize handle
      if (target.className.includes('resize-handle')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Find the parent image
        const img = target.parentElement?.querySelector('img') as HTMLImageElement;
        if (!img) return;
        
        // Start resizing
        setResizing(true);
        
        // Store initial position and size
        setInitialResizeData({
          startX: e.clientX,
          startY: e.clientY,
          startWidth: img.offsetWidth,
          startHeight: img.offsetHeight,
          element: img
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !initialResizeData) return;
      
      e.preventDefault();
      
      const { startX, startY, startWidth, startHeight, element } = initialResizeData;
      
      // Calculate width/height change based on mouse movement
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      // Get the resize handle being dragged
      const target = e.target as HTMLElement;
      const handlePosition = target.dataset.position || '';
      
      if (handlePosition.includes('e')) {
        // East (right) handle
        newWidth = startWidth + (e.clientX - startX);
      } else if (handlePosition.includes('w')) {
        // West (left) handle
        newWidth = startWidth - (e.clientX - startX);
      }
      
      if (handlePosition.includes('s')) {
        // South (bottom) handle
        newHeight = startHeight + (e.clientY - startY);
      } else if (handlePosition.includes('n')) {
        // North (top) handle
        newHeight = startHeight - (e.clientY - startY);
      }
      
      // Calculate aspect ratio
      const aspectRatio = startWidth / startHeight;
      
      // Maintain aspect ratio
      if (handlePosition.includes('se') || handlePosition.includes('nw')) {
        // Diagonal handles - maintain aspect ratio
        if (Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }
      
      // Apply new dimensions
      if (newWidth > 50 && newHeight > 50) {
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (resizing) {
        e.preventDefault();
        
        // End resizing
        setResizing(false);
        setInitialResizeData(null);
        
        // Update content after resizing
        handleContentChange();
      }
    };

    const editor = editorRef.current;
    
    // Add event listeners
    editor.addEventListener('click', handleImageClick);
    editor.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      // Clean up event listeners
      editor.removeEventListener('click', handleImageClick);
      editor.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedImage, resizing, initialResizeData]);

  return null; // This is a behavior-only component, no UI to render
};

export default ImageResizer;
