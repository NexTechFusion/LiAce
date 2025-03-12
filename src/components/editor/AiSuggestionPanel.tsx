
import React from "react";
import { useToast } from "@/hooks/use-toast";

interface AiSuggestionPanelProps {
  showAiSuggestion: boolean;
  aiSuggestion: string;
  onAccept: () => void;
  onDiscard: () => void;
  isMobile?: boolean;
}

const AiSuggestionPanel: React.FC<AiSuggestionPanelProps> = ({ 
  showAiSuggestion, 
  aiSuggestion, 
  onAccept, 
  onDiscard,
  isMobile = false
}) => {
  if (!showAiSuggestion) return null;
  
  // Position the panel differently on mobile vs desktop
  const positionClass = isMobile 
    ? "fixed left-2 right-2 bottom-24 z-20" 
    : "fixed right-4 top-20 w-64 z-10";
  
  return (
    <div className={`${positionClass} bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900 rounded-lg shadow-lg p-4 animate-slide-up`}>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">AI Suggestion</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{aiSuggestion}</p>
      <div className="flex justify-end space-x-2">
        <button 
          onClick={onDiscard} 
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Dismiss
        </button>
        <button 
          onClick={onAccept} 
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default AiSuggestionPanel;
