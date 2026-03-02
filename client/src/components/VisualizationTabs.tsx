import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { SyntaxTreeView } from "./SyntaxTreeView";
import { DFATableView } from "./DFATableView";
import { DFAGraphView } from "./DFAGraphView";
import { Loader } from "./Loader";
import type { ConversionResult } from "@shared/schema";
import { GitBranch, Table, Workflow } from "lucide-react";

interface VisualizationTabsProps {
  result: ConversionResult | null;
  isLoading: boolean;
}

export function VisualizationTabs({ result, isLoading }: VisualizationTabsProps) {
  return (
    <Card 
      className="h-full flex flex-col bg-card/50 backdrop-blur-md border-border/50 shadow-xl overflow-hidden"
      data-testid="card-visualization"
    >
      <Tabs defaultValue="syntax-tree" className="flex flex-col h-full">
        <div className="border-b border-border/50 px-4 pt-4">
          <TabsList 
            className="bg-muted/30 border border-border/30 p-1"
            data-testid="tabs-list"
          >
            <TabsTrigger 
              value="syntax-tree"
              className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
              data-testid="tab-syntax-tree"
            >
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Syntax Tree</span>
              <span className="sm:hidden">Tree</span>
            </TabsTrigger>
            <TabsTrigger 
              value="nfa-table"
              className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
              data-testid="tab-nfa-table"
            >
              <Table className="h-4 w-4" />
              <span className="hidden sm:inline">ε-NFA Table</span>
              <span className="sm:hidden">Table</span>
            </TabsTrigger>
            <TabsTrigger 
              value="nfa-graph"
              className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
              data-testid="tab-nfa-graph"
            >
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">ε-NFA Graph</span>
              <span className="sm:hidden">Graph</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <Loader size="lg" text="Converting..." />
            </div>
          )}

          <TabsContent 
            value="syntax-tree" 
            className="h-full m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300"
            data-testid="content-syntax-tree"
          >
            <SyntaxTreeView syntaxTree={result?.syntaxTree || null} />
          </TabsContent>

          <TabsContent 
            value="nfa-table" 
            className="h-full m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300"
            data-testid="content-nfa-table"
          >
            <DFATableView epsilonNFA={result?.epsilonNFA || null} />
          </TabsContent>

          <TabsContent 
            value="nfa-graph" 
            className="h-full m-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300"
            data-testid="content-nfa-graph"
          >
            <DFAGraphView epsilonNFA={result?.epsilonNFA || null} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
