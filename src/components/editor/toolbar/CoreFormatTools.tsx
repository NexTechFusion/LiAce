
import { Bold, Italic, Underline } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import FontSizeDropdown from "./FontSizeDropdown";
import ColorPicker from "./ColorPicker";
import ToolbarButton from "./ToolbarButton";

interface CoreFormatToolsProps {
  onFormatClick: (command: string, value?: string) => void;
  currentFontSize: string;
  isMobile?: boolean;
}

const CoreFormatTools: React.FC<CoreFormatToolsProps> = ({ 
  onFormatClick, 
  currentFontSize,
  isMobile = false
}) => {
  const handleFontSizeChange = (size: string) => {
    onFormatClick('fontSize', size);
  };

  const handleColorSelect = (color: string) => {
    onFormatClick('foreColor', color);
  };

  return (
    <>
      <FontSizeDropdown 
        currentFontSize={currentFontSize}
        onFontSizeChange={handleFontSizeChange}
        isMobile={isMobile}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <ToolbarButton 
        onClick={() => onFormatClick('bold')}
        icon={<Bold className="h-4 w-4" />}
        title="Bold"
      />
      <ToolbarButton 
        onClick={() => onFormatClick('italic')}
        icon={<Italic className="h-4 w-4" />}
        title="Italic"
      />
      <ToolbarButton 
        onClick={() => onFormatClick('underline')}
        icon={<Underline className="h-4 w-4" />}
        title="Underline"
      />
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <ColorPicker 
        onColorSelect={handleColorSelect}
        isMobile={isMobile}
      />
    </>
  );
};

export default CoreFormatTools;
