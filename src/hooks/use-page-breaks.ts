import { useState, useRef, useEffect } from "react";
import { debounce } from "lodash";

export const usePageBreaks = (
  editorRef: React.RefObject<HTMLDivElement>,
  isUpdatingRef: React.MutableRefObject<boolean>,
  saveSelectionState: () => void,
  restoreSelection: () => boolean,
  scrollPositionRef: React.MutableRefObject<number>
) => {
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);
  const contentHeight = useRef(0);
  const pageHeight = 1056; // Standard US Letter height in pixels at 96 DPI (11 inches)
  
  // Debounced function to calculate page breaks
  const calculatePageBreaksDebounced = debounce(() => {
    if (!editorRef.current || isUpdatingRef.current) return;
    
    // Save current selection and scroll position before updating
    saveSelectionState();
    
    isUpdatingRef.current = true;
    
    // Calculate page breaks based on content height
    const editorHeight = editorRef.current.scrollHeight;
    contentHeight.current = editorHeight;
    
    // Calculate how many pages we need
    const pageCount = Math.max(1, Math.ceil(editorHeight / pageHeight));
    console.log("pageCount", pageCount);
    
    // Generate the array of page break positions
    const breaks = [];
    for (let i = 1; i < pageCount; i++) {
      breaks.push(i * pageHeight);
    }
    
    // Get current editor content to pass along with page update event
    const editorContent = editorRef.current.innerHTML;
    
    // Split content into pages for the sidebar preview
    const pageContents = generatePageContents(editorContent, pageCount);
    
    // Update state only if breaks have changed OR if we're on a single page (to ensure updates even with 1 page)
    if (JSON.stringify(breaks) !== JSON.stringify(pageBreaks) || pageCount === 1) {
      setPageBreaks(breaks);
      
      // Notify other components about page updates and include content
      window.dispatchEvent(
        new CustomEvent('document-update', { 
          detail: { 
            pageCount,
            currentHeight: editorHeight,
            content: editorContent,
            pageContents
          } 
        })
      );
    }
    
    // Restore scroll and selection in the next tick to allow DOM to update first
    setTimeout(() => {
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
      
      // Restore selection
      restoreSelection();
      
      isUpdatingRef.current = false;
    }, 10);
  }, 300);
  
  // Function to split content by pages
  const generatePageContents = (content: string, pageCount: number): string[] => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Create an array to store page contents
    const result: string[] = Array(pageCount).fill("");
    
    // Clone the DOM structure for analysis
    const clonedDiv = document.createElement('div');
    clonedDiv.innerHTML = content;
    clonedDiv.style.width = '816px'; // US Letter width
    clonedDiv.style.visibility = 'hidden';
    clonedDiv.style.position = 'absolute';
    clonedDiv.style.left = '-9999px';
    document.body.appendChild(clonedDiv);
    
    try {
      // Get all top-level elements
      const elements = Array.from(clonedDiv.children);
      
      // Create pages
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const pageDiv = document.createElement('div');
        const startY = pageIndex * pageHeight;
        const endY = (pageIndex + 1) * pageHeight;
        
        // Process elements for this page
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top - clonedDiv.getBoundingClientRect().top;
          const elementBottom = elementTop + rect.height;
          
          // Check if element belongs to this page
          if ((elementTop >= startY && elementTop < endY) || 
              (elementBottom > startY && elementBottom <= endY) ||
              (elementTop <= startY && elementBottom >= endY)) {
            
            // Clone the element to avoid modifying the original
            const elementClone = element.cloneNode(true) as HTMLElement;
            
            // If the element crosses page boundaries, we need to style it for this page
            if (elementTop < startY || elementBottom > endY) {
              // For simplicity, we'll just add the entire element, but this could be optimized
              // to only show the part visible on this page
              if (elementTop < startY) {
                elementClone.style.marginTop = `${startY - elementTop}px`;
              }
              if (elementBottom > endY) {
                elementClone.style.maxHeight = `${endY - Math.max(startY, elementTop)}px`;
                elementClone.style.overflow = 'hidden';
              }
            }
            
            pageDiv.appendChild(elementClone);
          }
        }
        
        result[pageIndex] = pageDiv.innerHTML;
      }
    } finally {
      // Clean up
      if (document.body.contains(clonedDiv)) {
        document.body.removeChild(clonedDiv);
      }
    }
    
    return result;
  };
  
  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      calculatePageBreaksDebounced.cancel();
    };
  }, []);
  
  return {
    pageBreaks,
    calculatePageBreaksDebounced
  };
};
