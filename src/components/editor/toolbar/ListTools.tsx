
import { List, ListOrdered, Quote } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ToolbarButton from "./ToolbarButton";

interface ListToolsProps {
  onFormatClick: (command: string, value?: string) => void;
}

const ListTools: React.FC<ListToolsProps> = ({ onFormatClick }) => {
  return (
    <>
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <ToolbarButton 
        onClick={() => onFormatClick('insertUnorderedList')}
        icon={<List className="h-4 w-4" />}
        title="Bullet List"
      />
      <ToolbarButton 
        onClick={() => onFormatClick('insertOrderedList')}
        icon={<ListOrdered className="h-4 w-4" />}
        title="Numbered List"
      />
      <ToolbarButton 
        onClick={() => onFormatClick('formatBlock', '<blockquote>')}
        icon={<Quote className="h-4 w-4" />}
        title="Quote"
      />
    </>
  );
};

export default ListTools;
