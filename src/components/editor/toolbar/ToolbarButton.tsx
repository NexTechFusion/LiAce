
import { Button } from "@/components/ui/button";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title?: string;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  onClick, 
  icon,
  title,
  disabled
}) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8"
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {icon}
    </Button>
  );
};

export default ToolbarButton;
