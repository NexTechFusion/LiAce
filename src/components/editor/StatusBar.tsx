import { Button } from "@/components/ui/button";
import { 
  Eye, 
  PanelLeft, 
  PanelRight,
  ChevronUp,
  Loader2,
  Sparkles,
  TypeIcon,
  Pencil
} from "lucide-react";
import { useDocument } from "@/contexts/DocumentContext";
import { useRightSidebarSettings } from "@/contexts/RightSidebarContext";

interface StatusBarProps {
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleFocusMode: () => void;
  focusMode: boolean;
  isMobile?: boolean;
  isLoadingSuggestions?: boolean;
  isGrammarCorrecting?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({
  toggleLeftSidebar,
  toggleRightSidebar,
  toggleFocusMode,
  focusMode,
  isMobile = false,
  isLoadingSuggestions = false,
  isGrammarCorrecting = false
}) => {
  // Get editor content from DocumentContext
  const { editorContent } = useDocument();
  
  // Get AI settings
  const { enableContinuations, enableReplacements, useAutocorrecting } = useRightSidebarSettings();
  
  // Calculate word count
  const getWordCount = (content: string): number => {
    // Remove HTML tags
    const textOnly = content.replace(/<[^>]*>/g, ' ');
    // Remove special characters and extra spaces
    const cleanText = textOnly.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    // Count words (split by spaces and filter out empty strings)
    const words = cleanText.split(' ').filter(word => word.length > 0);
    return words.length;
  };
  
  // Calculate character count
  const getCharacterCount = (content: string): number => {
    // Remove HTML tags
    const textOnly = content.replace(/<[^>]*>/g, '');
    // Remove extra spaces
    const cleanText = textOnly.replace(/\s+/g, ' ').trim();
    return cleanText.length;
  };
  
  const wordCount = getWordCount(editorContent);
  const characterCount = getCharacterCount(editorContent);

  return (
    <div className="h-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
      <div className="flex items-center space-x-2">
        {!isMobile && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleLeftSidebar}
              title="Toggle left sidebar"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleRightSidebar}
              title="Toggle right sidebar"
            >
              <PanelRight className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${focusMode ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''}`}
              onClick={toggleFocusMode}
              title="Toggle focus mode"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
          </>
        )}

        <span>{wordCount} words</span>
        <span className="mx-1">•</span>
        <span>{characterCount} characters</span>
        
        <span className="mx-1">•</span>
        <span 
          className={`flex items-center ${enableContinuations ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}
          title={enableContinuations ? "Continuations enabled" : "Continuations disabled"}
        >
          <TypeIcon className="h-3 w-3 mr-1" />
        </span>
        
        <span 
          className={`flex items-center ${enableReplacements ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}
          title={enableReplacements ? "Replacements enabled" : "Replacements disabled"}
        >
          <Pencil className="h-3 w-3 mr-1" />
        </span>
        
        <span 
          className={`flex items-center ${useAutocorrecting ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}
          title={useAutocorrecting ? "Grammar correction enabled" : "Grammar correction disabled"}
        >
          <Sparkles className="h-3 w-3 mr-1" />
        </span>
        
        {isLoadingSuggestions && (
          <>
            <span className="mx-1">•</span>
            <span className="flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading suggestions
            </span>
          </>
        )}

        {isGrammarCorrecting && (
          <>
            <span className="mx-1">•</span>
            <span className="flex items-center text-green-600 dark:text-green-400">
              <Sparkles className="h-3 w-3 mr-1" />
              Grammar correcting
            </span>
          </>
        )}
      </div>
      
      {!isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className="h-3.5 w-3.5 mr-1" />
          Top
        </Button>
      )}
    </div>
  );
};

export default StatusBar;
