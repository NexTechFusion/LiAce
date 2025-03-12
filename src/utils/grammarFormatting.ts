interface GrammarError {
  original: string;
  suggestions: string[];
  type: 'spelling' | 'grammar' | 'style' | 'punctuation';
  description: string;
  originalIndex?: number;
  fixedIndex?: number;
}

/**
 * Formats text with grammar corrections highlighted
 * @param originalText The original text with errors
 * @param fixedText The corrected text
 * @param errors Array of identified grammar errors with their details
 */
export function formatGrammarCorrections(originalText: string, fixedText: string, errors: GrammarError[]): string {
  let formattedHTML = `<div class="mb-2 font-medium text-sm">Grammar Check Results:</div>`;

  // Sort errors by position to avoid position shifting issues
  errors.sort((a, b) => {
    const posA = a.originalIndex || originalText.indexOf(a.original);
    const posB = b.originalIndex || originalText.indexOf(b.original);
    return posA - posB;
  });
  
  // Create a copy of the original text to highlight errors
  let highlightedOriginal = originalText;
  let highlightedFixed = fixedText;
  
  // Process errors in reverse order to avoid position issues when adding HTML tags
  const errorsCopy = [...errors];
  errorsCopy.reverse();
  
  // Highlight all errors in original text (in reverse order to maintain positions)
  errorsCopy.forEach(error => {
    if (!error.original) return; // Skip empty originals (added words)
    
    const position = error.originalIndex || originalText.indexOf(error.original);
    if (position === -1) return; // Skip if not found
    
    const redHighlight = `<span 
      class="error-highlight" 
      style="background-color: #f8d7da; padding: 2px; border-radius: 2px;" 
      title="${error.description || error.type}"
    >${error.original}</span>`;
    
    highlightedOriginal = 
      highlightedOriginal.substring(0, position) + 
      redHighlight + 
      highlightedOriginal.substring(position + error.original.length);
  });
  
  // Create a mapping of positions for the fixed text corrections
  const fixedPositions = new Map<number, {error: GrammarError, suggestion: string}>();
  
  // Calculate positions for corrections in fixed text
  errors.forEach(error => {
    if (error.suggestions.length === 0) return;
    
    const suggestion = error.suggestions[0];
    if (!suggestion) return; // Skip empty suggestions (removed words)
    
    let position = error.fixedIndex;
    
    // If position not provided, attempt to find it in the fixed text
    if (position === undefined) {
      // Strategy 1: Exact match
      position = fixedText.indexOf(suggestion);
      
      // Strategy 2: Context-based matching (simplified)
      if (position === -1 && error.original) {
        // Try to find nearby context words
        const origIdx = originalText.indexOf(error.original);
        if (origIdx !== -1) {
          // Look for words before/after in both texts
          const beforeWord = origIdx > 10 ? originalText.substring(origIdx - 10, origIdx).trim() : '';
          const afterWord = origIdx + error.original.length < originalText.length - 10 
            ? originalText.substring(origIdx + error.original.length, origIdx + error.original.length + 10).trim()
            : '';
            
          if (beforeWord) {
            const beforePos = fixedText.indexOf(beforeWord);
            if (beforePos !== -1) {
              position = fixedText.indexOf(suggestion, beforePos);
            }
          }
          
          if (position === -1 && afterWord) {
            const afterPos = fixedText.indexOf(afterWord);
            if (afterPos !== -1 && afterPos > suggestion.length) {
              position = fixedText.lastIndexOf(suggestion, afterPos);
            }
          }
        }
      }
    }
    
    if (position !== -1) {
      fixedPositions.set(position, {error, suggestion});
    }
  });
  
  // Sort positions in descending order to maintain correct offsets
  const sortedPositions = Array.from(fixedPositions.entries()).sort((a, b) => b[0] - a[0]);
  
  // Apply highlights to fixed text
  for (const [position, {error, suggestion}] of sortedPositions) {
    const greenHighlight = `<span 
      class="correction-highlight" 
      style="background-color: #d4edda; padding: 2px; border-radius: 2px;"
      title="${error.description || error.type}"
    >${suggestion}</span>`;
    
    highlightedFixed = 
      highlightedFixed.substring(0, position) +
      greenHighlight +
      highlightedFixed.substring(position + suggestion.length);
  }
  
  // Add the formatted text to the result
  formattedHTML += `
    <div class="grammar-comparison p-1 border rounded dark:border-gray-700 mb-3">
      <div class="mb-2">
        <div class="text-xs font-medium mb-1">Original Text:</div>
        <div class="text-sm original-text">${highlightedOriginal}</div>
      </div>
      
      <div class="my-3 border-t dark:border-gray-700"></div>
      
      <div>
        <div class="text-xs font-medium mb-1">Corrected Text:</div>
        <div class="text-sm corrected-text">${highlightedFixed}</div>
      </div>
    </div>
  `;
  
  return formattedHTML;
}

