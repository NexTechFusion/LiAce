
import { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      toast({
        title: "Preparing PDF",
        description: "Please wait while we generate your PDF...",
      });

      // Find page containers or editor content
      let pageContainers = document.querySelectorAll(".page-container");
      
      // If no page containers found, try to find editor content and add class temporarily
      if (!pageContainers || pageContainers.length === 0) {
        const editorContent = document.querySelector(".editor-content") || document.querySelector(".ProseMirror");
        
        if (!editorContent) {
          throw new Error("No editor content found to export");
        }
        
        // Add page-container class temporarily
        editorContent.classList.add("page-container");
        
        // Refresh the query to include the newly classified element
        pageContainers = document.querySelectorAll(".page-container");
        
        if (!pageContainers || pageContainers.length === 0) {
          throw new Error("Failed to identify page content for export");
        }
      }

      // Create a new PDF document with appropriate dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",  // Using points for better precision
        format: [816, 1056] // Standard US Letter size
      });

      // Process each page
      for (let i = 0; i < pageContainers.length; i++) {
        // If not the first page, add a new page to the PDF
        if (i > 0) {
          pdf.addPage();
        }

        // Create a clone of the page to modify without affecting the UI
        const pageClone = pageContainers[i].cloneNode(true) as HTMLElement;
        
        // Ensure the clone has proper dimensions
        pageClone.style.width = "816px";
        pageClone.style.height = "1056px";
        pageClone.style.minHeight = "1056px";
        pageClone.style.padding = "72px";
        pageClone.style.backgroundColor = "white";
        pageClone.style.position = "fixed";
        pageClone.style.top = "-9999px";
        pageClone.style.left = "-9999px";
        
        // Append to body temporarily for rendering
        document.body.appendChild(pageClone);

        // Capture the page as canvas
        const canvas = await html2canvas(pageClone, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 816,
          height: 1056
        });
        
        // Remove the clone after capture
        document.body.removeChild(pageClone);

        // Add the canvas image to the PDF
        const imgData = canvas.toDataURL("image/png");
        
        // Use the PDF dimensions to avoid stretching
        pdf.addImage({
          imageData: imgData,
          x: 0,
          y: 0,
          width: 816,
          height: 1056,
          compression: 'FAST'
        });
      }

      // Save the PDF with a meaningful name
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`document_${timestamp}.pdf`);
      
      toast({
        title: "PDF Export Complete",
        description: "Your document has been exported successfully.",
      });

      // Clean up: remove temporarily added class if needed
      const tempClassedElements = document.querySelectorAll(".editor-content.page-container, .ProseMirror.page-container");
      tempClassedElements.forEach(el => {
        el.classList.remove("page-container");
      });
      
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your document. Please try again.",
        variant: "destructive",
      });
      
      // Clean up on error as well
      const tempClassedElements = document.querySelectorAll(".editor-content.page-container, .ProseMirror.page-container");
      tempClassedElements.forEach(el => {
        el.classList.remove("page-container");
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    isExporting
  };
};
