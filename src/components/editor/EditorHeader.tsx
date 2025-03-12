
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  User,
  FileText,
  MoreHorizontal,
  Download,
  Share,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExport } from "@/hooks/use-export";
import { useVersions } from "@/contexts/VersionsContext";
import { useDocument } from "@/contexts/DocumentContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EditorHeaderProps {
  toggleLeftSidebar?: () => void;
  isMobile?: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  toggleLeftSidebar,
  isMobile = false
}) => {
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { exportToPDF, isExporting } = useExport();
  const { createVersion } = useVersions();
  const { editorContent, pageContents } = useDocument();
  const { toast } = useToast();

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!documentTitle.trim()) {
      setDocumentTitle("Untitled Document");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditingTitle(false);
    }
  };

  const handleSave = () => {
    // Generate version title with datetime and content count
    const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const contentLength = editorContent.length;

    if (!editorContent || editorContent.trim() === "") {
      toast({
        title: "Cannot save empty document",
        description: "Please add some content before saving a version.",
        variant: "destructive",
      });
      return;
    }

    const versionTitle = `${now} (${contentLength} chars)`;

    // Create new version
    const version = createVersion(versionTitle);

    // Show success toast
    toast({
      title: "Version saved",
      description: `Created version: ${versionTitle}`,
    });
  };

  return (
    <header className="flex items-center justify-between border-b p-2 sm:p-3 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center">
        {isMobile && toggleLeftSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftSidebar}
            className="mr-2 p-1"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2" />
          <h1 className="text-base sm:text-xl font-medium mr-2 sm:mr-8 truncate max-w-[150px] sm:max-w-none">
            {isEditingTitle ? (
              <Input
                value={documentTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="max-w-[120px] sm:max-w-[200px] h-7 sm:h-8 inline-block font-medium text-sm sm:text-xl"
              />
            ) : (
              <span
                onClick={handleTitleClick}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded"
              >
                {documentTitle}
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        {/*
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-1 sm:p-2"
        >
          <User className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-1 sm:p-2"
            >
              <Download className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={exportToPDF}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span>Export as PDF</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

        <Button
          size="sm"
          variant="ghost"
          className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 p-1 sm:p-2"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Save</span>
        </Button>
      </div>
    </header>
  );
};

export default EditorHeader;
