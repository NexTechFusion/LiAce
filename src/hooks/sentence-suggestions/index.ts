import { useRef, useEffect, useState } from 'react';
import { Subject, from } from 'rxjs';
import { debounceTime, switchMap, finalize } from 'rxjs/operators';
import { SentenceSuggestionsProps, Suggestion } from './types';
import { fetchContinuation, fetchReplacements, fetchSuggestion, parseSuggestion, grammarRequest } from '../../lib/api';
import { getTextUntilCaret, getTextAfterCaret } from './editor-utils';
import {
  clearSuggestions,
  applySuggestion,
  applyContinuation,
  applyReplacements
} from './suggestion-renderer';
import {
  navigateToNextSuggestion,
  skipCurrentSuggestion,
  resetSuggestionNavigation
} from './navigation';
import { PROMPT_GRAMMAR_CORRECTION } from '../../lib/constants';
export * from './types';

export const useSentenceSuggestions = ({
  editorRef,
  isUpdatingRef,
  handleContentChange,
  setContent,
  customEndpoint = "",
  selectedModel = "",
  useAutocorrecting = true,
  enableReplacements = false,
  enableContinuations = true
}: SentenceSuggestionsProps) => {
  const suggestionRef = useRef<Suggestion | null>(null);
  const activeReplacementIndexRef = useRef<number>(-1);
  const allSuggestionsRef = useRef<(HTMLElement)[]>([]);
  const selectionPositionRef = useRef({ node: null, offset: 0 });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isGrammarCorrecting, setIsGrammarCorrecting] = useState<boolean>(false);
  const lastWordRef = useRef<string>('');

  // Create a subject for handling suggestion requests
  const suggestionSubject = useRef<Subject<void>>(new Subject());

  // Save caret position to use when restoring
  const saveCaretPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      selectionPositionRef.current = {
        node: range.startContainer,
        offset: range.startOffset
      };
    }
  };

  // Restore caret position
  const restoreCaretPosition = () => {
    const { node, offset } = selectionPositionRef.current;
    console.log('Caret position restored', selectionPositionRef.current, document.contains(node));
    if (node && document.contains(node)) {
      try {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.setStart(node, offset);
          range.setEnd(node, offset);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        console.error('Error restoring caret position:', error);
      }
    }
  };

  // Extract the last word from a text string
  const extractLastWord = (text: string): string => {
    const words = text.trim().split(/\s+/);
    return words.length > 0 ? words[words.length - 1] : '';
  };

  // Setup auto-correct grammar using the API
  useEffect(() => {
    if (!useAutocorrecting || !editorRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on space or enter key
      if ((e.key !== ' ' && e.key !== 'Enter') || isGrammarCorrecting) return;

      // Get the text before the cursor
      const beforeText = getTextUntilCaret(editorRef);
      if (!beforeText) return;

      // Extract the last word
      const lastWord = extractLastWord(beforeText);

      // Don't process if it's the same as the last corrected word or too short
      if (lastWord === lastWordRef.current || lastWord.length < 3) return;

      // Remember this word to avoid duplicate processing
      lastWordRef.current = lastWord;

      // Set the grammar correction state to true
      setIsGrammarCorrecting(true);

      // Record important positioning information
      // 1. Save full content
      const fullContent = editorRef.current.textContent || '';
      
      // 2. Determine how far the cursor is from the end of the content
      // This is a more reliable way to position the cursor after text changes
      const distanceFromEnd = fullContent.length - (getCaretCharacterOffsetWithin(editorRef.current) || 0);
      
      // Create an AbortController for the request
      const abortController = new AbortController();
      
      // Use the grammarRequest function to process the word
      grammarRequest(PROMPT_GRAMMAR_CORRECTION.replace('{{WORD}}', lastWord), abortController.signal, customEndpoint, selectedModel)
        .then(correctedText => {
          console.log('Grammar correction result:', { originalWord: lastWord, correctedText });
          // Only apply correction if it's different from the original
          if (correctedText !== lastWord && editorRef.current && !isUpdatingRef.current) {
            try {
              // Use a more direct approach
              // 1. Get the current editor HTML content
              let html = editorRef.current.innerHTML;
              
              // 2. Create a simple text replacement that doesn't disrupt the DOM structure
              // Use a case-sensitive replacement of the last occurrence only
              const lastIndex = html.lastIndexOf(lastWord);
              if (lastIndex >= 0) {
                // Replace just this occurrence
                const newHtml = html.substring(0, lastIndex) + correctedText + html.substring(lastIndex + lastWord.length);
                
                // 3. Update the content
                editorRef.current.innerHTML = newHtml;
                
                // 4. Restore caret position based on the saved distance from end
                const newContent = editorRef.current.textContent || '';
                const newPosition = Math.max(0, newContent.length - distanceFromEnd);
                
                handleContentChange();
                
                // 5. Set cursor to the calculated position
                setTimeout(() => {
                  setCaretPosition(editorRef.current, newPosition);
                }, 0);
              }
            } catch (error) {
              console.error('Error applying grammar correction:', error);
            }
          }

          // Clear the last word reference and set grammar correcting state to false
          lastWordRef.current = '';
          setIsGrammarCorrecting(false);
        })
        .catch(error => {
          // Only log if it's not an abort error
          if (error.name !== 'AbortError') {
            console.error('Error sending grammar correction request:', error);
          }
          setIsGrammarCorrecting(false);
        });
    };

    // Helper function to get caret position within an element
    const getCaretCharacterOffsetWithin = (element: HTMLElement) => {
      let caretOffset = 0;
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
      
      return caretOffset;
    };
    
    // Helper function to set caret position
    const setCaretPosition = (element: HTMLElement, offset: number) => {
      // Find the right text node and offset
      const charIndex = findNodeAndOffsetForCharacterIndex(element, offset);
      if (!charIndex) return;
      
      // Create a new range
      const range = document.createRange();
      range.setStart(charIndex.node, charIndex.offset);
      range.collapse(true);
      
      // Apply the range as selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    };
    
    // Helper function to find the node and offset for a character index
    const findNodeAndOffsetForCharacterIndex = (
      element: HTMLElement, 
      charIndex: number
    ): { node: Node, offset: number } | null => {
      // Get all text nodes
      const textNodes = getAllTextNodes(element);
      let currentIndex = 0;
      
      for (const node of textNodes) {
        const nodeLength = node.textContent?.length || 0;
        
        // If the character index is within this node
        if (currentIndex + nodeLength >= charIndex) {
          return {
            node: node,
            offset: charIndex - currentIndex
          };
        }
        
        // Move to next node
        currentIndex += nodeLength;
      }
      
      // If we get here, the character index is beyond all text nodes
      // Return the last position in the last text node
      if (textNodes.length > 0) {
        const lastNode = textNodes[textNodes.length - 1];
        return {
          node: lastNode,
          offset: lastNode.textContent?.length || 0
        };
      }
      
      return null;
    };

    // Helper function to get all text nodes in the editor
    const getAllTextNodes = (element: HTMLElement): Text[] => {
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node as Text);
      }
      
      return textNodes;
    };

    editorRef.current.addEventListener('keydown', handleKeyDown as EventListener);
    
    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('keydown', handleKeyDown as EventListener);
      }
    };
  }, [useAutocorrecting, editorRef.current, isGrammarCorrecting]);

  // Get current suggestion - now uses the API
  const getCurrentSuggestion = async (abortSignal: AbortSignal): Promise<Suggestion | null> => {
    const context = getTextUntilCaret(editorRef);
    const afterCaretText = getTextAfterCaret(editorRef);

    if (context) {
      // Only fetch continuations if enabled
      const continuation = enableContinuations
        ? fetchContinuation(context, afterCaretText, abortSignal, customEndpoint, selectedModel)
        : Promise.resolve(''); // Empty string if not enabled

      // Only fetch replacements if enabled
      const replacements = enableReplacements
        ? fetchReplacements(context, abortSignal, customEndpoint, selectedModel)
        : Promise.resolve({ continuation: '', replacements: [] });

      const promise = await Promise.all([continuation, replacements]);

      suggestionRef.current = {
        replacements: enableReplacements
          ? promise[1]?.replacements?.filter(({ original, fixed }) => original !== fixed || fixed !== "") || []
          : [],
        continuation: promise[0]
      };

      return suggestionRef.current;
    }

    return null;
  };

  // Set up RxJS subscription for handling suggestions
  useEffect(() => {
    const subscription = suggestionSubject.current.pipe(
      debounceTime(350),
      switchMap(() => {
        // Create a new AbortController for each request
        const abortController = new AbortController();

        // Set loading state to true when starting to fetch suggestions
        setIsLoadingSuggestions(true);

        // Save caret position before fetching suggestions
        saveCaretPosition();

        // Wrap the promise and its cancellation in an object
        return from(getCurrentSuggestion(abortController.signal)).pipe(
          // Add a finalizer that aborts the request when switchMap cancels
          finalize(() => {
            abortController.abort();
            // Set loading state to false when done
            setIsLoadingSuggestions(false);
          })
        );
      })
    ).subscribe(async (suggestion) => {
      if (suggestion && editorRef.current && !isUpdatingRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          if (selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const node = range.startContainer;

            // Only apply continuation if enabled
            if (enableContinuations && node.nodeType === Node.TEXT_NODE && suggestion.continuation) {
              applyContinuation(editorRef, suggestion, isUpdatingRef, allSuggestionsRef, activeReplacementIndexRef);
            }

            // Only apply replacements if enabled
            if (enableReplacements && suggestion.replacements && suggestion.replacements.length > 0) {
              applyReplacements(editorRef, suggestion, activeReplacementIndexRef, allSuggestionsRef);
            }

            // Try to restore caret position if no suggestions were applied
            if (allSuggestionsRef.current.length === 0) {
              restoreCaretPosition();
            }
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [enableContinuations, enableReplacements]);

  // Handle keyboard navigation for suggestions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allSuggestionsRef.current.length === 0) return;

      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        navigateToNextSuggestion(editorRef, activeReplacementIndexRef, allSuggestionsRef, isUpdatingRef);
      } else if (e.key === 'ArrowRight' && e.altKey || e.key === 'Escape') {
        e.preventDefault();
        skipCurrentSuggestion(activeReplacementIndexRef, allSuggestionsRef);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle suggestions - now using RxJS Subject
  const handleSuggestions = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      clearSuggestions(editorRef);
      saveCaretPosition(); // Save position before requesting suggestions
      suggestionSubject.current.next(); // Trigger new suggestion request
    }
  };

  return {
    getCurrentSuggestion,
    applySuggestion: () => applySuggestion(editorRef, isUpdatingRef),
    clearSuggestions: () => clearSuggestions(editorRef),
    handleSuggestions,
    navigateToNextSuggestion: () => navigateToNextSuggestion(editorRef, activeReplacementIndexRef, allSuggestionsRef, isUpdatingRef),
    skipCurrentSuggestion: () => skipCurrentSuggestion(activeReplacementIndexRef, allSuggestionsRef),
    isLoadingSuggestions,
    isGrammarCorrecting
  };
}; 