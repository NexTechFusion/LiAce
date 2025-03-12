import React from 'react';

// Get context from the editor to use as a prompt - only up to caret position
export const getTextUntilCaret = (editorRef: React.RefObject<HTMLDivElement>): string => {
  if (!editorRef.current) return '';

  // Get the current selection to determine caret position
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return '';

  const range = selection.getRangeAt(0);
  const caretNode = range.startContainer;
  const caretOffset = range.startOffset;

  // Find the paragraph containing the caret
  let currentNode: Node | null = caretNode;
  let currentParagraph: HTMLElement | null = null;

  // Traverse up the DOM tree to find the paragraph element
  while (currentNode && currentNode !== editorRef.current) {
    if (currentNode.nodeName === 'P') {
      currentParagraph = currentNode as HTMLElement;
      break;
    }
    currentNode = currentNode.parentNode;
  }

  if (!currentParagraph) return '';

  // Get text content of the current paragraph, but only up to the caret position
  let context = '';

  // Create a TreeWalker to get all text nodes in the paragraph
  const treeWalker = document.createTreeWalker(
    currentParagraph,
    NodeFilter.SHOW_TEXT,
    null
  );

  let textNode: Text | null;
  let foundCaretNode = false;

  // Collect text from all nodes before the caret node and partial text from caret node
  while ((textNode = treeWalker.nextNode() as Text)) {
    if (textNode === caretNode) {
      foundCaretNode = true;
      context += textNode.nodeValue?.substring(0, caretOffset) || '';
      break;
    } else if (!foundCaretNode) {
      context += textNode.nodeValue || '';
    }
  }

  // If context is short, add previous paragraph content
  if (context.length < 50) {
    const paragraphs = editorRef.current.querySelectorAll('p');
    const paragraphArray = Array.from(paragraphs);
    const currentIndex = paragraphArray.indexOf(currentParagraph as HTMLParagraphElement);

    if (currentIndex > 0) {
      const previousText = paragraphs[currentIndex - 1].textContent || '';
      context = previousText + ' ' + context;
    }
  }

  // Limit context length to avoid excessively large prompts
  return context;
};

// Helper function to get text after the caret position
export const getTextAfterCaret = (editorRef: React.RefObject<HTMLDivElement>): string => {
  if (!editorRef.current) return '';

  // Get the current selection to determine caret position
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return '';

  const range = selection.getRangeAt(0);
  const caretNode = range.startContainer;
  const caretOffset = range.startOffset;

  // Find the paragraph containing the caret
  let currentNode: Node | null = caretNode;
  let currentParagraph: HTMLElement | null = null;

  // Traverse up the DOM tree to find the paragraph element
  while (currentNode && currentNode !== editorRef.current) {
    if (currentNode.nodeName === 'P') {
      currentParagraph = currentNode as HTMLElement;
      break;
    }
    currentNode = currentNode.parentNode;
  }

  if (!currentParagraph) return '';

  // Get text content of the current paragraph, but only after the caret position
  let afterCaretText = '';

  // Create a TreeWalker to get all text nodes in the paragraph
  const treeWalker = document.createTreeWalker(
    currentParagraph,
    NodeFilter.SHOW_TEXT,
    null
  );

  let textNode: Text | null;
  let foundCaretNode = false;
  let processedCaretNode = false;

  // Collect text from all nodes after the caret node and partial text from caret node
  while ((textNode = treeWalker.nextNode() as Text)) {
    if (textNode === caretNode) {
      foundCaretNode = true;
      afterCaretText += textNode.nodeValue?.substring(caretOffset) || '';
      processedCaretNode = true;
    } else if (foundCaretNode || processedCaretNode) {
      afterCaretText += textNode.nodeValue || '';
    }
  }

  // Include a bit of the next paragraph if available
  if (currentParagraph.nextElementSibling && currentParagraph.nextElementSibling.nodeName === 'P') {
    const nextParagraphText = currentParagraph.nextElementSibling.textContent || '';
    if (nextParagraphText.length > 0) {
      afterCaretText += ' ' + nextParagraphText.substring(0, 50); // Get just the start of next paragraph
    }
  }

  return afterCaretText.trim();
}; 