
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVersions, Version } from "@/contexts/VersionsContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const VersionsList: React.FC = () => {
  const { versions, restoreVersion, compareVersions } = useVersions();
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  
  const handleRestore = (versionId: string) => {
    if (restoreVersion(versionId)) {
      toast({
        title: "Version restored",
        description: "Document has been restored to the selected version.",
      });
    }
  };
  
  const handleCompare = (versionId: string) => {
    // For now, just toggle selection for future comparison feature
    setSelectedVersion(selectedVersion === versionId ? null : versionId);
    
    toast({
      title: "Compare feature",
      description: "Version comparison will be implemented in a future update.",
    });
  };
  
  const formatDate = (date: Date): string => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  // Sort versions by timestamp, newest first
  const sortedVersions = [...versions].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <ScrollArea className="h-full p-2">
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">
          VERSION HISTORY ({versions.length})
        </div>
        
        {versions.length === 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 my-8">
            No versions yet. Save your document to create a version.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-900 ml-4">
            {sortedVersions.map((version, index) => (
              <div key={version.id} className="mb-4">
                <div className={`absolute left-[-5px] w-3 h-3 rounded-full ${
                  version.isCurrent 
                    ? "bg-blue-500" 
                    : "bg-gray-300 dark:bg-gray-700"
                }`} style={{ top: `${index * 4 + 0.5}rem` }}></div>
                
                <div className="flex items-center mb-1">
                  <span className={`text-sm ${version.isCurrent ? "font-medium" : ""}`}>
                    {version.label}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {formatDate(version.timestamp)} • Edited by {version.editorName}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className={`text-xs ${
                      version.isCurrent 
                        ? "text-gray-500 dark:text-gray-400 cursor-default" 
                        : "text-blue-600 dark:text-blue-400 hover:underline"
                    }`}
                    onClick={() => handleRestore(version.id)}
                    disabled={version.isCurrent}
                  >
                    {version.isCurrent ? "Current" : "Restore"}
                  </button>
                  
                  {!version.isCurrent && (
                    <button 
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => handleCompare(version.id)}
                    >
                      Compare
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default VersionsList;
