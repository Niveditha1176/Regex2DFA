import { useEffect, useState, useRef, useCallback } from "react";
import type { DFA } from "@shared/schema";

interface DFAGraphViewProps {
  dfa: DFA | null;
}

interface StatePosition {
  id: number;
  x: number;
  y: number;
  isStart: boolean;
  isFinal: boolean;
}

interface TransitionEdge {
  from: number;
  to: number;
  labels: string[];
  isSelfLoop: boolean;
}

export function DFAGraphView({ dfa }: DFAGraphViewProps) {
  const [statePositions, setStatePositions] = useState<StatePosition[]>([]);
  const [edges, setEdges] = useState<TransitionEdge[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const layoutGraph = useCallback(() => {
    if (!dfa) return;

    const numStates = dfa.transitions.length;
    const positions: StatePosition[] = [];
    
    const centerX = 300;
    const centerY = 200;
    const radius = Math.max(120, numStates * 30);

    dfa.transitions.forEach((transition, index) => {
      const angle = (2 * Math.PI * index) / numStates - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      positions.push({
        id: transition.state,
        x,
        y,
        isStart: transition.state === dfa.startState,
        isFinal: dfa.finalStates.includes(transition.state),
      });
    });

    setStatePositions(positions);

    const transitionMap = new Map<string, string[]>();
    
    dfa.transitions.forEach((transition) => {
      Object.entries(transition.transitions).forEach(([symbol, targetState]) => {
        if (targetState !== null && targetState !== undefined) {
          const key = `${transition.state}-${targetState}`;
          if (!transitionMap.has(key)) {
            transitionMap.set(key, []);
          }
          transitionMap.get(key)!.push(symbol);
        }
      });
    });

    const newEdges: TransitionEdge[] = [];
    transitionMap.forEach((labels, key) => {
      const [from, to] = key.split("-").map(Number);
      newEdges.push({
        from,
        to,
        labels,
        isSelfLoop: from === to,
      });
    });

    setEdges(newEdges);
  }, [dfa]);

  useEffect(() => {
    layoutGraph();
  }, [layoutGraph]);

  if (!dfa) {
    return (
      <div 
        className="flex items-center justify-center h-full text-muted-foreground"
        data-testid="dfa-graph-empty"
      >
        <p className="text-center">
          Enter a regex and click Convert to see the DFA state diagram
        </p>
      </div>
    );
  }

  const getStatePosition = (stateId: number) => {
    return statePositions.find((s) => s.id === stateId);
  };

  const nodeRadius = 32;
  const maxX = Math.max(...statePositions.map((s) => s.x), 400) + 100;
  const maxY = Math.max(...statePositions.map((s) => s.y), 300) + 100;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-auto p-4"
      data-testid="dfa-graph-container"
    >
      <svg 
        width={maxX} 
        height={maxY}
        className="min-w-full"
        data-testid="dfa-graph-svg"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(185 85% 50%)"
            />
          </marker>
          <marker
            id="arrowhead-loop"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill="hsl(270 60% 55%)"
            />
          </marker>
          <filter id="stateGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="stateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(230 25% 14%)" />
            <stop offset="100%" stopColor="hsl(230 25% 10%)" />
          </linearGradient>
        </defs>

        {edges.map((edge, index) => {
          const fromState = getStatePosition(edge.from);
          const toState = getStatePosition(edge.to);
          
          if (!fromState || !toState) return null;

          if (edge.isSelfLoop) {
            const loopRadius = 25;
            const startAngle = -Math.PI / 4;
            const endAngle = -3 * Math.PI / 4;
            
            const startX = fromState.x + nodeRadius * Math.cos(startAngle);
            const startY = fromState.y + nodeRadius * Math.sin(startAngle);
            const endX = fromState.x + nodeRadius * Math.cos(endAngle);
            const endY = fromState.y + nodeRadius * Math.sin(endAngle);
            
            const controlX = fromState.x;
            const controlY = fromState.y - nodeRadius - loopRadius * 2;

            return (
              <g key={`edge-${index}`} data-testid={`edge-${edge.from}-${edge.to}`}>
                <path
                  d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                  fill="none"
                  stroke="hsl(270 60% 55%)"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead-loop)"
                />
                <text
                  x={controlX}
                  y={controlY - 8}
                  textAnchor="middle"
                  fill="hsl(270 60% 70%)"
                  fontSize="12"
                  fontWeight="500"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {edge.labels.join(", ")}
                </text>
              </g>
            );
          }

          const dx = toState.x - fromState.x;
          const dy = toState.y - fromState.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const hasReverse = edges.some(
            (e) => e.from === edge.to && e.to === edge.from && !e.isSelfLoop
          );
          
          const offsetMultiplier = hasReverse ? 0.15 : 0;
          const perpX = -dy / dist * offsetMultiplier * 50;
          const perpY = dx / dist * offsetMultiplier * 50;
          
          const startX = fromState.x + (dx / dist) * nodeRadius + perpX;
          const startY = fromState.y + (dy / dist) * nodeRadius + perpY;
          const endX = toState.x - (dx / dist) * nodeRadius + perpX;
          const endY = toState.y - (dy / dist) * nodeRadius + perpY;
          
          const midX = (startX + endX) / 2 + perpX;
          const midY = (startY + endY) / 2 + perpY;

          return (
            <g key={`edge-${index}`} data-testid={`edge-${edge.from}-${edge.to}`}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="hsl(185 85% 50%)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <rect
                x={midX - edge.labels.join(", ").length * 4 - 6}
                y={midY - 10}
                width={edge.labels.join(", ").length * 8 + 12}
                height="20"
                rx="4"
                fill="hsl(230 25% 10% / 0.9)"
                stroke="hsl(185 85% 50% / 0.3)"
                strokeWidth="1"
              />
              <text
                x={midX}
                y={midY + 4}
                textAnchor="middle"
                fill="hsl(185 85% 60%)"
                fontSize="12"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                {edge.labels.join(", ")}
              </text>
            </g>
          );
        })}

        {statePositions.map((state) => (
          <g key={state.id} data-testid={`state-${state.id}`}>
            {state.isStart && (
              <g>
                <line
                  x1={state.x - nodeRadius - 35}
                  y1={state.y}
                  x2={state.x - nodeRadius - 5}
                  y2={state.y}
                  stroke="hsl(185 85% 50%)"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            )}
            
            {state.isFinal && (
              <circle
                cx={state.x}
                cy={state.y}
                r={nodeRadius + 5}
                fill="none"
                stroke="hsl(145 70% 55%)"
                strokeWidth="2"
                filter="url(#stateGlow)"
              />
            )}
            
            <circle
              cx={state.x}
              cy={state.y}
              r={nodeRadius}
              fill="url(#stateGradient)"
              stroke={state.isFinal ? "hsl(145 70% 55%)" : "hsl(185 85% 50%)"}
              strokeWidth="2"
              filter="url(#stateGlow)"
            />
            
            <text
              x={state.x}
              y={state.y + 5}
              textAnchor="middle"
              fill="hsl(210 40% 98%)"
              fontSize="14"
              fontWeight="600"
              fontFamily="JetBrains Mono, monospace"
            >
              q{state.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
