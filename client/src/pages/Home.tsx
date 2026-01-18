import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { RegexInputPanel } from "@/components/RegexInputPanel";
import { VisualizationTabs } from "@/components/VisualizationTabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RotateCcw, Workflow } from "lucide-react";
import type { ConversionResult, ConvertRequest } from "@shared/schema";

export default function Home() {
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const convertMutation = useMutation({
    mutationFn: async (regex: string) => {
      const response = await apiRequest("POST", "/api/convert", {
        regex,
      } as ConvertRequest);
      return response.json() as Promise<ConversionResult>;
    },
    onMutate: () => {
      setError(null);
      toast({
        title: "Converting...",
        description: "Processing your regular expression",
      });
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Conversion complete",
        description: `Successfully converted "${data.regex}" to DFA`,
      });
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "An error occurred during conversion";
      setError(errorMessage);
      toast({
        title: "Invalid regex",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleConvert = (regex: string) => {
    convertMutation.mutate(regex);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      data-testid="page-home"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <header className="border-b border-border/30 bg-background/50 backdrop-blur-md sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Workflow className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg hidden sm:inline">Regex2DFA</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-2"
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-120px)]">
            <div className="lg:col-span-2">
              <RegexInputPanel
                onConvert={handleConvert}
                isLoading={convertMutation.isPending}
                error={error}
                result={result}
              />
            </div>
            
            <div className="lg:col-span-3 min-h-[500px]">
              <VisualizationTabs
                result={result}
                isLoading={convertMutation.isPending}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
