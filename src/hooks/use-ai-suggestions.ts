
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAiSuggestions = (content: string) => {
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Simulate AI suggestion after 5 seconds for certain content
  useEffect(() => {
    if (content.includes("grammar") || content.includes("passive voice")) {
      const timer = setTimeout(() => {
        setShowAiSuggestion(true);
        setAiSuggestion("Consider revising this sentence to use active voice instead of passive voice.");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [content]);

  const handleAiAction = (action: string, selectedText: string, editorRef: React.RefObject<HTMLDivElement>, saveSelectionState: () => void, isUpdatingRef: React.MutableRefObject<boolean>, scrollPositionRef: React.MutableRefObject<number>) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      
      if (action === "Expand Section" && selectedText && editorRef.current) {
        // Save the current selection and scroll position
        saveSelectionState();
        
        // Flag that we're updating
        isUpdatingRef.current = true;
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // Replace the selection with the expanded text
          const expandedText = `${selectedText} Additionally, this concept can be further explored through various perspectives including historical context, practical applications, and theoretical frameworks.`;
          range.deleteContents();
          range.insertNode(document.createTextNode(expandedText));
          
          // Restore in the next tick
          setTimeout(() => {
            window.scrollTo(0, scrollPositionRef.current);
            editorRef.current?.focus();
            isUpdatingRef.current = false;
          }, 10);
        }
      }
      
      toast({
        title: "AI Assistant",
        description: `${action} completed successfully.`,
      });
    }, 2000);
  };

  const acceptAiSuggestion = () => {
    setShowAiSuggestion(false);
    toast({
      title: "Suggestion Applied",
      description: "The AI suggestion has been incorporated into your document.",
    });
  };

  const discardAiSuggestion = () => {
    setShowAiSuggestion(false);
    toast({
      title: "Suggestion Dismissed",
      description: "The AI suggestion has been discarded.",
    });
  };

  return {
    showAiSuggestion,
    aiSuggestion,
    isProcessing,
    handleAiAction,
    acceptAiSuggestion,
    discardAiSuggestion
  };
};
