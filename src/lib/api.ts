import { PROMPT_INLINE, PROMPT_INLINE_REPLACEMENTS, PROMPT_INLINE_CONTINUATION, PROMPT_SUMMARY, SUGGESTION_API_ENDPOINT } from './constants';
import { Suggestion } from '../hooks/sentence-suggestions/types';

export const summaryRequest = async (text: string, signal?: AbortSignal, customEndpoint?: string, model?: string): Promise<string> => {
  const endpoint = customEndpoint || SUGGESTION_API_ENDPOINT;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: PROMPT_SUMMARY.replace('{{TEXT}}', text), model: model }),
    signal
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.result || '';
}

export const grammarRequest = async (prompt: string, signal?: AbortSignal, customEndpoint?: string, model?: string): Promise<string> => {
  const endpoint = customEndpoint || SUGGESTION_API_ENDPOINT;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: prompt, model: model }),
    signal // Add the abort signal to the fetch request
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json();
  return data.result || '';
}

export const chatRequest = async (prompt: string, signal?: AbortSignal, customEndpoint?: string, model?: string): Promise<string> => {
  const endpoint = customEndpoint || SUGGESTION_API_ENDPOINT;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: prompt, model: model }),
    signal // Add the abort signal to the fetch request
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  return data.result || '';
}

//Fetch replacements from API
export const fetchReplacements = async (prompt: string, signal?: AbortSignal, customEndpoint?: string, model?: string): Promise<Suggestion | null> => {
  console.log("📝 Fetching replacements suggestions...");
  const endpoint = customEndpoint || SUGGESTION_API_ENDPOINT;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: PROMPT_INLINE_REPLACEMENTS.replace('{{TEXT}}', prompt).replace('Tab →', ""), model: model }),
    signal // Add the abort signal to the fetch request
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const parsedSuggestion = parseSuggestion(data.result);
  return parsedSuggestion;
}

// fetch continuation from API
export const fetchContinuation = async (prompt: string, afterCaretText: string, signal?: AbortSignal, customEndpoint?: string, model?: string): Promise<string> => {
  console.log("✨ Fetching text continuation...");
  const endpoint = customEndpoint || SUGGESTION_API_ENDPOINT;
  const wholeText = prompt + ' ' + afterCaretText;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: PROMPT_INLINE_CONTINUATION.replace('{{TEXT}}', prompt).replace('{{WHOLE_TEXT}}', wholeText).replace('Tab →', ""), model: model }),
    signal // Add the abort signal to the fetch request
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.result || '';
}

// Fetch suggestion from API All in one V1
export const fetchSuggestion = async (prompt: string, afterCaretText: string, signal?: AbortSignal, customEndpoint?: string, model?: string): Promise<string> => {
  try {
    const wholeText = prompt + ' ' + afterCaretText;

    const endpoint = customEndpoint || SUGGESTION_API_ENDPOINT;

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: PROMPT_INLINE.replace('{{TEXT}}', prompt).replace('{{WHOLE_TEXT}}', wholeText), model: model }),
      signal // Add the abort signal to the fetch request
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Return the suggestion, making sure it starts with a space if needed
    const suggestion = data.result || '';
    return suggestion;
  } catch (error) {
    // Only log if it's not an abort error
    if (error.name !== 'AbortError') {
      console.error('Error fetching suggestion:', error);
    }
    return '';
  }
};

// Parse from the result string to the object
export const parseSuggestion = (suggestion: string): Suggestion | null => {
  try {
    // Updated regex to match either a JSON object or a JSON array
    const jsonMatch = suggestion.match(/(\{[\s\S]*\})|(\[[\s\S]*\])/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      // If it's an array of replacements, we need to convert it to a Suggestion object
      if (jsonStr.startsWith('[')) {
        const replacements = JSON.parse(jsonStr);
        return {
          continuation: '',
          replacements: replacements
        };
      }
      // If it's already a Suggestion object with the right format
      return JSON.parse(jsonStr);
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error);
  }
  return null;
}; 