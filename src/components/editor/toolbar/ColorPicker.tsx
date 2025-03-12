
import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ToolbarButton from "./ToolbarButton";

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  isMobile?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  onColorSelect,
  isMobile = false 
}) => {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showCustomPicker, setShowCustomPicker] = useState(false);

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
    { 
      name: "Purple Rain", 
      value: "linear-gradient(90deg, #8B5CF6 0%, #E5DEFF 100%)"
    },
    { 
      name: "Candy", 
      value: "linear-gradient(90deg, #D946EF 0%, #FFDEE2 100%)"
    },
  ];

  const buttonStyle = isMobile 
    ? "w-6 h-6" 
    : "w-5 h-5 sm:w-6 sm:h-6";

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    onColorSelect(color);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <ToolbarButton
            onClick={() => {}}
            icon={<Palette className="h-4 w-4" />}
            title="Text Color"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-2 w-56">
        <div className="mb-2">
          <h4 className="text-sm font-medium mb-1">Solid Colors</h4>
          <div className="grid grid-cols-5 gap-1">
            {colors.map((color) => (
              <Button
                key={color.value}
                className={`${buttonStyle} p-0 rounded-md border border-gray-200 dark:border-gray-700 relative`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorSelect(color.value)}
                title={color.name}
              >
                {selectedColor === color.value && (
                  <Check className="h-3 w-3 text-white absolute inset-0 m-auto" />
                )}
              </Button>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColorPicker;
