import React from 'react';

export interface SentenceSuggestionsProps {
  editorRef: React.RefObject<HTMLDivElement>;
  isUpdatingRef: React.MutableRefObject<boolean>;
  handleContentChange: () => void;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  customEndpoint?: string;
  selectedModel?: string;
  useAutocorrecting?: boolean;
  enableReplacements?: boolean;
  enableContinuations?: boolean;
}

export interface Suggestion {
  continuation: string;
  replacements: { original: string, fixed: string }[];
} 