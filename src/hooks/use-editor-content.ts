
import { useState, useRef, useEffect } from "react";
import { useDocument } from "@/contexts/DocumentContext";
import { useSelection } from "@/hooks/use-selection";
import { usePageBreaks } from "@/hooks/use-page-breaks";
import { useFontSize } from "@/hooks/use-font-size";
import { DEMO_DATA } from "@/DEMO_DATA";

export const useEditorContent = () => {
  const [content, setContent] = useState(`<p>${DEMO_DATA.content}</p>`);
  const [selectedText, setSelectedText] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const lastContentRef = useRef(content);
  
  // Get document context
  const { updateEditorContent } = useDocument();
  
  // Initialize selection hooks
  const {
    selectionStateRef,
    scrollPositionRef,
    saveSelectionState,
    restoreSelection,
    getNodePath,
    getNodeByPath
  } = useSelection(editorRef, isUpdatingRef);
  
  // Initialize font size hooks
  const {
    currentFontSize,
    setCurrentFontSize,
    updateCurrentFontSize,
    applyFontSize
  } = useFontSize(editorRef, isUpdatingRef, saveSelectionState, scrollPositionRef, setContent, lastContentRef);
  
  // Initialize page breaks hooks
  const {
    pageBreaks,
    calculatePageBreaksDebounced
  } = usePageBreaks(editorRef, isUpdatingRef, saveSelectionState, restoreSelection, scrollPositionRef);
  
  // Handle selection changes to update the selected text
  useEffect(() => {
    const handleSelectionChange = () => {
      if (isUpdatingRef.current) return;
      
      const selection = window.getSelection();
      if (selection) {
        if (selection.toString()) {
          setSelectedText(selection.toString());
        } else {
          setSelectedText("");
        }
        saveSelectionState();
        
        // Update font size based on selection
        updateCurrentFontSize(selection);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);
  

  // Set up mutation observer to watch for content changes
  useEffect(() => {
    if (editorRef.current) {
      // Initial calculation
      calculatePageBreaksDebounced();
      
      const observer = new MutationObserver((mutations) => {
        if (isUpdatingRef.current) return;
        
        // Check if content actually changed to avoid unnecessary updates
        if (editorRef.current?.innerHTML !== lastContentRef.current) {
          lastContentRef.current = editorRef.current?.innerHTML || "";
          calculatePageBreaksDebounced();
        }
      });
      
      observer.observe(editorRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true
      });
      
      return () => {
        observer.disconnect();
        calculatePageBreaksDebounced.cancel();
      };
    }
  }, []);

  const handleContentChange = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      // Save selection state
      saveSelectionState();
      
      // Update content
      const newContent = editorRef.current.innerHTML;

      // Only update if content actually changed
      if (newContent !== lastContentRef.current) {
        lastContentRef.current = newContent;
        setContent(newContent);
        updateEditorContent(newContent);
      }
    }
  };
  
  return {
    content,
    setContent,
    selectedText,
    setSelectedText,
    editorRef,
    isUpdatingRef,
    lastContentRef,
    selectionStateRef,
    scrollPositionRef,
    saveSelectionState,
    restoreSelection,
    getNodePath,
    getNodeByPath,
    currentFontSize,
    setCurrentFontSize,
    updateCurrentFontSize,
    applyFontSize,
    pageBreaks,
    calculatePageBreaksDebounced,
    handleContentChange
  };
};
