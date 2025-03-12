import React from "react";
import PageBreakIndicator from "./PageBreakIndicator";
import SelectionContextMenu from "./SelectionContextMenu";

interface EditorContentAreaProps {
  editorRef: React.RefObject<HTMLDivElement>;
  content: string;
  handleContentChange: () => void;
  pageBreaks: number[];
  zoomLevel: number;
  isMobile: boolean;
  selectedText: string;
  onFixGrammar?: () => void;
  onRephrase?: () => void;
  isFixingGrammar?: boolean;
  isRephrasing?: boolean;
}

const EditorContentArea: React.FC<EditorContentAreaProps> = ({
  editorRef,
  content,
  handleContentChange,
  pageBreaks,
  zoomLevel,
  isMobile,
  selectedText,
  onFixGrammar = () => {},
  onRephrase = () => {},
  isFixingGrammar = false,
  isRephrasing = false
}) => {
  // Define padding in pixels
  const documentPadding = isMobile ? "12px" : "72px"; // 72px is approximately 1 inch

  return (
    <div className="editor-paper bg-white dark:bg-gray-800 mx-auto relative shadow-md"
      style={{
        width: isMobile ? "100%" : `${816}px`, // US Letter width or full width on mobile
        minHeight: `${1056}px`, // US Letter height
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: "top center",
        maxWidth: isMobile ? "100%" : "none",
      }}
    >
      {/* Page break indicators component */}
      <PageBreakIndicator pageBreaks={pageBreaks} />
      
      {/* Selection context menu */}
      <SelectionContextMenu 
        selectedText={selectedText}
        onFixGrammar={onFixGrammar}
        onRephrase={onRephrase}
        editorRef={editorRef}
        isFixingGrammar={isFixingGrammar}
        isRephrasing={isRephrasing}
      />
      
      {/* Editable content area */}
      <div
        ref={editorRef}
        className="ProseMirror"
        style={{
          padding: documentPadding,
          minHeight: "100%",
          outline: "none",
        }}
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={handleContentChange}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default EditorContentArea;
