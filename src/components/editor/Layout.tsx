import { useState, useEffect, useRef } from "react";
import EditorHeader from "./EditorHeader";
import LeftSidebar from "./sidebar/LeftSidebar";
import Editor from "./Editor";
import RightSidebar from "./sidebar/RightSidebar";
import StatusBar from "./StatusBar";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Menu, PanelLeft, PanelRight } from "lucide-react";
import { useDocument } from "@/contexts/DocumentContext";
import { useMobile } from "@/hooks/use-mobile";
import { RightSidebarProvider } from "@/contexts/RightSidebarContext";

const Layout = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGrammarCorrecting, setIsGrammarCorrecting] = useState(false);
  const { currentPage, setCurrentPage, pageCount } = useDocument();
  const lastScrollPosRef = useRef(0);
  const { toast } = useToast();
  const { isMobile } = useMobile();
  
  // Close sidebars on mobile by default
  useEffect(() => {
    if (isMobile) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  }, [isMobile]);
  
  // Debounced scroll handler with more efficient implementation
  const handleScrollDebounced = debounce(() => {
    const scrollPosition = window.scrollY;
    lastScrollPosRef.current = scrollPosition;
    
    // Only update if we've scrolled a significant amount to avoid small jumps triggering page changes
    const viewportHeight = window.innerHeight;
    const estimatedPage = Math.floor(scrollPosition / viewportHeight) + 1;
    
    if (estimatedPage !== currentPage + 1 && estimatedPage <= pageCount) {
      setCurrentPage(estimatedPage - 1); // Convert to zero-based for state
    }
  }, 200);

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScrollDebounced);
    
    return () => {
      window.removeEventListener('scroll', handleScrollDebounced);
      handleScrollDebounced.cancel();
    };
  }, [currentPage, pageCount]); // Add currentPage to dependencies

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
    toast({
      title: focusMode ? "Focus mode disabled" : "Focus mode enabled",
      description: focusMode ? "All sidebars restored" : "Distraction-free writing activated",
    });
  };
  
  // Function to handle zoom in (increase by 20%)
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 20, 200);
    setZoomLevel(newZoom);
    toast({
      title: "Zoom Level Changed",
      description: `Zoom set to ${newZoom}%`,
      duration: 1500,
    });
  };
  
  // Function to handle zoom out (decrease by 20%)
  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 20, 50);
    setZoomLevel(newZoom);
    toast({
      title: "Zoom Level Changed",
      description: `Zoom set to ${newZoom}%`,
      duration: 1500,
    });
  };

  // Combined loading state handler for both suggestions and grammar correction
  const handleLoadingStateChange = (isLoading: boolean, type: 'suggestions' | 'grammar') => {
    if (type === 'suggestions') {
      setIsLoadingSuggestions(isLoading);
    } else {
      setIsGrammarCorrecting(isLoading);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <RightSidebarProvider>
        <EditorHeader toggleLeftSidebar={toggleLeftSidebar} isMobile={isMobile} />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar isOpen={leftSidebarOpen && !focusMode} />
          <main className="flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out relative">
            <div className="flex-1 overflow-auto">
              <Editor 
                zoomLevel={zoomLevel} 
                onSuggestionsLoadingChange={(isLoading) => handleLoadingStateChange(isLoading, 'suggestions')}
                onGrammarCorrectionChange={(isLoading) => handleLoadingStateChange(isLoading, 'grammar')}
              />
            </div>
            
            {/* Zoom controls at bottom right - hide on very small screens */}
            <div className="zoom-controls absolute bottom-12 right-4 hidden sm:flex items-center bg-white dark:bg-gray-800 rounded-md shadow-md p-2 z-10">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleZoomOut} 
                className="mr-2"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium px-2 min-w-[60px] text-center">
                {zoomLevel}%
              </span>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleZoomIn} 
                className="ml-2"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile sidebar toggles (only visible on mobile) */}
            {isMobile && (
              <div className="fixed bottom-20 left-4 flex flex-col space-y-2 z-20">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-lg"
                  onClick={toggleLeftSidebar}
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-lg"
                  onClick={toggleRightSidebar}
                >
                  <PanelRight className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <StatusBar 
              toggleLeftSidebar={toggleLeftSidebar} 
              toggleRightSidebar={toggleRightSidebar} 
              toggleFocusMode={toggleFocusMode}
              focusMode={focusMode}
              isMobile={isMobile}
              isLoadingSuggestions={isLoadingSuggestions}
              isGrammarCorrecting={isGrammarCorrecting}
            />
          </main>
          <RightSidebar isOpen={rightSidebarOpen && !focusMode} />
        </div>
      </RightSidebarProvider>
    </div>
  );
};

export default Layout;
