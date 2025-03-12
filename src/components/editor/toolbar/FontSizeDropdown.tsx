
import { useState } from "react";
import { Type, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FontSizeDropdownProps {
  currentFontSize: string;
  onFontSizeChange: (size: string) => void;
  isMobile?: boolean;
}

const FontSizeDropdown: React.FC<FontSizeDropdownProps> = ({
  currentFontSize,
  onFontSizeChange,
  isMobile = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fontSizes = ["8px", "9px", "10px", "11px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"];

  // Get display font size value (without 'px' for cleaner UI)
  const getDisplayFontSize = () => {
    // Handle cases where the font might be in other units or not a direct match
    const numericValue = parseInt(currentFontSize);
    if (isNaN(numericValue)) return currentFontSize;
    return `${numericValue}px`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 flex items-center space-x-1">
          <Type className="h-4 w-4" />
          {!isMobile && <span className="text-xs">{getDisplayFontSize()}</span>}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
        {fontSizes.map((size) => (
          <DropdownMenuItem 
            key={size}
            onClick={() => {
              onFontSizeChange(size);
              setIsOpen(false);
            }}
            className={`cursor-pointer ${size === currentFontSize ? "bg-gray-100 dark:bg-gray-800" : ""}`}
          >
            <span style={{ fontSize: size }}>{size}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FontSizeDropdown;
