import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our context state
interface DocumentContextType {
  editorContent: string;
  pageContents: string[];
  pageCount: number;
  currentPage: number;
  updateEditorContent: (content: string) => void;
  updatePageContents: (contents: string[]) => void;
  updatePageCount: (count: number) => void;
  setCurrentPage: (page: number) => void;
}

// Create context with default values
const DocumentContext = createContext<DocumentContextType>({
  editorContent: '',
  pageContents: [],
  pageCount: 1,
  currentPage: 0,
  updateEditorContent: () => {},
  updatePageContents: () => {},
  updatePageCount: () => {},
  setCurrentPage: () => {},
});

// Custom hook to use the document context
export const useDocument = () => useContext(DocumentContext);

// Provider component
export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [editorContent, setEditorContent] = useState<string>('');
  const [pageContents, setPageContents] = useState<string[]>(['<p>New Document</p>']); // Default content for first page
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Set up listener for document updates from the editor
  useEffect(() => {

    const handleDocumentUpdate = (event: CustomEvent) => {

      if (event.detail) {
        if (event.detail.pageCount) {
          setPageCount(event.detail.pageCount);
        }
        
        if (event.detail.content) {
          setEditorContent(event.detail.content);
        }
        
        if (event.detail.pageContents) {
          // Create a new array to ensure reference changes trigger re-renders
          const newPageContents = [...event.detail.pageContents];
          setPageContents(newPageContents);
        }
      }
    };

    // Listen for document updates
    window.addEventListener('document-update' as any, handleDocumentUpdate);
    
    // Trigger a custom event to initialize the editor with default content if empty
    if (pageContents.length === 1 && pageContents[0] === '<p>New Document</p>') {
      const initEvent = new CustomEvent('document-update', { 
        detail: { 
          pageCount: 1,
          content: '<p>New Document</p>',
          pageContents: ['<p>New Document</p>'] 
        } 
      });
      window.dispatchEvent(initEvent);
    }
    
    return () => {
      window.removeEventListener('document-update' as any, handleDocumentUpdate);
    };
  }, []);

  // Safety check to ensure document is initialized properly
  useEffect(() => {
    let initCheckAttempts = 0;
    const maxAttempts = 3;
    
    // Check if we need to re-trigger initialization
    const checkInitialization = () => {
      if (pageContents.length === 1 && pageContents[0] === '<p>New Document</p>' && initCheckAttempts < maxAttempts) {
        const initEvent = new CustomEvent('document-update', { 
          detail: { 
            pageCount: 1,
            content: '<p>New Document</p>',
            pageContents: ['<p>New Document</p>'] 
          } 
        });
        window.dispatchEvent(initEvent);
        initCheckAttempts++;
      }
    };
    
    // Check after a delay to allow other components to initialize
    const timer = setTimeout(checkInitialization, 1000);
    
    return () => clearTimeout(timer);
  }, [pageContents]);

  // Update functions
  const updateEditorContent = (content: string) => {
    setEditorContent(content);
  };

  const updatePageContents = (contents: string[]) => {
    console.log("updatePageContents called with:", contents);
    // Create a new array to ensure reference changes
    setPageContents([...contents]);
  };

  const updatePageCount = (count: number) => {
    setPageCount(count);
  };

  return (
    <DocumentContext.Provider
      value={{
        editorContent,
        pageContents,
        pageCount,
        currentPage,
        updateEditorContent,
        updatePageContents,
        updatePageCount,
        setCurrentPage,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};
