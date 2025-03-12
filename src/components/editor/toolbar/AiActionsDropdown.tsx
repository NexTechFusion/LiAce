
import { useState } from "react";
import { Brain, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AiActionsDropdownProps {
  onAiAction: (action: string) => void;
  isProcessingAi: boolean;
  selectedText: string;
}

const AiActionsDropdown: React.FC<AiActionsDropdownProps> = ({
  onAiAction,
  isProcessingAi,
  selectedText
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAiAction = (action: string) => {
    setIsOpen(false);
    onAiAction(action);
  };

  return (
    <div className="ml-auto">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isProcessingAi || !selectedText}
            className={`flex items-center ${isProcessingAi ? 'opacity-70' : ''}`}
          >
            {isProcessingAi ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Processing...</span>
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 sm:mr-2 text-blue-500" />
                <span className="hidden sm:inline">AI Actions</span>
                <ChevronDown className="h-3 w-3 ml-1 hidden sm:block" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onClick={() => handleAiAction("Expand Section")}
            disabled={!selectedText}
          >
            Expand Section
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAiAction("Simplify Language")}
            disabled={!selectedText}
          >
            Simplify Language
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAiAction("Fix Grammar")}
            disabled={!selectedText}
          >
            Fix Grammar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AiActionsDropdown;
