
import { useState } from "react";
import { MoreHorizontal, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface MobileFormatDropdownProps {
  onFormatClick: (command: string, value?: string) => void;
  onImageButtonClick: () => void;
}

const MobileFormatDropdown: React.FC<MobileFormatDropdownProps> = ({
  onFormatClick,
  onImageButtonClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");

  // Common colors for text
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Dark Gray", value: "#333333" },
    { name: "Gray", value: "#888888" },
    { name: "Red", value: "#ea384c" },
    { name: "Orange", value: "#F97316" },
    { name: "Yellow", value: "#FACC15" },
    { name: "Green", value: "#22C55E" },
    { name: "Blue", value: "#0EA5E9" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#D946EF" },
  ];

  // Gradient templates
  const gradients = [
    { 
      name: "Sunset", 
      value: "linear-gradient(90deg, #FF719A 0%, #FFA99F 50%, #FFE29F 100%)"
    },
    { 
      name: "Ocean", 
      value: "linear-gradient(90deg, #0EA5E9 0%, #D3E4FD 100%)"
    },
    { 
      name: "Forest", 
      value: "linear-gradient(90deg, #22C55E 0%, #F2FCE2 100%)"
    },
  ];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setIsOpen(false);
    onFormatClick('foreColor', color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    onFormatClick('foreColor', color);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-2">
        <div className="grid grid-cols-3 gap-1">
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onFormatClick('formatBlock', '<h1>');
            }}
            icon={<Heading1 className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onFormatClick('formatBlock', '<h2>');
            }}
            icon={<Heading2 className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onFormatClick('formatBlock', '<blockquote>');
            }}
            icon={<Quote className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onFormatClick('insertUnorderedList');
            }}
            icon={<List className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onFormatClick('insertOrderedList');
            }}
            icon={<ListOrdered className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              const url = prompt('Enter the URL:');
              if (url) onFormatClick('createLink', url);
            }}
            icon={<Link className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onImageButtonClick();
            }}
            icon={<Image className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onFormatClick('justifyLeft');
            }}
            icon={<AlignLeft className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onFormatClick('justifyCenter');
            }}
            icon={<AlignCenter className="h-4 w-4" />}
          />
          <ToolbarButton 
            onClick={() => {
              setIsOpen(false);
              onFormatClick('justifyRight');
            }}
            icon={<AlignRight className="h-4 w-4" />}
          />
        </div>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mt-1">
            <Palette className="h-4 w-4 mr-2" />
            <span>Text Color</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-56 p-2">
              <div className="mb-2">
                <h4 className="text-sm font-medium mb-1">Solid Colors</h4>
                <div className="grid grid-cols-5 gap-1">
                  {colors.map((color) => (
                    <Button
                      key={color.value}
                      className="w-6 h-6 p-0 rounded-md border border-gray-200 dark:border-gray-700"
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />

              <div className="mb-2">
                <h4 className="text-sm font-medium mb-1">Gradients</h4>
                <div className="grid grid-cols-1 gap-1">
                  {gradients.map((gradient) => (
                    <Button
                      key={gradient.name}
                      className="h-6 w-full p-0 rounded-md border border-gray-200 dark:border-gray-700"
                      style={{ background: gradient.value }}
                      onClick={() => handleColorSelect(gradient.value)}
                      title={gradient.name}
                    />
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />

              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={handleCustomColorChange}
                  className="w-8 h-8 p-0 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <div className="text-sm">Custom color</div>
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileFormatDropdown;
