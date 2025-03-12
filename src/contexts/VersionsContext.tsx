import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useDocument } from "@/contexts/DocumentContext";

// Define types for versions
export interface Version {
  id: string;
  timestamp: Date;
  editorName: string;
  content: string;
  label: string;
  isCurrent: boolean;
}

interface VersionsContextType {
  versions: Version[];
  createVersion: (label: string, editorName?: string) => string;
  restoreVersion: (versionId: string) => boolean;
  compareVersions: (versionId1: string, versionId2: string) => { version1: Version; version2: Version } | null;
}

const VersionsContext = createContext<VersionsContextType>({
  versions: [],
  createVersion: () => "",
  restoreVersion: () => false,
  compareVersions: () => null,
});

export const useVersions = () => useContext(VersionsContext);

export const VersionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { editorContent, updateEditorContent } = useDocument();
  const [versions, setVersions] = useState<Version[]>([]);
  const initializedRef = useRef(false);

  // Initialize with a "current version" on first load
  useEffect(() => {
    if (!initializedRef.current && editorContent && editorContent.trim() !== "") {
      const initialVersion: Version = {
        id: generateId(),
        timestamp: new Date(),
        editorName: "You",
        content: editorContent,
        label: "Current Version",
        isCurrent: true
      };

      setVersions([initialVersion]);
      initializedRef.current = true;
    }
  }, [editorContent]);

  // Generate random ID for versions
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };

  // Create a new version
  const createVersion = (label: string, editorName: string = "You") => {
    const newVersion: Version = {
      id: generateId(),
      timestamp: new Date(),
      editorName,
      content: editorContent,
      label,
      isCurrent: true
    };

    // Using functional update to ensure we have the latest state
    setVersions(prevVersions => {
      // First update all previous versions to not be current
      const updatedPrevVersions = prevVersions.map(version => ({
        ...version,
        isCurrent: false
      }));

      // Add new version at the beginning
      return [newVersion, ...updatedPrevVersions];
    });

    return newVersion.id;
  };

  // Restore a specific version
  const restoreVersion = (versionId: string) => {
    const versionToRestore = versions.find(v => v.id === versionId);
    
    if (versionToRestore) {
      // Update the editor content with the version content
      updateEditorContent(versionToRestore.content);
      
      // Get all editor refs in the document
      const editorElements = document.querySelectorAll('[contenteditable="true"]');
      
      // Update the content directly in the DOM
      // This forces the editor to visually update immediately
      editorElements.forEach(editor => {
        editor.innerHTML = versionToRestore.content;
      });
      
      // Also dispatch a document-update event to ensure other components are updated
      const updateEvent = new CustomEvent('document-update', { 
        detail: { 
          content: versionToRestore.content
        } 
      });
      window.dispatchEvent(updateEvent);
      
      // Mark all versions as not current, except the restored one
      setVersions(prevVersions => 
        prevVersions.map(version => ({
          ...version,
          isCurrent: version.id === versionId
        }))
      );
      
      return true;
    }
    
    return false;
  };

  // Compare two versions (to be implemented later for diff view)
  const compareVersions = (versionId1: string, versionId2: string) => {
    const version1 = versions.find(v => v.id === versionId1);
    const version2 = versions.find(v => v.id === versionId2);

    if (version1 && version2) {
      // Here we would return the difference between versions
      // For now, just return the two versions
      return { version1, version2 };
    }

    return null;
  };

  const contextValue = {
    versions,
    createVersion,
    restoreVersion,
    compareVersions
  };

  return (
    <VersionsContext.Provider value={contextValue}>
      {children}
    </VersionsContext.Provider>
  );
};
