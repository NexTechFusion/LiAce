import { CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/contexts/SidebarContext";
import { useEffect, useState } from "react";
import { useMobile } from "@/hooks/use-mobile";

interface PagesListProps {
  searchQuery: string;
}

const PagesList: React.FC<PagesListProps> = ({ searchQuery }) => {
  const { 
    pageContents, 
    currentPage, 
    handlePageClick, 
    createPreviewContent 
  } = useSidebar();
  
  const { isMobile } = useMobile();
  
  // Create a local state to force re-renders
  const [pagesSnapshot, setPagesSnapshot] = useState<string[]>([]);
  
  // Update local state whenever pageContents changes
  useEffect(() => {
    if (pageContents && pageContents.length > 0) {
      setPagesSnapshot([...pageContents]);
    }
  }, [pageContents, currentPage]);
  
  // Add a listener for document updates
  useEffect(() => {
    const handleDocumentUpdate = (event: CustomEvent) => {
      // Force a re-render on document updates by updating local state
      if (event.detail?.pageContents) {
        setPagesSnapshot([...event.detail.pageContents]);
      }
    };
    
    window.addEventListener('document-update' as any, handleDocumentUpdate);
    
    return () => {
      window.removeEventListener('document-update' as any, handleDocumentUpdate);
    };
  }, []);

  // Decide which array to use (local snapshot or context)
  const pagesToDisplay = pagesSnapshot.length > 0 ? pagesSnapshot : pageContents;
  
  // Filter pages based on search query
  const filteredPages = pagesToDisplay.filter(content => {
    if (!searchQuery) return true;
    const textContent = content.replace(/<[^>]*>?/gm, ' ').trim().toLowerCase();
    return textContent.includes(searchQuery.toLowerCase());
  });

  // If no pages, show a default first page
  if ((!filteredPages || filteredPages.length === 0) && !searchQuery) {
    return (
      <ScrollArea className="h-full p-2">
        <div className="space-y-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">
            DOCUMENT PAGES
          </div>
          
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            <p>Loading document pages...</p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Calculate page size based on device
  const pageWidth = isMobile ? "w-28" : "w-44";
  const pageHeight = isMobile ? "h-36" : "h-56";

  return (
    <ScrollArea className="h-full p-2">
      <div className="space-y-4">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">
          DOCUMENT PAGES ({pagesToDisplay.length})
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-4">
          {filteredPages.length > 0 ? (
            filteredPages.map((content, index) => {
              // Get the original index from the full list
              const originalIndex = pagesToDisplay.indexOf(content);
              const previewText = createPreviewContent(content);
              
              return (
                <div 
                  key={`page-${originalIndex}-${index}`}
                  className={`page-preview-container ${
                    currentPage === originalIndex 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  }`}
                  onClick={() => handlePageClick(originalIndex)}
                >
                  {/* Page preview with actual content */}
                  <div className={`mx-auto ${pageWidth} ${pageHeight} relative cursor-pointer mb-1`}>
                    {/* Paper page with shadow */}
                    <div className={`absolute inset-0 rounded-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md transform ${
                      currentPage === originalIndex ? 'scale-100' : 'scale-95 hover:scale-100'
                    } transition-transform duration-200`}>
                      {/* Actual page content in miniature - render as styled preview instead of HTML */}
                      <div className="w-full h-full p-2 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-hidden">
                          {/* Show actual text content instead of placeholders */}
                          <div className="space-y-[2px] prose-sm prose-gray dark:prose-invert miniature-preview">
                            {content.split(/(<h[1-6]>.*?<\/h[1-6]>|<p>.*?<\/p>|<li>.*?<\/li>|<blockquote>.*?<\/blockquote>)/g).map((section, i) => {
                              if (!section.trim()) return null;
                              
                              // Check element type
                              const isHeading = /<h[1-6]>/.test(section);
                              const isListItem = /<li>/.test(section);
                              const isBlockquote = /<blockquote>/.test(section);
                              
                              // Clean up the text content
                              const cleanText = section
                                .replace(/<[^>]*>/g, '')
                                .trim();
                              
                              if (!cleanText) return null;
                              
                              // Determine heading level for different sizes
                              let headingLevel = 1;
                              if (isHeading) {
                                const match = section.match(/<h([1-6])>/);
                                if (match && match[1]) {
                                  headingLevel = parseInt(match[1], 10);
                                }
                              }
                              
                              return (
                                <div 
                                  key={`section-${i}-${cleanText.substring(0, 5)}`} 
                                  className={`
                                    ${isHeading 
                                      ? `text-[${7-headingLevel}px] font-bold text-gray-900 dark:text-gray-100` 
                                      : isListItem
                                        ? 'text-[4px] pl-1 text-gray-800 dark:text-gray-200 flex'
                                        : isBlockquote
                                          ? 'text-[4px] pl-1 border-l border-gray-300 dark:border-gray-600 italic text-gray-600 dark:text-gray-400'
                                          : 'text-[4px] text-gray-800 dark:text-gray-200'
                                    } 
                                    mb-[2px] line-clamp-1
                                  `}
                                >
                                  {isListItem && (
                                    <span className="mr-[1px] inline-block text-gray-600 dark:text-gray-400">•</span>
                                  )}
                                  {cleanText}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Page number badge */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs">
                      {originalIndex + 1}
                    </div>
                    
                    {/* Current page indicator */}
                    {currentPage === originalIndex && (
                      <div className="absolute -right-1 -top-1">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 bg-white dark:bg-gray-800 rounded-full" />
                      </div>
                    )}
                  </div>
                  
                  {/* Page name and info */}
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Page {originalIndex + 1}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate px-2">
                      {previewText}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              <p>No pages found</p>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default PagesList;
