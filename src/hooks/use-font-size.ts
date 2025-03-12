import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useFontSize = (
  editorRef: React.RefObject<HTMLDivElement>,
  isUpdatingRef: React.MutableRefObject<boolean>,
  saveSelectionState: () => void,
  scrollPositionRef: React.MutableRefObject<number>,
  setContent: (content: string) => void,
  lastContentRef: React.MutableRefObject<string>
) => {
  const [currentFontSize, setCurrentFontSize] = useState("11px");
  const { toast } = useToast();
  
  // Update the current font size in the toolbar based on the current selection
  const updateCurrentFontSize = (selection: Selection) => {
    if (!selection || selection.rangeCount === 0) return;
    
    try {
      const range = selection.getRangeAt(0);
      if (!range) return;
      
      // Get the font size of the current selection
      let fontSize = "11px"; // Default font size
      
      if (range.collapsed) {
        // If no text is selected (just cursor position)
        const parentElement = range.startContainer.nodeType === Node.TEXT_NODE
          ? range.startContainer.parentElement
          : range.startContainer as Element;
        
        if (parentElement && parentElement instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(parentElement);
          fontSize = computedStyle.fontSize;
        }
      } else {
        // If text is selected, try to get the common font size
        const commonAncestor = range.commonAncestorContainer;
        
        if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
          const computedStyle = window.getComputedStyle(commonAncestor as Element);
          fontSize = computedStyle.fontSize;
        } else if (commonAncestor.nodeType === Node.TEXT_NODE && commonAncestor.parentElement) {
          const computedStyle = window.getComputedStyle(commonAncestor.parentElement);
          fontSize = computedStyle.fontSize;
        }
      }
      
      setCurrentFontSize(fontSize);
    } catch (error) {
      console.error("Error updating font size:", error);
    }
  };
  
  // Improved logic for applying font size to selected text
  const applyFontSize = (fontSize: string) => {
    if (!editorRef.current) return;
    
    // Make sure we have focus
    editorRef.current.focus();
    
    // Save the current selection state
    saveSelectionState();
    
    // Flag that we're updating
    isUpdatingRef.current = true;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      isUpdatingRef.current = false;
      return;
    }
    
    const range = selection.getRangeAt(0);
    if (!range) {
      isUpdatingRef.current = false;
      return;
    }
    
    try {
      // Different handling for collapsed (cursor only) and non-collapsed (text selection) ranges
      if (range.collapsed) {
        // Just cursor, set the font size for future typing
        let container = range.startContainer;
        
        // If we're in a text node, get its parent
        if (container.nodeType === Node.TEXT_NODE) {
          container = container.parentNode!;
        }
        
        // If the container is already a span with font-size, update it
        if (container instanceof HTMLElement && container.tagName === 'SPAN') {
          container.style.fontSize = fontSize;
          
          // Place cursor at the end of the span
          range.setStartAfter(container.lastChild || container);
          range.setEndAfter(container.lastChild || container);
        } else {
          // Create a new span with the desired font size
          const spanElement = document.createElement("span");
          spanElement.style.fontSize = fontSize;
          
          // Insert an invisible character to ensure the span is not empty
          const zeroWidthSpace = document.createTextNode("\u200B");
          spanElement.appendChild(zeroWidthSpace);
          
          // Insert the span at the cursor position
          range.insertNode(spanElement);
          
          // Place cursor after the invisible character
          range.setStartAfter(zeroWidthSpace);
          range.setEndAfter(zeroWidthSpace);
        }
      } else {
        // Text selection, apply font size to the selected content
        const fragment = range.extractContents();
        const spanElement = document.createElement("span");
        spanElement.style.fontSize = fontSize;
        
        // Helper function to flatten nested spans with font-size
        const flattenSpans = (node: Node): Node => {
          if (node instanceof HTMLElement && node.tagName === 'SPAN') {
            // If this is a span, merge its content into our new span
            const content = document.createTextNode(node.textContent || '');
            return content;
          } else if (node.nodeType === Node.TEXT_NODE) {
            return node.cloneNode(true);
          } else {
            // For other elements, preserve them but process their children
            const clone = node.cloneNode(false);
            for (const child of Array.from(node.childNodes)) {
              clone.appendChild(flattenSpans(child));
            }
            return clone;
          }
        };
        
        // Process all nodes in the fragment
        for (const child of Array.from(fragment.childNodes)) {
          spanElement.appendChild(flattenSpans(child));
        }
        
        // Insert the flattened span
        range.insertNode(spanElement);
        
        // Select the newly created span content
        range.selectNodeContents(spanElement);
      }
      
      // Update selection
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Update current font size
      setCurrentFontSize(fontSize);
      
      // Update content
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        lastContentRef.current = newContent;
        setContent(newContent);
      }
      
      // Create successful toast notification
      toast({
        title: "Font Size Applied",
        description: `Changed font size to ${fontSize}.`,
        duration: 1500,
      });
      
    } catch (error) {
      console.error("Error applying font size:", error);
      
      toast({
        title: "Error",
        description: "Could not apply font size. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
    
    // Allow a brief delay for DOM updates
    setTimeout(() => {
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
      
      isUpdatingRef.current = false;
      
      // Ensure editor keeps focus
      editorRef.current?.focus();
    }, 10);
  };
  
  return {
    currentFontSize,
    setCurrentFontSize,
    updateCurrentFontSize,
    applyFontSize
  };
};
