
import { useRef, useEffect } from "react";

type SelectionState = {
  startNode: Node | null;
  startOffset: number;
  endNode: Node | null;
  endOffset: number;
  startNodePath?: number[];
  endNodePath?: number[];
  selection?: Selection | null;
  range?: Range | null;
  html?: string;
  isCollapsed?: boolean;
};

export const useSelection = (editorRef: React.RefObject<HTMLDivElement>, isUpdatingRef: React.MutableRefObject<boolean>) => {
  const selectionStateRef = useRef<SelectionState>({
    startNode: null,
    startOffset: 0,
    endNode: null,
    endOffset: 0
  });
  const scrollPositionRef = useRef(0);
  
  // Capture node path for more reliable selection restoration
  const getNodePath = (node: Node): number[] => {
    const path: number[] = [];
    let currentNode = node;
    
    while (currentNode && currentNode.parentNode && currentNode.parentNode !== editorRef.current) {
      const parent = currentNode.parentNode;
      const children = Array.from(parent.childNodes);
      const index = children.indexOf(currentNode as ChildNode);
      
      if (index !== -1) {
        path.unshift(index);
      }
      
      currentNode = parent;
    }
    
    return path;
  };
  
  // Find node by path for more reliable restoration
  const getNodeByPath = (path: number[]): Node | null => {
    if (!editorRef.current) return null;
    
    let currentNode: Node = editorRef.current;
    
    for (const index of path) {
      if (currentNode.childNodes && currentNode.childNodes.length > index) {
        currentNode = currentNode.childNodes[index];
      } else {
        return null;
      }
    }
    
    return currentNode;
  };
  
  // Enhanced selection state preservation
  const saveSelectionState = () => {
    if (isUpdatingRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    try {
      const range = selection.getRangeAt(0);
      
      if (!range) return;
      
      // Save the complete selection state
      selectionStateRef.current = {
        startNode: range.startContainer,
        startOffset: range.startOffset,
        endNode: range.endContainer,
        endOffset: range.endOffset,
        startNodePath: getNodePath(range.startContainer),
        endNodePath: getNodePath(range.endContainer),
        range: range.cloneRange(),
        html: editorRef.current?.innerHTML,
        isCollapsed: range.collapsed
      };
      
      // Save scroll position
      scrollPositionRef.current = window.scrollY;
    } catch (error) {
      console.error("Error saving selection:", error);
    }
    
    return selectionStateRef.current;
  };
  
  // Enhanced restore selection function with multiple fallback mechanisms
  const restoreSelection = () => {
    if (!editorRef.current) return false;
    if (isUpdatingRef.current) return false;
    
    isUpdatingRef.current = true;
    
    try {
      const selection = window.getSelection();
      if (!selection) {
        isUpdatingRef.current = false;
        return false;
      }
      
      selection.removeAllRanges();
      
      const { 
        startNode, startOffset, endNode, endOffset,
        startNodePath, endNodePath, isCollapsed
      } = selectionStateRef.current;
      
      // Try multiple restoration methods
      
      // Method 1: Direct node reference if still in DOM
      if (startNode && endNode && 
          document.contains(startNode) && 
          document.contains(endNode)) {
        
        try {
          const range = document.createRange();
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);
          selection.addRange(range);
          isUpdatingRef.current = false;
          return true;
        } catch (error) {
          console.log("Method 1 failed:", error);
        }
      }
      
      // Method 2: Node path traversal
      if (startNodePath && endNodePath) {
        const newStartNode = getNodeByPath(startNodePath);
        const newEndNode = getNodeByPath(endNodePath);
        
        if (newStartNode && newEndNode) {
          try {
            const range = document.createRange();
            range.setStart(newStartNode, startOffset);
            range.setEnd(newEndNode, endOffset);
            selection.addRange(range);
            isUpdatingRef.current = false;
            return true;
          } catch (error) {
            console.log("Method 2 failed:", error);
          }
        }
      }
      
      // Method 3: If both failed and we're at end of document, place cursor at end
      if (editorRef.current && editorRef.current.lastChild) {
        try {
          const lastChild = editorRef.current.lastChild;
          const range = document.createRange();
          
          if (lastChild.nodeType === Node.TEXT_NODE) {
            const textNode = lastChild as Text;
            range.setStart(textNode, textNode.length);
            range.setEnd(textNode, textNode.length);
          } else {
            range.selectNodeContents(lastChild);
            range.collapse(false); // Collapse to end
          }
          
          selection.addRange(range);
          isUpdatingRef.current = false;
          return true;
        } catch (error) {
          console.log("Method 3 failed:", error);
        }
      }
    } catch (error) {
      console.error("Error restoring selection:", error);
    }
    
    isUpdatingRef.current = false;
    return false;
  };
  
  return {
    selectionStateRef,
    scrollPositionRef,
    saveSelectionState,
    restoreSelection,
    getNodePath,
    getNodeByPath
  };
};
