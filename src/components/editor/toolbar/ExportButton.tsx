
import { Download } from "lucide-react";
import ToolbarButton from "./ToolbarButton";
import { useExport } from "@/hooks/use-export";

const ExportButton = () => {
  const { exportToPDF, isExporting } = useExport();

  return (
    <ToolbarButton 
      onClick={exportToPDF}
      icon={<Download className="h-4 w-4" />}
      title="Export to PDF"
      disabled={isExporting}
    />
  );
};

export default ExportButton;
