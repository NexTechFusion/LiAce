
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  editorRef: React.RefObject<HTMLDivElement>;
  isUpdatingRef: React.MutableRefObject<boolean>;
  saveSelectionState: () => void;
  restoreSelection: () => boolean;
  selectionStateRef: React.MutableRefObject<any>;
  handleContentChange: () => void;
}

const ImageUploader = ({
  editorRef,
  isUpdatingRef,
  saveSelectionState,
  restoreSelection,
  selectionStateRef,
  handleContentChange
}: ImageUploaderProps) => {
  const { toast } = useToast();

  // Apply resizable properties to images
  const applyResizableProperties = (img: HTMLImageElement) => {
    img.draggable = false;
    img.style.position = 'relative';
    img.style.cursor = 'default';
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          // Save current selection state
          saveSelectionState();
          
          // Create and insert the image
          const img = document.createElement('img');
          img.src = event.target.result as string;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.className = 'resizable';
          
          // Add resize handles to the image
          applyResizableProperties(img);
          
          // Insert the image at current selection
          if (selectionStateRef.current && selectionStateRef.current.range) {
            isUpdatingRef.current = true;
            
            // Restore selection first
            restoreSelection();
            
            // Delete selected content if any
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
              document.execCommand('delete');
            }
            
            // Insert the image
            document.execCommand('insertHTML', false, img.outerHTML);
            
            // Update content
            handleContentChange();
            
            isUpdatingRef.current = false;
            
            // Show success toast
            toast({
              title: "Image uploaded",
              description: "Image has been inserted into the document.",
            });
          }
          
          // Reset file input
          e.target.value = '';
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  return { handleImageUpload };
};

export default ImageUploader;
