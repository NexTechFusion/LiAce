
import { Link, Image } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ToolbarButton from "./ToolbarButton";

interface InsertToolsProps {
  onFormatClick: (command: string, value?: string) => void;
  onImageButtonClick: () => void;
}

const InsertTools: React.FC<InsertToolsProps> = ({ 
  onFormatClick, 
  onImageButtonClick 
}) => {
  return (
    <>
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <ToolbarButton 
        onClick={() => {
          const url = prompt('Enter the URL:');
          if (url) onFormatClick('createLink', url);
        }}
        icon={<Link className="h-4 w-4" />}
        title="Insert Link"
      />
      <ToolbarButton 
        onClick={onImageButtonClick}
        icon={<Image className="h-4 w-4" />}
        title="Insert Image"
      />
    </>
  );
};

export default InsertTools;
