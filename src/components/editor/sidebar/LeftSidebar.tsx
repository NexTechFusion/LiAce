
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen,
  History,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/hooks/use-sidebar";
import PagesList from "./PagesList";
import VersionsList from "./VersionsList";

interface LeftSidebarProps {
  isOpen: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen }) => {
  const { searchQuery, handleSearchChange } = useSidebar();
  
  if (!isOpen) return null;
  
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col animate-fade-in">
      <Tabs defaultValue="pages" className="flex-1 flex flex-col">
        <div className="px-3 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800">
          <TabsList className="grid grid-cols-2 h-8">
            <TabsTrigger value="pages" className="text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-xs">
              <History className="h-3.5 w-3.5 mr-1" />
              Versions
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        
        <TabsContent value="pages" className="flex-1 overflow-hidden">
          <PagesList searchQuery={searchQuery} />
        </TabsContent>
        
        <TabsContent value="versions" className="flex-1 overflow-hidden">
          <VersionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeftSidebar;
