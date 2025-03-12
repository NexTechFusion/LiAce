
import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Page {
  id: string;
  label: string;
  content: string;
  date: Date;
}

interface SidebarContextProps {
  pages: Page[];
  addPage: (label: string) => Page;
  deletePage: (id: string) => void;
  updatePage: (id: string, content: string) => void;
  renamePage: (id: string, label: string) => void;
  activePageId: string | null;
  setActivePageId: (id: string | null) => void;
  // Add the missing properties
  pageContents: string[];
  currentPage: number;
  handlePageClick: (index: number) => void;
  createPreviewContent: (content: string) => string;
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // For sidebar.tsx
  selectedPageId: string | null;
  setSelectedPageId: (id: string | null) => void;
  updatePageLabel: (id: string, label: string) => void;
}

// Export the SidebarContext
export const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [pageContents, setPageContents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const addPage = (label: string) => {
    const newPage = {
      id: uuidv4(),
      label,
      content: "",
      date: new Date()
    };
    
    setPages((prev) => [...prev, newPage]);
    return newPage;
  };

  const deletePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id));
    if (activePageId === id) {
      setActivePageId(null);
    }
  };

  const updatePage = (id: string, content: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, content } : page))
    );
  };

  const renamePage = (id: string, label: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, label } : page))
    );
  };

  // Same as renamePage but with a different name for sidebar.tsx
  const updatePageLabel = (id: string, label: string) => {
    renamePage(id, label);
  };

  const handlePageClick = (index: number) => {
    setCurrentPage(index);
  };

  const createPreviewContent = (content: string) => {
    // Simple function to create preview content
    return content.replace(/<[^>]*>?/gm, '').trim().substring(0, 50) + (content.length > 50 ? '...' : '');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const value: SidebarContextProps = {
    pages,
    addPage,
    deletePage,
    updatePage,
    renamePage,
    activePageId,
    setActivePageId,
    pageContents,
    currentPage,
    handlePageClick,
    createPreviewContent,
    searchQuery,
    handleSearchChange,
    selectedPageId,
    setSelectedPageId,
    updatePageLabel
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
