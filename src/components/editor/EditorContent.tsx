
import React, { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditorContentProps {
  content: string;
  onChange: (content: string) => void;
  onSelect: (selectedText: string) => void;
  onFormatCommand?: (command: string, value?: string) => void;
  currentPage?: number;
  onPageChange?: (pageIndex: number) => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
  content,
  onChange,
  onSelect,
  onFormatCommand,
  currentPage: externalCurrentPage,
  onPageChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([content]);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const pageHeight = 1056; // Standard US Letter height in pixels at 96 DPI (11 inches)
  const pageWidth = 816; // Standard US Letter width in pixels at 96 DPI (8.5 inches)
  const linesPerPage = 50; // Approximately 50 lines per page

  // Sync with external current page if provided
  useEffect(() => {
    if (externalCurrentPage !== undefined && externalCurrentPage !== currentPage) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage]);

  // Handle selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        onSelect(selection.toString());
      } else {
        onSelect("");
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [onSelect]);

  // Set up format command handler
  useEffect(() => {
    if (onFormatCommand) {
      onFormatCommand = executeFormatCommand;
    }
  }, [onFormatCommand]);

  // Check if caret is at bottom of page and handle pagination
  const checkCaretPosition = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    // Calculate approx position relative to lines (assuming line height is ~20px)
    const lineHeight = 20;
    const currentLine = Math.floor((rect.bottom - editorRect.top) / lineHeight);

    // If we've reached line ~48 (a bit before the actual end to give buffer)
    if (currentLine >= linesPerPage - 2) {
      // Create a new page if we're on the last page
      if (currentPage === pages.length - 1) {
        const newPages = [...pages, "<p><br></p>"];
        setPages(newPages);
        const newPageIndex = currentPage + 1;
        setCurrentPage(newPageIndex);

        // Notify parent component about page change
        if (onPageChange) {
          onPageChange(newPageIndex);
        }

        // Update the overall content
        onChange(newPages.join("\n<!-- page-break -->\n"));

        // After state updates, focus on the editor and place caret at the beginning of the new page
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            const selection = window.getSelection();
            const range = document.createRange();

            // Place cursor at the beginning of the editor
            if (editorRef.current.firstChild) {
              range.setStart(editorRef.current.firstChild, 0);
              range.collapse(true);

              selection?.removeAllRanges();
              selection?.addRange(range);
            }
          }
        }, 10);
      } else {
        // Move to the next page if not on the last page
        const newPageIndex = currentPage + 1;
        setCurrentPage(newPageIndex);

        // Notify parent component about page change
        if (onPageChange) {
          onPageChange(newPageIndex);
        }
      }
    }
  };

  // Handle content changes
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      // Update the current page content
      const newPages = [...pages];
      newPages[currentPage] = editorRef.current.innerHTML;
      setPages(newPages);

      // Update the overall content
      onChange(newPages.join("\n<!-- page-break -->\n"));

      // Check if we need to create a new page
      checkCaretPosition();
    }
  };

  // Execute formatting commands while preserving cursor position
  const executeFormatCommand = (command: string, value?: string) => {
    // Make sure the editor has focus
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Handle font size command
    if (command === 'fontSize') {
      document.execCommand('fontSize', false, '7'); // Use a placeholder size
      
      // Now find all font elements with size 7 and replace with the desired size
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = value || '11px';
        
        // If there's a selection, wrap it in a span with the font size
        if (!range.collapsed) {
          range.surroundContents(span);
        } else {
          // If no selection, insert a span with the font size
          span.innerHTML = '&#8203;'; // Zero-width space
          range.insertNode(span);
          
          // Move cursor after the span
          range.setStartAfter(span);
          range.setEndAfter(span);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } else {
      // Execute other commands normally
      document.execCommand(command, false, value);
    }

    // Update content after formatting without losing cursor position
    if (editorRef.current) {
      const newPages = [...pages];
      newPages[currentPage] = editorRef.current.innerHTML;
      setPages(newPages);
      onChange(newPages.join("\n<!-- page-break -->\n"));
    }
  };

  // Handle page navigation
  const navigateToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);

      // Notify parent component about page change
      if (onPageChange) {
        onPageChange(pageIndex);
      }
    }
  };

  // Parse content when it changes externally
  useEffect(() => {
    const contentPages = content.split("\n<!-- page-break -->\n");
    if (JSON.stringify(contentPages) !== JSON.stringify(pages)) {
      setPages(contentPages);
    }
  }, [content]);

  // Render current page content
  useEffect(() => {
    if (editorRef.current && pages[currentPage]) {
      if (
        editorRef.current.innerHTML !== pages[currentPage] &&
        !editorRef.current.contains(document.activeElement)
      ) {
        editorRef.current.innerHTML = pages[currentPage];
      }
    }
  }, [currentPage, pages]);

  // Handle zoom level change
  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  return (
    <div className="editor-container flex-1 flex flex-col items-center">
      {/* Zoom Controls */}
      <div className="zoom-controls w-full max-w-xs flex items-center justify-between bg-white dark:bg-gray-800 rounded-md shadow-sm p-2 mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">Zoom:</span>
        <div className="flex-1 mx-4">
          <Slider
            defaultValue={[zoomLevel]}
            min={50}
            max={200}
            step={10}
            onValueChange={handleZoomChange}
          />
        </div>
        <span className="text-sm font-medium">{zoomLevel}%</span>
      </div>

      <ScrollArea className="w-full h-[calc(100vh-240px)] flex justify-center">
        <div 
          className="pages-container flex flex-col items-center py-10 bg-gray-100 dark:bg-gray-900 min-h-full"
          style={{ 
            padding: '40px 0'
          }}
        >
          <div
            className="page-container bg-white dark:bg-gray-800 shadow-md relative mb-8 overflow-hidden"
            style={{
              width: `${pageWidth * (zoomLevel / 100)}px`,
              height: `${pageHeight * (zoomLevel / 100)}px`,
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
            }}
          >
            <div
              ref={editorRef}
              className="ProseMirror absolute inset-0"
              style={{
                padding: "1in",
                height: "100%",
                boxSizing: "border-box",
                outline: "none",
                overflowY: "auto",
              }}
              contentEditable
              onInput={handleInput}
              suppressContentEditableWarning
            />
          </div>
        </div>
      </ScrollArea>

      {/* Only show page-turning buttons when there are multiple pages */}
      {pages.length > 1 && (
        <div className="pagination-controls flex justify-center mt-4 mb-6 space-x-2">
          <button
            onClick={() => navigateToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 text-sm"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage + 1} of {pages.length}
          </span>
          <button
            onClick={() => navigateToPage(currentPage + 1)}
            disabled={currentPage === pages.length - 1}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 text-sm"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorContent;
