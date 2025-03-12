import React from 'react';
import { Suggestion } from './types';

// Clear any inline suggestions from the editor
export const clearSuggestions = (editorRef: React.RefObject<HTMLDivElement>) => {
  if (!editorRef.current) return;

  // Find all inline suggestions and replacements
  const suggestions = editorRef.current.querySelectorAll('.inline-suggestion, .replacement');
  suggestions.forEach(suggestion => {
    if (suggestion.classList.contains('replacement')) {
      // For replacements, restore the original text using data-original attribute
      const originalText = suggestion.getAttribute('data-original') || suggestion.textContent || '';
      if (suggestion.parentNode) {
        suggestion.parentNode.replaceChild(
          document.createTextNode(originalText),
          suggestion
        );
      }
    } else {
      // For inline suggestions, simply remove them
      suggestion.remove();
    }
  });
};

// Clear all tab indicators
export const clearTabIndicators = () => {
  const indicators = document.querySelectorAll('.tab-indicator');
  indicators.forEach(indicator => indicator.remove());
};

// Apply the current suggestion by changing its class
export const applySuggestion = (
  editorRef: React.RefObject<HTMLDivElement>,
  isUpdatingRef: React.MutableRefObject<boolean>
) => {
  if (!editorRef.current) return;

  // Find the suggestion element
  const suggestionElement = editorRef.current.querySelector('.inline-suggestion');
  if (suggestionElement) {
    // Save the position - we want to place cursor AFTER the suggestion
    const selection = window.getSelection();
    if (!selection) return;

    // Save this for later
    const suggestionEndNode = suggestionElement.lastChild || suggestionElement;
    const suggestionEndOffset = suggestionElement.lastChild && suggestionElement.lastChild.nodeType === Node.TEXT_NODE
      ? (suggestionElement.lastChild as Text).length
      : 0;

    // Convert suggestion to applied suggestion
    suggestionElement.classList.remove('inline-suggestion');
    suggestionElement.classList.add('applied-suggestion');

    // Update styling
    const htmlElement = suggestionElement as HTMLElement;
    htmlElement.style.color = 'inherit';
    htmlElement.style.opacity = '1';

    // Use setTimeout to ensure DOM is updated before positioning the caret
    setTimeout(() => {
      try {
        // Create a new range at the end of the suggestion
        const range = document.createRange();

        // If the suggestion has text nodes as children, set the position after the last text
        if (suggestionEndNode && suggestionEndNode.nodeType === Node.TEXT_NODE) {
          range.setStart(suggestionEndNode, suggestionEndOffset);
          range.setEnd(suggestionEndNode, suggestionEndOffset);
        } else {
          // Fallback - set position after the element
          range.selectNodeContents(suggestionElement);
          range.collapse(false); // Collapse to the end
        }

        // Apply the new selection
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (error) {
        console.error('Error setting caret position:', error);
      }
    }, 0);
  }
};

// Apply a specific replacement at the given index
export const applyReplacementAtIndex = (index: number, allSuggestionsRef: React.MutableRefObject<HTMLElement[]>) => {
  const suggestions = allSuggestionsRef.current;
  if (index < 0 || index >= suggestions.length) return;

  const replacementElement = suggestions[index];
  if (!replacementElement.classList.contains('replacement')) return;

  // Apply the replacement
  replacementElement.classList.remove('replacement');
  replacementElement.classList.add('applied-replacement');
  replacementElement.style.color = 'inherit';
  replacementElement.style.opacity = '1';

  // Remove the tab indicator
  const indicator = replacementElement.querySelector('.tab-indicator');
  if (indicator) indicator.remove();
};

// Update all suggestion indicators to show which one is active
export const updateSuggestionIndicators = (
  activeReplacementIndexRef: React.MutableRefObject<number>,
  allSuggestionsRef: React.MutableRefObject<HTMLElement[]>
) => {
  clearTabIndicators();

  const suggestions = allSuggestionsRef.current;
  const activeIndex = activeReplacementIndexRef.current;

  if (activeIndex >= 0 && activeIndex < suggestions.length) {
    const activeElement = suggestions[activeIndex];

    // Create the tab indicator
    const tabIndicator = document.createElement('span');
    tabIndicator.className = 'tab-indicator';
    tabIndicator.textContent = 'Tab →';

    // Make sure the element is positioned relatively
    activeElement.style.position = 'relative';
    activeElement.appendChild(tabIndicator);
  }
};

// Apply continuation to the editor
export const applyContinuation = (
  editorRef: React.RefObject<HTMLDivElement>,
  suggestion: Suggestion,
  isUpdatingRef: React.MutableRefObject<boolean>,
  allSuggestionsRef: React.MutableRefObject<HTMLElement[]>,
  activeReplacementIndexRef: React.MutableRefObject<number>
) => {
  if (!editorRef.current) return;

  // Get the current selection
  const selection = window.getSelection();
  if (!selection) return;

  // Get the current range
  const range = selection.getRangeAt(0);
  if (!range) return;

  // Save caret position information
  const caretNode = range.startContainer;
  const caretOffset = range.startOffset;

  // Insert the suggestion
  isUpdatingRef.current = true;

  // Create a span element for the suggestion
  const suggestionElement = document.createElement('span');
  suggestionElement.className = 'inline-suggestion';
  suggestionElement.textContent = suggestion.continuation;
  suggestionElement.style.color = '#53535399';
  suggestionElement.style.pointerEvents = 'none';
  suggestionElement.style.position = 'relative';

  // Insert the suggestion at cursor position
  range.insertNode(suggestionElement);

  // Move selection before the suggestion
  range.setStartBefore(suggestionElement);
  range.setEndBefore(suggestionElement);
  selection.removeAllRanges();
  selection.addRange(range);

  // Ensure caret position is maintained at the original position
  try {
    const newRange = document.createRange();
    newRange.setStart(caretNode, caretOffset);
    newRange.setEnd(caretNode, caretOffset);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } catch (error) {
    console.error('Error restoring caret position:', error);
  }

  isUpdatingRef.current = false;

  // If there are no replacements, set this as the only active suggestion
  if (!suggestion.replacements || suggestion.replacements.length === 0) {
    allSuggestionsRef.current = [suggestionElement];
    activeReplacementIndexRef.current = 0;
    updateSuggestionIndicators(activeReplacementIndexRef, allSuggestionsRef);
  }
}

// Apply replacements to the editor
export const applyReplacements = (
  editorRef: React.RefObject<HTMLDivElement>,
  suggestion: Suggestion,
  activeReplacementIndexRef: React.MutableRefObject<number>,
  allSuggestionsRef: React.MutableRefObject<HTMLElement[]>
) => {
  if (!editorRef.current || !suggestion.replacements.length) return;

  // Reset suggestion navigation
  activeReplacementIndexRef.current = -1;
  allSuggestionsRef.current = [];
  clearTabIndicators();

  // Get current selection to determine caret position
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const caretNode = range.startContainer;
  const caretOffset = range.startOffset;

  // Store original caret position
  const originalCaretNode = caretNode;
  const originalCaretOffset = caretOffset;

  // We'll use a TreeWalker to iterate through all text nodes
  const treeWalker = document.createTreeWalker(
    editorRef.current,
    NodeFilter.SHOW_TEXT,
    null
  );

  // Store all text nodes that we find
  const textNodes: Text[] = [];
  let currentNode: Text | null;

  // Collect all text nodes
  while ((currentNode = treeWalker.nextNode() as Text)) {
    textNodes.push(currentNode);
  }

  console.log("textNodes", textNodes.map(textNode => textNode.nodeValue));

  // Process each text node only once, applying all replacements in a single operation
  textNodes.forEach(textNode => {
    let text = textNode.nodeValue || '';
    let hasReplacement = false;

    // Apply all replacements to this text node's content
      suggestion.replacements.forEach(({ original, fixed: replacement }) => {
      if (text.includes(original)) {
        // Escape special regex characters in the original text
        const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create a pattern that matches the exact phrase, handling both words and sentences
        // For single words, use word boundaries
        // For phrases/sentences, match exact text including spaces and punctuation
        const isWord = !original.includes(' ') && !/[.,!?]/.test(original);
        const pattern = isWord 
          ? new RegExp(`\\b${escapedOriginal}\\b`, 'g')
          : new RegExp(escapedOriginal, 'g');

        text = text.replace(
          pattern,
          `<span class="replacement" style="position: relative;" data-original="${original}">${replacement}</span>`
        );
        hasReplacement = true;
      }
    });

    // Only replace the node if we've made changes
    if (hasReplacement && textNode.parentNode) {
      // Create a temporary element
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;

      // Replace the text node with the new nodes
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    }
  });

  // Collect all replacement elements after they've been added to the DOM
  setTimeout(() => {
    const replacementElements = editorRef.current?.querySelectorAll('.replacement') || [];
    allSuggestionsRef.current = Array.from(replacementElements) as HTMLElement[];

    // Add the continuation as the last suggestion if it exists
    const continuationElement = editorRef.current?.querySelector('.inline-suggestion') as HTMLElement;
    if (continuationElement) {
      allSuggestionsRef.current.push(continuationElement);
    }

    // Set the first suggestion as active
    if (allSuggestionsRef.current.length > 0) {
      activeReplacementIndexRef.current = 0;
      updateSuggestionIndicators(activeReplacementIndexRef, allSuggestionsRef);
    }

    // After applying all replacements, restore the original caret position
    try {
      const newSelection = window.getSelection();
      if (newSelection) {
        // Try to restore the original caret position if possible
        if (document.contains(originalCaretNode)) {
          const newRange = document.createRange();
          newRange.setStart(originalCaretNode, originalCaretOffset);
          newRange.setEnd(originalCaretNode, originalCaretOffset);
          newSelection.removeAllRanges();
          newSelection.addRange(newRange);
        }
        // If original node is no longer in DOM, and we have replacements, set cursor position at end of the last one
        else if (allSuggestionsRef.current.length > 0) {
          const lastReplacement = allSuggestionsRef.current[allSuggestionsRef.current.length - 1];
          if (document.contains(lastReplacement)) {
            const newRange = document.createRange();
            newRange.selectNodeContents(lastReplacement);
            newRange.collapse(false); // Collapse to end
            newSelection.removeAllRanges();
            newSelection.addRange(newRange);
          }
        }
      }
    } catch (error) {
      console.error('Error restoring original caret position:', error);
    }
  }, 0);
}; 