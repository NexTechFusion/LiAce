import { useState, useEffect, useRef } from "react";
import FormatToolbar from "./FormatToolbar";
import AiSuggestionPanel from "./AiSuggestionPanel";
import { useAiSuggestions } from "@/hooks/use-ai-suggestions";
import { useFormatter } from "@/hooks/use-formatter";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMobile } from "@/hooks/use-mobile";
import { useSentenceSuggestions } from "@/hooks/use-sentence-suggestions";
import { useEditorContent } from "@/hooks/use-editor-content";
import ImageResizer from "./ImageResizer";
import EditorContentArea from "./EditorContentArea";
import ImageUploader from "./ImageUploader";
import { useRightSidebarSettings } from "@/contexts/RightSidebarContext";
import { grammarRequest } from "@/lib/api";
import { PROMPT_GRAMMAR, PROMPT_REPHRASE } from "@/lib/constants";
import { parseGrammarResponse, formatGrammarCorrections } from "@/utils/grammarFormatting";

interface EditorProps {
  zoomLevel: number;
  onSuggestionsLoadingChange?: (isLoading: boolean) => void;
  onGrammarCorrectionChange?: (isLoading: boolean) => void;
}

const Editor = ({ zoomLevel = 100, onSuggestionsLoadingChange, onGrammarCorrectionChange }: EditorProps) => {
  const { toast } = useToast();
  const { isMobile } = useMobile();
  const { 
    customEndpoint, 
    selectedModel, 
    useAutocorrecting,
    enableReplacements,
    enableContinuations 
  } = useRightSidebarSettings();

  // Add state for tracking loading states
  const [isFixingGrammar, setIsFixingGrammar] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);

  // Use our editor content hook
  const {
    content,
    setContent,
    selectedText,
    editorRef,
    isUpdatingRef,
    lastContentRef,
    selectionStateRef,
    scrollPositionRef,
    saveSelectionState,
    restoreSelection,
    currentFontSize,
    pageBreaks,
    handleContentChange,
    calculatePageBreaksDebounced,
    applyFontSize
  } = useEditorContent();

  // Use the formatter hook
  const {
    handleFormatClick
  } = useFormatter(
    editorRef,
    isUpdatingRef,
    saveSelectionState,
    restoreSelection,
    scrollPositionRef,
    setContent,
    lastContentRef,
    applyFontSize
  );

  // Use AI suggestions hook
  const {
    showAiSuggestion,
    aiSuggestion,
    acceptAiSuggestion,
    discardAiSuggestion
  } = useAiSuggestions(content);

  // Get sentence suggestions handler with loading state
  const { 
    handleSuggestions, 
    isLoadingSuggestions,
    isGrammarCorrecting 
  } = useSentenceSuggestions({
    editorRef,
    isUpdatingRef,
    handleContentChange,
    setContent,
    customEndpoint,
    selectedModel,
    useAutocorrecting,
    enableReplacements,
    enableContinuations
  });

  // Set up image uploader
  const { handleImageUpload } = ImageUploader({
    editorRef,
    isUpdatingRef,
    saveSelectionState,
    restoreSelection,
    selectionStateRef,
    handleContentChange
  });

  // Watch for zoom level changes
  useEffect(() => {
    // When zoom level changes, recalculate page breaks after a short delay
    const timer = setTimeout(() => {
      calculatePageBreaksDebounced();
    }, 100);

    return () => clearTimeout(timer);
  }, [zoomLevel]);

  // Notify parent component about suggestions loading state changes
  useEffect(() => {
    if (onSuggestionsLoadingChange) {
      onSuggestionsLoadingChange(isLoadingSuggestions);
    }
  }, [isLoadingSuggestions, onSuggestionsLoadingChange]);

  // Notify parent component about grammar correction state changes
  useEffect(() => {
    if (onGrammarCorrectionChange) {
      onGrammarCorrectionChange(isGrammarCorrecting);
    }
  }, [isGrammarCorrecting, onGrammarCorrectionChange]);

  // Force initial document update to ensure content is propagated
  useEffect(() => {
    // Force a document update after component mount
    const timer = setTimeout(() => {
      if (editorRef.current) {
        calculatePageBreaksDebounced();
      }
    }, 300); // Give time for the editor to fully initialize

    return () => clearTimeout(timer);
  }, []);

  // Handle grammar fix
  const handleFixGrammar = async () => {
    if (!selectedText.trim()) return;

    // First save the current selection
    const savedSelection = saveSelectionState();
    if (!savedSelection) return;

    try {
      // Set loading state instead of showing toast
      setIsFixingGrammar(true);

      isUpdatingRef.current = true;

      const prompt = PROMPT_GRAMMAR.replace('{{TEXT}}', selectedText);
      const fixedText = await grammarRequest(prompt, undefined, customEndpoint, selectedModel);

      if (fixedText.toLowerCase().includes("no changes needed")) {
        setIsFixingGrammar(false);
        isUpdatingRef.current = false;
        return;
      }

      // Apply the fixed text
      if (editorRef.current) {
        restoreSelection();

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(fixedText));
          handleContentChange();

          // Parse grammar errors and format them for display
          const { errors } = parseGrammarResponse(fixedText, selectedText);

          // Format the grammar corrections with highlighting
          const formattedHtml = formatGrammarCorrections(selectedText, fixedText, errors);

          // Send to AI Chat
          const event = new CustomEvent('grammarCorrection', {
            detail: {
              originalText: selectedText,
              correctedText: fixedText,
              formattedHtml,
              errors,
            }
          });
          document.dispatchEvent(event);
        }
      }

    } catch (error) {
      console.error("Error fixing grammar:", error);
      toast({
        title: "Error",
        description: "Failed to fix grammar. Please try again.",
        variant: "destructive",
      });
    } finally {
      isUpdatingRef.current = false;
      setIsFixingGrammar(false);
    }
  };

  // Handle rephrase text
  const handleRephrase = async () => {
    if (!selectedText.trim()) return;

    // First save the current selection
    const savedSelection = saveSelectionState();
    if (!savedSelection) return;

    try {
      setIsRephrasing(true);

      isUpdatingRef.current = true;

      const prompt = PROMPT_REPHRASE.replace('{{TEXT}}', selectedText);
      const rephrasedText = await grammarRequest(prompt, undefined, customEndpoint, selectedModel);

      if (rephrasedText.toLowerCase().includes("no changes needed")) {
        setIsRephrasing(false);
        isUpdatingRef.current = false;
        return;
      }

      // Apply the rephrased text
      if (editorRef.current) {
        restoreSelection();

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(rephrasedText));
          handleContentChange();

          // Format the rephrased text to display in sidebar
          const formattedHtml = `
            <div class="rephrased-text">
              <div class="original-text">
                <h4>Original:</h4>
                <p>${selectedText}</p>
              </div>
              <div class="rephrased-version">
                <h4>Rephrased:</h4>
                <p>${rephrasedText}</p>
              </div>
            </div>
          `;

          // Send to AI Chat sidebar
          const event = new CustomEvent('rephraseResult', {
            detail: {
              originalText: selectedText,
              rephrasedText: rephrasedText,
              formattedHtml
            }
          });
          document.dispatchEvent(event);
        }
      }

    } catch (error) {
      console.error("Error rephrasing text:", error);
      toast({
        title: "Error",
        description: "Failed to rephrase text. Please try again.",
        variant: "destructive",
      });
    } finally {
      isUpdatingRef.current = false;
      setIsRephrasing(false);
    }
  };

  // Enhanced content change handler with suggestions
  const handleContentChangeWithSuggestions = () => {
    // First handle the content change to update state
    handleContentChange();

    // Then trigger suggestions after a short delay to ensure content is updated
    setTimeout(() => {
      if (!isUpdatingRef.current) {
        handleSuggestions();
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <FormatToolbar
        onFormatClick={handleFormatClick}
        currentFontSize={currentFontSize}
        isMobile={isMobile}
        onImageUpload={handleImageUpload}
      />

      <ScrollArea className="flex-1 mb-2">
        <div className="editor-container px-4 py-6 min-h-full bg-gray-100 dark:bg-gray-900">
          <EditorContentArea
            editorRef={editorRef}
            content={content}
            handleContentChange={handleContentChangeWithSuggestions}
            pageBreaks={pageBreaks}
            zoomLevel={zoomLevel}
            isMobile={isMobile}
            selectedText={selectedText}
            onFixGrammar={handleFixGrammar}
            onRephrase={handleRephrase}
            isFixingGrammar={isFixingGrammar}
            isRephrasing={isRephrasing}
          />
        </div>
      </ScrollArea>

      {/* Add image resizer component */}
      <ImageResizer
        editorRef={editorRef}
        isUpdatingRef={isUpdatingRef}
        handleContentChange={handleContentChange}
      />

      {/* Hidden file input for image upload */}
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {/* AI suggestion overlay - position it differently on mobile */}
      <AiSuggestionPanel
        showAiSuggestion={showAiSuggestion}
        aiSuggestion={aiSuggestion}
        onAccept={acceptAiSuggestion}
        onDiscard={discardAiSuggestion}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Editor;
