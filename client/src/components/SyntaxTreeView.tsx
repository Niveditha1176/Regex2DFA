import { useEffect, useState, useRef } from "react";
import type { SyntaxTree } from "@shared/schema";

interface SyntaxTreeViewProps {
  syntaxTree: SyntaxTree | null;
}

interface NodePosition {
  id: string;
  label: string;
  x: number;
  y: number;
  visible: boolean;
}

interface EdgePosition {
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  visible: boolean;
}

export function SyntaxTreeView({ syntaxTree }: SyntaxTreeViewProps) {
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [edgePositions, setEdgePositions] = useState<EdgePosition[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!syntaxTree || syntaxTree.nodes.length === 0) {
      setNodePositions([]);
      setEdgePositions([]);
      setVisibleCount(0);
      return;
    }

    const nodeRadius = 28;
    const horizontalSpacing = 80;
    const verticalSpacing = 70;

    const adjacencyMap = new Map<string, string[]>();
    syntaxTree.edges.forEach(edge => {
      if (!adjacencyMap.has(edge.from)) {
        adjacencyMap.set(edge.from, []);
      }
      adjacencyMap.get(edge.from)!.push(edge.to);
    });

    const parentMap = new Map<string, string>();
    syntaxTree.edges.forEach(edge => {
      parentMap.set(edge.to, edge.from);
    });

    const rootNode = syntaxTree.nodes.find(n => !parentMap.has(n.id));
    if (!rootNode) return;

    const levels = new Map<string, number>();
    const subtreeSizes = new Map<string, number>();

    function computeSubtreeSize(nodeId: string): number {
      const children = adjacencyMap.get(nodeId) || [];
      if (children.length === 0) {
        subtreeSizes.set(nodeId, 1);
        return 1;
      }
      const size = children.reduce((sum, child) => sum + computeSubtreeSize(child), 0);
      subtreeSizes.set(nodeId, size);
      return size;
    }

    function assignLevels(nodeId: string, level: number) {
      levels.set(nodeId, level);
      const children = adjacencyMap.get(nodeId) || [];
      children.forEach(child => assignLevels(child, level + 1));
    }

    computeSubtreeSize(rootNode.id);
    assignLevels(rootNode.id, 0);

    const positions = new Map<string, { x: number; y: number }>();
    
    function layoutNode(nodeId: string, leftBound: number): number {
      const level = levels.get(nodeId) || 0;
      const y = 50 + level * verticalSpacing;
      const children = adjacencyMap.get(nodeId) || [];
      
      if (children.length === 0) {
        positions.set(nodeId, { x: leftBound + horizontalSpacing / 2, y });
        return leftBound + horizontalSpacing;
      }
      
      let currentLeft = leftBound;
      const childXPositions: number[] = [];
      
      children.forEach(child => {
        const childSize = subtreeSizes.get(child) || 1;
        const childWidth = childSize * horizontalSpacing;
        layoutNode(child, currentLeft);
        const childPos = positions.get(child);
        if (childPos) {
          childXPositions.push(childPos.x);
        }
        currentLeft += childWidth;
      });
      
      const x = childXPositions.length > 0
        ? (childXPositions[0] + childXPositions[childXPositions.length - 1]) / 2
        : leftBound + horizontalSpacing / 2;
      
      positions.set(nodeId, { x, y });
      return currentLeft;
    }

    layoutNode(rootNode.id, 0);

    const newNodePositions: NodePosition[] = syntaxTree.nodes.map(node => {
      const pos = positions.get(node.id) || { x: 0, y: 0 };
      return {
        id: node.id,
        label: node.label,
        x: pos.x,
        y: pos.y,
        visible: false,
      };
    });

    const newEdgePositions: EdgePosition[] = syntaxTree.edges.map(edge => {
      const fromPos = positions.get(edge.from) || { x: 0, y: 0 };
      const toPos = positions.get(edge.to) || { x: 0, y: 0 };
      
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const offsetX = (dx / dist) * nodeRadius;
      const offsetY = (dy / dist) * nodeRadius;
      
      return {
        from: edge.from,
        to: edge.to,
        x1: fromPos.x + offsetX,
        y1: fromPos.y + offsetY,
        x2: toPos.x - offsetX,
        y2: toPos.y - offsetY,
        visible: false,
      };
    });

    setNodePositions(newNodePositions);
    setEdgePositions(newEdgePositions);
    setVisibleCount(0);

    const totalItems = newNodePositions.length + newEdgePositions.length;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= totalItems) {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [syntaxTree]);

  if (!syntaxTree || syntaxTree.nodes.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-full text-muted-foreground"
        data-testid="syntax-tree-empty"
      >
        <p className="text-center">
          Enter a regex and click Convert to see the syntax tree
        </p>
      </div>
    );
  }

  const maxX = Math.max(...nodePositions.map(n => n.x), 200) + 60;
  const maxY = Math.max(...nodePositions.map(n => n.y), 200) + 60;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-auto p-4"
      data-testid="syntax-tree-container"
    >
      <svg 
        width={maxX} 
        height={maxY}
        className="min-w-full"
        data-testid="syntax-tree-svg"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(185 85% 50%)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="hsl(270 60% 55%)" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(185 85% 50%)" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="hsl(270 60% 55%)" stopOpacity="0.6"/>
          </linearGradient>
        </defs>

        {edgePositions.map((edge, index) => {
          const isVisible = index < visibleCount - nodePositions.length;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="url(#edgeGradient)"
                strokeWidth="2"
                className={`transition-all duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
                data-testid={`edge-${edge.from}-${edge.to}`}
              />
            </g>
          );
        })}

        {nodePositions.map((node, index) => {
          const isVisible = index < visibleCount;
          return (
            <g 
              key={node.id}
              className={`transition-all duration-300 ${isVisible ? "opacity-100" : "opacity-0 scale-0"}`}
              style={{ 
                transformOrigin: `${node.x}px ${node.y}px`,
                transform: isVisible ? "scale(1)" : "scale(0)",
              }}
              data-testid={`node-${node.id}`}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r="28"
                fill="url(#nodeGradient)"
                stroke="hsl(185 85% 50%)"
                strokeWidth="2"
                filter="url(#glow)"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r="24"
                fill="hsl(230 25% 12%)"
                stroke="hsl(185 85% 50% / 0.3)"
                strokeWidth="1"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="hsl(210 40% 98%)"
                fontSize="14"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
