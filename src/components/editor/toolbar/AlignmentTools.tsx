
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ToolbarButton from "./ToolbarButton";

interface AlignmentToolsProps {
  onFormatClick: (command: string, value?: string) => void;
}

const AlignmentTools: React.FC<AlignmentToolsProps> = ({ onFormatClick }) => {
  return (
    <>
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <ToolbarButton 
        onClick={() => onFormatClick('justifyLeft')}
        icon={<AlignLeft className="h-4 w-4" />}
        title="Align Left"
      />
      <ToolbarButton 
        onClick={() => onFormatClick('justifyCenter')}
        icon={<AlignCenter className="h-4 w-4" />}
        title="Align Center"
      />
      <ToolbarButton 
        onClick={() => onFormatClick('justifyRight')}
        icon={<AlignRight className="h-4 w-4" />}
        title="Align Right"
      />
    </>
  );
};

export default AlignmentTools;
