
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile";
import {
  useSidebar
} from "@/contexts/SidebarContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal } from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { isMobile } = useMobile();
  const {
    pages,
    addPage,
    deletePage,
    updatePageLabel,
    selectedPageId,
    setSelectedPageId,
  } = useSidebar();

  const handleAddPage = () => {
    const newPage = addPage("Untitled Page");
    setSelectedPageId(newPage.id);
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-secondary/50 text-secondary-foreground",
        "w-80 border-r-2",
        className
      )}
    >
      <div className="flex-1 space-y-2 p-4 pt-6">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Pages</h4>
          <Button variant="ghost" size="sm" onClick={handleAddPage}>
            Add Page
          </Button>
        </div>
        <Separator />
        <Accordion type="single" collapsible className="w-full">
          {pages.map((page) => (
            <AccordionItem
              key={page.id}
              value={page.id}
              onClick={() => setSelectedPageId(page.id)}
            >
              <AccordionTrigger className="flex justify-between">
                <Textarea
                  value={page.label}
                  onChange={(e) => updatePageLabel(page.id, e.target.value)}
                  className="resize-none border-none focus-visible:ring-0 focus-visible:ring-transparent"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(page.id);
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </AccordionTrigger>
              <AccordionContent>
                {page.content}
                {page.date.toDateString()}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Sidebar;
