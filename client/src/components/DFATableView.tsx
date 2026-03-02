import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EpsilonNFA } from "@shared/schema";

interface DFATableViewProps {
  epsilonNFA: EpsilonNFA | null;
}

export function DFATableView({ epsilonNFA }: DFATableViewProps) {
  if (!epsilonNFA) {
    return (
      <div 
        className="flex items-center justify-center h-full text-muted-foreground"
        data-testid="dfa-table-empty"
      >
        <p className="text-center">
          Enter a regex and click Convert to see the ε-NFA transition table
        </p>
      </div>
    );
  }

  const columns = [...epsilonNFA.alphabet, "ε"];

  const transitionTable = new Map<number, Map<string, number[]>>();
  for (const state of epsilonNFA.states) {
    transitionTable.set(state, new Map());
    for (const col of columns) {
      transitionTable.get(state)!.set(col, []);
    }
  }

  for (const t of epsilonNFA.transitions) {
    const stateMap = transitionTable.get(t.from);
    if (stateMap) {
      const targets = stateMap.get(t.label) || [];
      targets.push(t.to);
      stateMap.set(t.label, targets);
    }
  }

  return (
    <div 
      className="w-full h-full overflow-auto p-4"
      data-testid="dfa-table-container"
    >
      <div className="rounded-lg border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 bg-muted/30">
              <TableHead className="font-semibold text-foreground/90 w-24">
                State
              </TableHead>
              {columns.map((symbol) => (
                <TableHead 
                  key={symbol} 
                  className="font-semibold text-foreground/90 text-center"
                >
                  <code className={`px-2 py-1 rounded font-mono ${
                    symbol === "ε" 
                      ? "bg-secondary/10 text-secondary" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    {symbol}
                  </code>
                </TableHead>
              ))}
              <TableHead className="font-semibold text-foreground/90 text-right">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {epsilonNFA.states.map((state, index) => {
              const isStart = state === epsilonNFA.startState;
              const isFinal = epsilonNFA.finalStates.includes(state);
              const stateTransitions = transitionTable.get(state)!;
              
              return (
                <TableRow 
                  key={state}
                  className={`border-border/30 transition-colors ${
                    index % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                  } hover:bg-muted/20`}
                  data-testid={`row-state-${state}`}
                >
                  <TableCell className="font-mono font-semibold">
                    <div className="flex items-center gap-2">
                      {isStart && (
                        <span className="text-primary text-lg">→</span>
                      )}
                      <span className={isStart ? "text-primary" : ""}>
                        {state}
                      </span>
                    </div>
                  </TableCell>
                  {columns.map((symbol) => {
                    const targets = stateTransitions.get(symbol) || [];
                    return (
                      <TableCell 
                        key={symbol}
                        className="text-center font-mono"
                      >
                        <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded text-foreground/80 ${
                          symbol === "ε" ? "bg-secondary/10" : "bg-muted/30"
                        }`}>
                          {targets.length > 0
                            ? `{${targets.sort((a, b) => a - b).join(", ")}}`
                            : "∅"
                          }
                        </span>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {isStart && (
                        <Badge 
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/30 font-medium"
                          data-testid={`badge-start-${state}`}
                        >
                          Start
                        </Badge>
                      )}
                      {isFinal && (
                        <Badge 
                          className="bg-green-500/20 text-green-400 border-green-500/30 font-medium"
                          data-testid={`badge-final-${state}`}
                        >
                          Final
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
