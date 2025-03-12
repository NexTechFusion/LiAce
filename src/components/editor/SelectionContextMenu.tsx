import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SelectionContextMenuProps {
  selectedText: string;
  onFixGrammar: () => void;
  onRephrase: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
  isFixingGrammar?: boolean;
  isRephrasing?: boolean;
}

const SelectionContextMenu: React.FC<SelectionContextMenuProps> = ({
  selectedText,
  onFixGrammar,
  onRephrase,
  editorRef,
  isFixingGrammar = false,
  isRephrasing = false
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const updatePosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      setIsVisible(false);
      return;
    }

    if (selection.toString().trim() === "") {
      setIsVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    
    // Get the scroll position
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Calculate the actual position in the document
    const documentOffsetTop = rect.top + scrollY;
    const documentOffsetLeft = rect.left + scrollX;
    
    // Get editor position taking scroll into account
    const editorOffsetTop = editorRect.top + scrollY;
    const editorOffsetLeft = editorRect.left + scrollX;
    
    // Calculate position relative to the editor
    const relativeLeft = documentOffsetLeft - editorOffsetLeft;
    
    // Calculate menu width (with fallback if not yet rendered)
    const menuWidth = menuRef.current?.offsetWidth || 150;
    const menuHeight = menuRef.current?.offsetHeight || 40;
    
    // Center the menu above the selection
    setPosition({
      left: Math.max(0, relativeLeft + (rect.width / 2) - (menuWidth / 2)),
      top: Math.max(0, documentOffsetTop - editorOffsetTop - menuHeight - 10)
    });
    
    setIsVisible(true);
  };

  // Handle click outside to hide the menu
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      // Check if the current selection is still valid
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") {
        setIsVisible(false);
      }
    }
  };

  useEffect(() => {
    if (selectedText.trim()) {
      // Update position after a short delay to ensure menu has rendered
      const timer = setTimeout(() => {
        updatePosition();
      }, 10);
      
      // Add a window resize listener
      window.addEventListener('resize', updatePosition);
      // Add a scroll listener
      window.addEventListener('scroll', updatePosition);
      // Add click listener to hide menu when clicking outside
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else {
      setIsVisible(false);
    }
  }, [selectedText]);

  // Handle keydown events to hide menu when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white dark:bg-gray-800 shadow-md rounded-md p-1 flex flex-row gap-1 border border-gray-200 dark:border-gray-700"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onFixGrammar}
        disabled={isFixingGrammar}
      >
        {isFixingGrammar ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Fixing...
          </>
        ) : (
          "Grammar"
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onRephrase}
        disabled={isRephrasing}
      >
        {isRephrasing ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Rephrasing...
          </>
        ) : (
          "Rephrase"
        )}
      </Button>
    </div>
  );
};

export default SelectionContextMenu; 