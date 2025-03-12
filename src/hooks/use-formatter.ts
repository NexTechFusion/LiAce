
import { useToast } from "@/hooks/use-toast";

export const useFormatter = (
  editorRef: React.RefObject<HTMLDivElement>,
  isUpdatingRef: React.MutableRefObject<boolean>,
  saveSelectionState: () => void,
  restoreSelection: () => boolean,
  scrollPositionRef: React.MutableRefObject<number>,
  setContent: (content: string) => void,
  lastContentRef: React.MutableRefObject<string>,
  applyFontSize: (fontSize: string) => void
) => {
  const { toast } = useToast();

  // Handle formatting commands without losing caret position
  const handleFormatClick = (command: string, value?: string) => {
    if (editorRef.current) {
      // Special handling for fontSize to use our improved method
      if (command === 'fontSize') {
        if (value) {
          applyFontSize(value);
        }
        return;
      }
      
      // Special handling for foreColor (text color)
      if (command === 'foreColor') {
        if (value) {
          // Make sure we have focus
          editorRef.current.focus();
          
          // Save the current selection and scroll position
          saveSelectionState();
          
          // Flag that we're updating to prevent selection events
          isUpdatingRef.current = true;
          
          // Check if this is a gradient
          if (value.startsWith('linear-gradient')) {
            // For gradients, we need to apply a span with background-clip
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const span = document.createElement('span');
              span.style.background = value;
              span.style.webkitBackgroundClip = 'text';
              span.style.backgroundClip = 'text';
              span.style.color = 'transparent';
              
              // Wrap the selected content in the span
              range.surroundContents(span);
              
              // Update the selection
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else {
            // For solid colors, use the execCommand
            document.execCommand('foreColor', false, value);
          }
          
          // Capture the updated content
          if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            lastContentRef.current = newContent;
            setContent(newContent);
          }
          
          // Allow a small delay for DOM to update
          setTimeout(() => {
            // Restore scroll position
            window.scrollTo(0, scrollPositionRef.current);
            
            // Restore selection
            restoreSelection();
            
            // Don't lose focus
            editorRef.current?.focus();
            
            isUpdatingRef.current = false;
          }, 10);
          
          toast({
            title: "Color Applied",
            description: value.startsWith('linear-gradient') ? "Gradient applied to text." : "Text color changed.",
            duration: 1500,
          });
        }
        return;
      }
      
      // Make sure we have focus
      editorRef.current.focus();
      
      // Save the current selection and scroll position
      saveSelectionState();
      
      // Flag that we're updating to prevent selection events
      isUpdatingRef.current = true;
      
      // Apply the formatting command
      document.execCommand(command, false, value);
      
      // Capture the updated content
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        lastContentRef.current = newContent;
        setContent(newContent);
      }
      
      // Allow a small delay for DOM to update
      setTimeout(() => {
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
        
        // Restore selection
        restoreSelection();
        
        // Don't lose focus
        editorRef.current?.focus();
        
        isUpdatingRef.current = false;
      }, 10);
      
      // Notify with toast
      toast({
        title: "Format Applied",
        description: `Applied ${command} formatting.`,
        duration: 1500,
      });
    }
  };

  return {
    handleFormatClick
  };
};
