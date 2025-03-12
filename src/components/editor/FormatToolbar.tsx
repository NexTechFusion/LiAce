
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import CoreFormatTools from "./toolbar/CoreFormatTools";
import HeadingTools from "./toolbar/HeadingTools";
import ListTools from "./toolbar/ListTools";
import InsertTools from "./toolbar/InsertTools";
import AlignmentTools from "./toolbar/AlignmentTools";
import MobileFormatDropdown from "./toolbar/MobileFormatDropdown";
import ExportButton from "./toolbar/ExportButton";

interface FormatToolbarProps {
  onFormatClick: (command: string, value?: string) => void;
  currentFontSize: string;
  isMobile?: boolean;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormatToolbar: React.FC<FormatToolbarProps> = ({
  onFormatClick,
  currentFontSize = "11px",
  isMobile = false,
}) => {
  const handleImageButtonClick = () => {
    // Trigger the hidden file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-1 overflow-x-auto">
      <div className="flex items-center space-x-1 flex-wrap">
        <CoreFormatTools
          onFormatClick={onFormatClick}
          currentFontSize={currentFontSize}
          isMobile={isMobile}
        />

        {/* Show extended tools on larger screens, hide on mobile */}
        {!isMobile ? (
          <>
            <HeadingTools onFormatClick={onFormatClick} />
            <ListTools onFormatClick={onFormatClick} />
            <InsertTools
              onFormatClick={onFormatClick}
              onImageButtonClick={handleImageButtonClick}
            />
            <AlignmentTools onFormatClick={onFormatClick} />
            <Separator orientation="vertical" className="mx-1 h-6" />
            <ExportButton />
          </>
        ) : (
          <MobileFormatDropdown
            onFormatClick={onFormatClick}
            onImageButtonClick={handleImageButtonClick}
          />
        )}
      </div>
    </div>
  );
};

export default FormatToolbar;
