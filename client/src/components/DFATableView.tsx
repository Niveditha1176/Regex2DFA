import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DFA } from "@shared/schema";

interface DFATableViewProps {
  dfa: DFA | null;
}

export function DFATableView({ dfa }: DFATableViewProps) {
  if (!dfa) {
    return (
      <div 
        className="flex items-center justify-center h-full text-muted-foreground"
        data-testid="dfa-table-empty"
      >
        <p className="text-center">
          Enter a regex and click Convert to see the DFA transition table
        </p>
      </div>
    );
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
              {dfa.alphabet.map((symbol) => (
                <TableHead 
                  key={symbol} 
                  className="font-semibold text-foreground/90 text-center"
                >
                  <code className="px-2 py-1 rounded bg-primary/10 text-primary font-mono">
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
            {dfa.transitions.map((transition, index) => {
              const isStart = transition.state === dfa.startState;
              const isFinal = dfa.finalStates.includes(transition.state);
              
              return (
                <TableRow 
                  key={transition.state}
                  className={`border-border/30 transition-colors ${
                    index % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                  } hover:bg-muted/20`}
                  data-testid={`row-state-${transition.state}`}
                >
                  <TableCell className="font-mono font-semibold">
                    <div className="flex items-center gap-2">
                      {isStart && (
                        <span className="text-primary text-lg">→</span>
                      )}
                      <span className={isStart ? "text-primary" : ""}>
                        q{transition.state}
                      </span>
                    </div>
                  </TableCell>
                  {dfa.alphabet.map((symbol) => (
                    <TableCell 
                      key={symbol}
                      className="text-center font-mono"
                    >
                      <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded bg-muted/30 text-foreground/80">
                        {transition.transitions[symbol] !== null && transition.transitions[symbol] !== undefined
                          ? `q${transition.transitions[symbol]}`
                          : "—"
                        }
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {isStart && (
                        <Badge 
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/30 font-medium"
                          data-testid={`badge-start-${transition.state}`}
                        >
                          Start
                        </Badge>
                      )}
                      {isFinal && (
                        <Badge 
                          className="bg-green-500/20 text-green-400 border-green-500/30 font-medium"
                          data-testid={`badge-final-${transition.state}`}
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
