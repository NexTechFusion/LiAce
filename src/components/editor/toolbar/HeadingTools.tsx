
import { Heading1, Heading2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ToolbarButton from "./ToolbarButton";

interface HeadingToolsProps {
  onFormatClick: (command: string, value?: string) => void;
}

const HeadingTools: React.FC<HeadingToolsProps> = ({ onFormatClick }) => {
  return (
    <>
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <ToolbarButton 
        onClick={() => onFormatClick('formatBlock', '<h1>')}
        icon={<Heading1 className="h-4 w-4" />}
        title="Heading 1"
      />
      <ToolbarButton 
        onClick={() => onFormatClick('formatBlock', '<h2>')}
        icon={<Heading2 className="h-4 w-4" />}
        title="Heading 2"
      />
    </>
  );
};

export default HeadingTools;
