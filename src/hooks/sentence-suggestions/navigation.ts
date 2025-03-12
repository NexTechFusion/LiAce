import React from 'react';
import { 
  applyReplacementAtIndex, 
  applySuggestion, 
  clearTabIndicators, 
  updateSuggestionIndicators 
} from './suggestion-renderer';

// Navigate to the next suggestion
export const navigateToNextSuggestion = (
  editorRef: React.RefObject<HTMLDivElement>,
  activeReplacementIndexRef: React.MutableRefObject<number>,
  allSuggestionsRef: React.MutableRefObject<HTMLElement[]>,
  isUpdatingRef: React.MutableRefObject<boolean>
) => {
  const suggestions = allSuggestionsRef.current;
  if (suggestions.length === 0) return;

  // Save the current caret position so we can restore it if needed
  const selection = window.getSelection();
  let originalNode = null;
  let originalOffset = 0;
  
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    originalNode = range.startContainer;
    originalOffset = range.startOffset;
  }

  // Apply the current suggestion if one is active
  if (activeReplacementIndexRef.current >= 0 && activeReplacementIndexRef.current < suggestions.length) {
    const currentElement = suggestions[activeReplacementIndexRef.current];
    if (currentElement.classList.contains('replacement')) {
      applyReplacementAtIndex(activeReplacementIndexRef.current, allSuggestionsRef);
    } else if (currentElement.classList.contains('inline-suggestion')) {
      applySuggestion(editorRef, isUpdatingRef);
    }
  }

  // Move to the next suggestion
  const nextIndex = activeReplacementIndexRef.current + 1;
  if (nextIndex < suggestions.length) {
    activeReplacementIndexRef.current = nextIndex;
    updateSuggestionIndicators(activeReplacementIndexRef, allSuggestionsRef);
    
    // Ensure caret is positioned at the start of the next suggestion
    try {
      if (selection) {
        const nextElement = suggestions[nextIndex];
        if (nextElement && document.contains(nextElement)) {
          const range = document.createRange();
          range.selectNodeContents(nextElement);
          range.collapse(true); // Collapse to start
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } catch (error) {
      console.error('Error positioning caret at next suggestion:', error);
      
      // If failed, attempt to restore original caret position
      if (originalNode && selection && document.contains(originalNode)) {
        try {
          const range = document.createRange();
          range.setStart(originalNode, originalOffset);
          range.setEnd(originalNode, originalOffset);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (innerError) {
          console.error('Error restoring original caret position:', innerError);
        }
      }
    }
  } else {
    // Reset if we've gone through all suggestions
    resetSuggestionNavigation(activeReplacementIndexRef, allSuggestionsRef);
  }
};

// Skip the current suggestion without applying it
export const skipCurrentSuggestion = (
  activeReplacementIndexRef: React.MutableRefObject<number>,
  allSuggestionsRef: React.MutableRefObject<HTMLElement[]>
) => {
  const suggestions = allSuggestionsRef.current;
  if (suggestions.length === 0) return;

  // Get the current suggestion element
  const currentIndex = activeReplacementIndexRef.current;
  if (currentIndex >= 0 && currentIndex < suggestions.length) {
    const currentElement = suggestions[currentIndex];
    
    // If it's a replacement, we need to restore the original text
    if (currentElement.classList.contains('replacement')) {
      // Create a text node with the original content
      // We can extract the original text from the parent node or the data attribute if it exists
      const originalText = currentElement.getAttribute('data-original') || 
                          currentElement.parentElement?.textContent || '';
      
      // Replace the span with a text node
      if (currentElement.parentNode) {
        currentElement.parentNode.replaceChild(
          document.createTextNode(originalText),
          currentElement
        );
        
        // Update the suggestions array by removing the current element
        allSuggestionsRef.current = suggestions.filter(
          (_, index) => index !== currentIndex
        );
      }
    } else if (currentElement.classList.contains('inline-suggestion')) {
      // For inline suggestions, simply remove them
      currentElement.remove();
      
      // Update the suggestions array by removing the current element
      allSuggestionsRef.current = suggestions.filter(
        (_, index) => index !== currentIndex
      );
    }
  }

  // Move to the next suggestion
  // Note: We need to recalculate the suggestions array after removing an element
  const updatedSuggestions = allSuggestionsRef.current;
  
  if (currentIndex < updatedSuggestions.length) {
    // Stay at the same index since we removed the current element
    // (the next element shifted into the current position)
    activeReplacementIndexRef.current = currentIndex;
  } else if (updatedSuggestions.length > 0) {
    // If we were at the last element and there are still suggestions left,
    // go to the first one
    activeReplacementIndexRef.current = 0;
  } else {
    // No suggestions left, reset
    resetSuggestionNavigation(activeReplacementIndexRef, allSuggestionsRef);
    return;
  }
  
  updateSuggestionIndicators(activeReplacementIndexRef, allSuggestionsRef);
};

// Reset the suggestion navigation state
export const resetSuggestionNavigation = (
  activeReplacementIndexRef: React.MutableRefObject<number>,
  allSuggestionsRef: React.MutableRefObject<HTMLElement[]>
) => {
  activeReplacementIndexRef.current = -1;
  allSuggestionsRef.current = [];
  clearTabIndicators();
}; 