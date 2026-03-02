import { useEffect, useState, useRef, useCallback } from "react";
import type { EpsilonNFA } from "@shared/schema";

interface DFAGraphViewProps {
  epsilonNFA: EpsilonNFA | null;
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

export function DFAGraphView({ epsilonNFA }: DFAGraphViewProps) {
  const [statePositions, setStatePositions] = useState<StatePosition[]>([]);
  const [edges, setEdges] = useState<TransitionEdge[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const layoutGraph = useCallback(() => {
    if (!epsilonNFA) return;

    const numStates = epsilonNFA.states.length;
    const positions: StatePosition[] = [];

    const layers = computeLayers(epsilonNFA);
    const maxLayer = Math.max(...Array.from(layers.values()), 0);

    const layerGroups: Map<number, number[]> = new Map();
    for (const [stateId, layer] of layers) {
      if (!layerGroups.has(layer)) layerGroups.set(layer, []);
      layerGroups.get(layer)!.push(stateId);
    }

    const xSpacing = 110;
    const ySpacing = 100;
    const startX = 80;
    const startY = 80;

    for (const [layer, statesInLayer] of layerGroups) {
      const totalHeight = (statesInLayer.length - 1) * ySpacing;
      const baseY = startY + (numStates > 6 ? 0 : 60) - totalHeight / 2 + 100;
      
      statesInLayer.forEach((stateId, idx) => {
        const x = startX + layer * xSpacing;
        const y = baseY + idx * ySpacing;

        positions.push({
          id: stateId,
          x,
          y,
          isStart: stateId === epsilonNFA.startState,
          isFinal: epsilonNFA.finalStates.includes(stateId),
        });
      });
    }

    setStatePositions(positions);

    const transitionMap = new Map<string, string[]>();
    for (const t of epsilonNFA.transitions) {
      const key = `${t.from}-${t.to}`;
      if (!transitionMap.has(key)) transitionMap.set(key, []);
      transitionMap.get(key)!.push(t.label);
    }

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
  }, [epsilonNFA]);

  useEffect(() => {
    layoutGraph();
  }, [layoutGraph]);

  if (!epsilonNFA) {
    return (
      <div 
        className="flex items-center justify-center h-full text-muted-foreground"
        data-testid="dfa-graph-empty"
      >
        <p className="text-center">
          Enter a regex and click Convert to see the ε-NFA state diagram
        </p>
      </div>
    );
  }

  const getStatePosition = (stateId: number) => {
    return statePositions.find((s) => s.id === stateId);
  };

  const nodeRadius = 26;
  const padding = 100;
  const maxX = Math.max(...statePositions.map((s) => s.x), 400) + padding;
  const maxY = Math.max(...statePositions.map((s) => s.y), 300) + padding;
  const minY = Math.min(...statePositions.map((s) => s.y), 0) - 60;
  const svgHeight = maxY - minY;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-auto p-4"
      data-testid="dfa-graph-container"
    >
      <svg 
        width={maxX} 
        height={svgHeight}
        viewBox={`0 ${minY} ${maxX} ${svgHeight}`}
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
            id="arrowhead-epsilon"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(270 60% 55%)"
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

          const isEpsilon = edge.labels.every(l => l === "ε");
          const strokeColor = isEpsilon ? "hsl(270 60% 55%)" : "hsl(185 85% 50%)";
          const textColor = isEpsilon ? "hsl(270 60% 70%)" : "hsl(185 85% 60%)";
          const markerId = isEpsilon ? "arrowhead-epsilon" : "arrowhead";

          if (edge.isSelfLoop) {
            const loopRadius = 20;
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
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead-loop)"
                />
                <text
                  x={controlX}
                  y={controlY - 6}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="11"
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
          
          if (dist === 0) return null;

          const hasReverse = edges.some(
            (e) => e.from === edge.to && e.to === edge.from && !e.isSelfLoop
          );

          const edgesBetweenSamePair = edges.filter(
            (e) =>
              ((e.from === edge.from && e.to === edge.to) ||
                (e.from === edge.to && e.to === edge.from)) &&
              !e.isSelfLoop
          );
          const pairIndex = edgesBetweenSamePair.indexOf(edge);
          
          const offsetMultiplier = hasReverse ? 0.15 : 0;
          const perpX = (-dy / dist) * offsetMultiplier * 50;
          const perpY = (dx / dist) * offsetMultiplier * 50;
          
          const startX = fromState.x + (dx / dist) * nodeRadius + perpX;
          const startY = fromState.y + (dy / dist) * nodeRadius + perpY;
          const endX = toState.x - (dx / dist) * nodeRadius + perpX;
          const endY = toState.y - (dy / dist) * nodeRadius + perpY;

          const isBackEdge = dx < 0;

          if (isBackEdge) {
            const curveStrength = Math.abs(dy) < 30 ? 60 : 40;
            const cpX = (fromState.x + toState.x) / 2;
            const cpY = Math.min(fromState.y, toState.y) - curveStrength - Math.abs(dx) * 0.15;
            
            const midT = 0.5;
            const labelX = (1 - midT) * (1 - midT) * startX + 2 * (1 - midT) * midT * cpX + midT * midT * endX;
            const labelY = (1 - midT) * (1 - midT) * startY + 2 * (1 - midT) * midT * cpY + midT * midT * endY;

            return (
              <g key={`edge-${index}`} data-testid={`edge-${edge.from}-${edge.to}`}>
                <path
                  d={`M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  markerEnd={`url(#${markerId})`}
                />
                <text
                  x={labelX}
                  y={labelY - 6}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {edge.labels.join(", ")}
                </text>
              </g>
            );
          }
          
          const midX = (startX + endX) / 2 + perpX;
          const midY = (startY + endY) / 2 + perpY;

          return (
            <g key={`edge-${index}`} data-testid={`edge-${edge.from}-${edge.to}`}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={strokeColor}
                strokeWidth="1.5"
                markerEnd={`url(#${markerId})`}
              />
              <text
                x={midX}
                y={midY - 6}
                textAnchor="middle"
                fill={textColor}
                fontSize="11"
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
                  x1={state.x - nodeRadius - 30}
                  y1={state.y}
                  x2={state.x - nodeRadius - 4}
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
                r={nodeRadius + 4}
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
              y={state.y + 4}
              textAnchor="middle"
              fill="hsl(210 40% 98%)"
              fontSize="13"
              fontWeight="600"
              fontFamily="JetBrains Mono, monospace"
            >
              {state.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function computeLayers(nfa: EpsilonNFA): Map<number, number> {
  const layers = new Map<number, number>();
  const adj = new Map<number, number[]>();
  const backAdj = new Map<number, number[]>();
  
  for (const s of nfa.states) {
    adj.set(s, []);
    backAdj.set(s, []);
  }
  for (const t of nfa.transitions) {
    adj.get(t.from)?.push(t.to);
    backAdj.get(t.to)?.push(t.from);
  }

  for (const s of nfa.states) {
    layers.set(s, 0);
  }

  const longestDist = new Map<number, number>();
  const visited = new Set<number>();

  function dfs(state: number, depth: number, path: Set<number>): void {
    const currentDist = longestDist.get(state) ?? -1;
    if (depth > currentDist) {
      longestDist.set(state, depth);
    } else if (path.has(state)) {
      return;
    } else {
      return;
    }
    
    path.add(state);
    const neighbors = adj.get(state) || [];
    for (const neighbor of neighbors) {
      if (!path.has(neighbor)) {
        dfs(neighbor, depth + 1, path);
      }
    }
    path.delete(state);
  }

  dfs(nfa.startState, 0, new Set());

  for (const [state, dist] of longestDist) {
    layers.set(state, dist);
  }

  for (const s of nfa.states) {
    if (!longestDist.has(s)) {
      layers.set(s, 0);
    }
  }

  return layers;
}