/**
 * Parse AI grammar correction response to extract error information
 * @param aiResponse The response from the AI grammar correction
 */
export function parseGrammarResponse(aiResponse: string, originalText: string): {
  fixedText: string;
  errors: GrammarError[];
} {
  // This is a placeholder implementation - in a real app you would parse the actual AI response format
  const fixedText = aiResponse;
  const errors: GrammarError[] = [];
  
  // Simple diff implementation to find errors and corrections
  // For a real implementation, consider using a proper diff algorithm
  
  // Split into words for comparison
  const origWords = originalText.split(/\s+/);
  const fixedWords = fixedText.split(/\s+/);
  
  // Keep track of word positions
  let originalPosition = 0;
  let fixedPosition = 0;
  
  // Compare words to find differences
  for (let i = 0; i < Math.min(origWords.length, fixedWords.length); i++) {
    // Update positions before comparison
    if (i > 0) {
      originalPosition += origWords[i-1].length + 1; // +1 for space
      fixedPosition += fixedWords[i-1].length + 1;   // +1 for space
    }
    
    if (origWords[i] !== fixedWords[i]) {
      // Determine error type (simplified)
      let type: GrammarError['type'] = 'spelling';
      
      if (origWords[i].toLowerCase() === fixedWords[i].toLowerCase()) {
        type = 'grammar';
      } else if (/[.,!?;:]/.test(origWords[i]) || /[.,!?;:]/.test(fixedWords[i])) {
        type = 'punctuation';
      } else if (origWords[i].length > fixedWords[i].length + 3 || origWords[i].length < fixedWords[i].length - 3) {
        type = 'style';
      }
      
      errors.push({
        original: origWords[i],
        suggestions: [fixedWords[i]],
        type,
        description: `Changed "${origWords[i]}" to "${fixedWords[i]}"`,
        originalIndex: originalPosition,
        fixedIndex: fixedPosition
      });
    }
  }
  
  // Handle case where fixed text has more words than original
  if (origWords.length < fixedWords.length) {
    // Update fixed position to the end of the original words
    for (let i = 0; i < origWords.length; i++) {
      if (i > 0) fixedPosition += fixedWords[i-1].length + 1;
    }
    
    for (let i = origWords.length; i < fixedWords.length; i++) {
      if (i > origWords.length) fixedPosition += fixedWords[i-1].length + 1;
      
      errors.push({
        original: '',
        suggestions: [fixedWords[i]],
        type: 'grammar',
        description: `Added "${fixedWords[i]}"`,
        fixedIndex: fixedPosition
      });
    }
  }
  
  // Handle case where original text has more words than fixed
  if (origWords.length > fixedWords.length) {
    // Update original position to the end of the fixed words
    for (let i = 0; i < fixedWords.length; i++) {
      if (i > 0) originalPosition += origWords[i-1].length + 1;
    }
    
    for (let i = fixedWords.length; i < origWords.length; i++) {
      if (i > fixedWords.length) originalPosition += origWords[i-1].length + 1;
      
      errors.push({
        original: origWords[i],
        suggestions: [''],
        type: 'grammar',
        description: `Removed "${origWords[i]}"`,
        originalIndex: originalPosition
      });
    }
  }
  
  return { fixedText, errors };
} 