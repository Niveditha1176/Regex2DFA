import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Trash2, ChevronDown, AlertCircle } from "lucide-react";
import type { ConversionResult } from "@shared/schema";

const EXAMPLE_REGEXES = [
  { label: "(a+b)*.a.b.b", value: "(a+b)*.a.b.b" },
  { label: "(a+b)*.a.(a+b)", value: "(a+b)*.a.(a+b)" },
  { label: "a*.b*", value: "a*.b*" },
  { label: "a*+b*", value: "a*+b*" },
];

interface RegexInputPanelProps {
  onConvert: (regex: string) => void;
  isLoading: boolean;
  error: string | null;
  result: ConversionResult | null;
}

export function RegexInputPanel({
  onConvert,
  isLoading,
  error,
  result,
}: RegexInputPanelProps) {
  const [regex, setRegex] = useState("");

  const handleConvert = () => {
    if (regex.trim()) {
      onConvert(regex.trim());
    }
  };

  const handleClear = () => {
    setRegex("");
  };

  const handleExampleSelect = (value: string) => {
    setRegex(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && regex.trim()) {
      handleConvert();
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="space-y-2">
        <h1 
          className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent"
          data-testid="text-app-title"
        >
          Regex2DFA Visualizer
        </h1>
        <p 
          className="text-muted-foreground text-base"
          data-testid="text-app-subtitle"
        >
          Convert Regular Expressions into DFA with Visualizations
        </p>
      </div>

      <Card className="p-5 bg-card/50 backdrop-blur-md border-border/50 shadow-xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="regex-input" 
              className="text-sm font-medium text-foreground/80"
            >
              Regular Expression
            </label>
            <Textarea
              id="regex-input"
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter regex using + . * ( )"
              className="min-h-[100px] font-mono text-lg bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/50"
              data-testid="input-regex"
            />
            <p className="text-xs text-muted-foreground">
              Use <code className="px-1 py-0.5 rounded bg-muted/50 font-mono">+</code> for OR, 
              <code className="px-1 py-0.5 rounded bg-muted/50 font-mono mx-1">.</code> for concatenation, 
              <code className="px-1 py-0.5 rounded bg-muted/50 font-mono mx-1">*</code> for Kleene star
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleConvert}
              disabled={!regex.trim() || isLoading}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25"
              data-testid="button-convert"
            >
              <Play className="h-4 w-4" />
              Convert
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!regex}
              className="gap-2 border-border/50 hover:bg-muted/50"
              data-testid="button-clear"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>

            <Select onValueChange={handleExampleSelect}>
              <SelectTrigger 
                className="w-[200px] border-border/50 bg-background/60"
                data-testid="select-examples"
              >
                <SelectValue placeholder="Load example..." />
              </SelectTrigger>
              <SelectContent>
                {EXAMPLE_REGEXES.map((example) => (
                  <SelectItem 
                    key={example.value} 
                    value={example.value}
                    className="font-mono"
                    data-testid={`select-example-${example.value}`}
                  >
                    {example.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {error && (
        <Card 
          className="p-4 bg-destructive/10 border-destructive/30 backdrop-blur-sm"
          data-testid="card-error"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {result && result.explanation.length > 0 && (
        <Card 
          className="p-5 bg-card/50 backdrop-blur-md border-border/50 flex-1 overflow-auto"
          data-testid="card-explanation"
        >
          <h3 className="text-lg font-semibold mb-4 text-foreground/90">
            Conversion Steps
          </h3>
          <ol className="space-y-2">
            {result.explanation.map((step, index) => (
              <li 
                key={index}
                className="flex gap-3 text-sm"
                data-testid={`text-step-${index}`}
              >
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-medium shrink-0">
                  {index + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed pt-0.5">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
