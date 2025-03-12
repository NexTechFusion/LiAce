
import React from "react";
import { Badge } from "@/components/ui/badge";

interface PageBreakIndicatorProps {
  pageBreaks: number[];
}

const PageBreakIndicator: React.FC<PageBreakIndicatorProps> = ({ pageBreaks }) => {
  return (
    <>
      {/* Page break indicators */}
      {pageBreaks.map((breakPoint, index) => (
        <div
          key={index}
          className="absolute left-0 right-0 flex items-center"
          style={{ top: `${breakPoint}px` }}
        >
          <div className="border-t-2 border-dotted border-gray-300 dark:border-gray-600 flex-grow"></div>
          <Badge variant="outline" className="mx-2 bg-white dark:bg-gray-800">Page {index + 2}</Badge>
          <div className="border-t-2 border-dotted border-gray-300 dark:border-gray-600 flex-grow"></div>
        </div>
      ))}
    </>
  );
};

export default PageBreakIndicator;
