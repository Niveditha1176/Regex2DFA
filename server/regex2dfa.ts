import type { SyntaxTree, SyntaxTreeNode, SyntaxTreeEdge, DFA, DFATransition, EpsilonNFA, NFATransition } from "@shared/schema";

interface TreeNode {
  id: number | null;
  type: "identifier" | "cat" | "or" | "star";
  label: string;
  leftChild: TreeNode | null;
  rightChild: TreeNode | null;
  nullable: boolean;
  firstpos: Set<number>;
  lastpos: Set<number>;
}


export function createTokenQueue(input: string): string[] {
  const tokens: string[] = [];
  let id = "";
  
  for (const c of input) {
    if (["(", ")", ".", "*", "+"].includes(c)) {
      if (id !== "") {
        tokens.push(id);
        id = "";
      }
      tokens.push(c);
    } else if (c !== " " && c !== "\n" && c !== "\t") {
      id = id + c;
    }
  }
  
  if (id !== "") {
    tokens.push(id);
  }
  
  return tokens;
}

export function createPostfixTokenQueue(tokens: string[]): string[] {
  const outputQueue: string[] = [];
  const stack: string[] = [];
  
  for (const token of tokens) {
    if (token === "(") {
      stack.push("(");
    } else if (token === ")") {
      while (stack.length > 0 && stack[stack.length - 1] !== "(") {
        outputQueue.push(stack.pop()!);
      }
      stack.pop();
    } else if (token === "*") {
      stack.push(token);
    } else if (token === ".") {
      while (stack.length > 0 && stack[stack.length - 1] === "*") {
        outputQueue.push(stack.pop()!);
      }
      stack.push(token);
    } else if (token === "+") {
      while (stack.length > 0 && (stack[stack.length - 1] === "*" || stack[stack.length - 1] === ".")) {
        outputQueue.push(stack.pop()!);
      }
      stack.push(token);
    } else {
      outputQueue.push(token);
    }
  }
  
  while (stack.length > 0) {
    outputQueue.push(stack.pop()!);
  }
  
  return outputQueue;
}

function extractAlphabet(tokens: string[]): string[] {
  const alphabet = new Set<string>();
  for (const token of tokens) {
    if (!["(", ")", ".", "*", "+", "#", "@"].includes(token)) {
      alphabet.add(token);
    }
  }
  return Array.from(alphabet).sort();
}

class SyntaxTreeBuilder {
  root: TreeNode;
  leaves: Map<number, string> = new Map();
  idCounter: number = 1;
  followpos: Map<number, Set<number>> = new Map();

  constructor(post: string[]) {
    this.root = this.createNode("cat", ".");
    this.createTree(post);
    this.initFollowpos();
    this.postorderAnnotate(this.root);
  }

  private createNode(
    type: TreeNode["type"],
    label: string,
    id: number | null = null,
    leftChild: TreeNode | null = null,
    rightChild: TreeNode | null = null
  ): TreeNode {
    return {
      id,
      type,
      label,
      leftChild,
      rightChild,
      nullable: false,
      firstpos: new Set(),
      lastpos: new Set(),
    };
  }

  private giveNextId(): number {
    return this.idCounter++;
  }

  private initFollowpos(): void {
    for (let i = 1; i < this.idCounter; i++) {
      this.followpos.set(i, new Set());
    }
  }

  private createTree(post: string[]): void {
    const stack: TreeNode[] = [];

    for (const token of post) {
      if (token === ".") {
        if (stack.length < 2) {
          throw new Error("Invalid regex: Missing operand for concatenation (.)");
        }
        const right = stack.pop()!;
        const left = stack.pop()!;
        const temp = this.createNode("cat", token, null, left, right);
        stack.push(temp);
      } else if (token === "+") {
        if (stack.length < 2) {
          throw new Error("Invalid regex: Missing operand for OR (+). The + operator requires expressions on both sides, e.g., 'a+b'");
        }
        const right = stack.pop()!;
        const left = stack.pop()!;
        const temp = this.createNode("or", token, null, left, right);
        stack.push(temp);
      } else if (token === "*") {
        if (stack.length < 1) {
          throw new Error("Invalid regex: Missing operand for Kleene star (*)");
        }
        const left = stack.pop()!;
        const temp = this.createNode("star", token, null, left);
        stack.push(temp);
      } else {
        const id = this.giveNextId();
        const temp = this.createNode("identifier", token, id);
        this.leaves.set(id, token);
        stack.push(temp);
      }
    }

    if (stack.length === 0) {
      throw new Error("Invalid regex: Empty expression");
    }

    const terminalId = this.giveNextId();
    const terminalNode = this.createNode("identifier", "#", terminalId);
    this.leaves.set(terminalId, "#");

    this.root.leftChild = stack.pop()!;
    this.root.rightChild = terminalNode;
  }

  private postorderAnnotate(node: TreeNode | null): void {
    if (!node) return;

    this.postorderAnnotate(node.leftChild);
    this.postorderAnnotate(node.rightChild);

    if (node.type === "identifier") {
      if (node.label === "@") {
        node.nullable = true;
      } else {
        node.firstpos.add(node.id!);
        node.lastpos.add(node.id!);
      }
    } else if (node.type === "or") {
      node.nullable = node.leftChild!.nullable || node.rightChild!.nullable;
      node.firstpos = new Set([...node.leftChild!.firstpos, ...node.rightChild!.firstpos]);
      node.lastpos = new Set([...node.leftChild!.lastpos, ...node.rightChild!.lastpos]);
    } else if (node.type === "star") {
      node.nullable = true;
      node.firstpos = new Set(node.leftChild!.firstpos);
      node.lastpos = new Set(node.leftChild!.lastpos);
      this.computeFollows(node);
    } else if (node.type === "cat") {
      node.nullable = node.leftChild!.nullable && node.rightChild!.nullable;
      
      if (node.leftChild!.nullable) {
        node.firstpos = new Set([...node.leftChild!.firstpos, ...node.rightChild!.firstpos]);
      } else {
        node.firstpos = new Set(node.leftChild!.firstpos);
      }
      
      if (node.rightChild!.nullable) {
        node.lastpos = new Set([...node.leftChild!.lastpos, ...node.rightChild!.lastpos]);
      } else {
        node.lastpos = new Set(node.rightChild!.lastpos);
      }
      
      this.computeFollows(node);
    }
  }

  private computeFollows(n: TreeNode): void {
    if (n.type === "cat") {
      for (const i of n.leftChild!.lastpos) {
        const current = this.followpos.get(i) || new Set();
        for (const j of n.rightChild!.firstpos) {
          current.add(j);
        }
        this.followpos.set(i, current);
      }
    } else if (n.type === "star") {
      for (const i of n.leftChild!.lastpos) {
        const current = this.followpos.get(i) || new Set();
        for (const j of n.leftChild!.firstpos) {
          current.add(j);
        }
        this.followpos.set(i, current);
      }
    }
  }

  toSyntaxTreeFormat(): SyntaxTree {
    const nodes: SyntaxTreeNode[] = [];
    const edges: SyntaxTreeEdge[] = [];
    let nodeId = 0;

    const traverse = (node: TreeNode | null, parentId: string | null): string | null => {
      if (!node) return null;

      const currentId = `node_${nodeId++}`;
      nodes.push({ id: currentId, label: node.label });

      if (parentId) {
        edges.push({ from: parentId, to: currentId });
      }

      traverse(node.leftChild, currentId);
      traverse(node.rightChild, currentId);

      return currentId;
    };

    traverse(this.root, null);

    return { nodes, edges };
  }
}

interface DFAState {
  idSet: Set<number>;
  id: number;
  transitionSets: Map<string, Set<number>>;
  isFinal: boolean;
}

class DFABuilder {
  states: DFAState[] = [];
  alphabet: string[];
  idCounter: number = 1;
  terminal: number;
  tree: SyntaxTreeBuilder;

  constructor(alphabet: string[], tree: SyntaxTreeBuilder) {
    this.alphabet = alphabet;
    this.tree = tree;
    this.terminal = tree.idCounter - 1;
    this.computeStates();
  }

  private giveNextId(): number {
    return this.idCounter++;
  }

  private setToString(s: Set<number>): string {
    return [...s].sort((a, b) => a - b).join(",");
  }

  private setsAreEqual(a: Set<number>, b: Set<number>): boolean {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }

  private findStateByIdSet(idSet: Set<number>): DFAState | undefined {
    return this.states.find(s => this.setsAreEqual(s.idSet, idSet));
  }

  private computeStates(): void {
    const startIdSet = new Set(this.tree.root.firstpos);
    const D1: DFAState = {
      idSet: startIdSet,
      id: this.giveNextId(),
      transitionSets: new Map(),
      isFinal: startIdSet.has(this.terminal),
    };
    
    this.states.push(D1);
    const unmarked: DFAState[] = [D1];
    const seenSets = new Set<string>([this.setToString(startIdSet)]);

    while (unmarked.length > 0) {
      const current = unmarked.shift()!;
      
      for (const symbol of this.alphabet) {
        const targetSet = new Set<number>();
        
        for (const pos of current.idSet) {
          if (pos === this.terminal) continue;
          
          const label = this.tree.leaves.get(pos);
          if (label === symbol) {
            const followposSet = this.tree.followpos.get(pos);
            if (followposSet) {
              for (const fp of followposSet) {
                targetSet.add(fp);
              }
            }
          }
        }
        
        current.transitionSets.set(symbol, new Set(targetSet));
        
        if (targetSet.size > 0) {
          const setKey = this.setToString(targetSet);
          if (!seenSets.has(setKey)) {
            seenSets.add(setKey);
            const newState: DFAState = {
              idSet: new Set(targetSet),
              id: this.giveNextId(),
              transitionSets: new Map(),
              isFinal: targetSet.has(this.terminal),
            };
            this.states.push(newState);
            unmarked.push(newState);
          }
        }
      }
    }
  }

  toDFAFormat(): DFA {
    const deadStateId = this.idCounter;
    let needsDeadState = false;

    const transitions: DFATransition[] = this.states.map(state => {
      const transitionObj: Record<string, number | null> = {};
      
      for (const symbol of this.alphabet) {
        const targetSet = state.transitionSets.get(symbol);
        
        if (!targetSet || targetSet.size === 0) {
          transitionObj[symbol] = deadStateId;
          needsDeadState = true;
        } else {
          const targetState = this.findStateByIdSet(targetSet);
          transitionObj[symbol] = targetState ? targetState.id : deadStateId;
          if (!targetState) {
            needsDeadState = true;
          }
        }
      }
      
      return {
        state: state.id,
        transitions: transitionObj,
      };
    });

    if (needsDeadState) {
      this.idCounter++;
      const deadTransitions: Record<string, number | null> = {};
      for (const symbol of this.alphabet) {
        deadTransitions[symbol] = deadStateId;
      }
      transitions.push({
        state: deadStateId,
        transitions: deadTransitions,
      });
    }

    const finalStates = this.states.filter(s => s.isFinal).map(s => s.id);

    return {
      startState: 1,
      finalStates,
      alphabet: this.alphabet,
      transitions,
    };
  }
}

interface ThompsonFragment {
  start: number;
  accept: number;
}

class ThompsonBuilder {
  stateCounter: number = 1;
  transitions: NFATransition[] = [];
  allStates: Set<number> = new Set();

  private newState(): number {
    const id = this.stateCounter++;
    this.allStates.add(id);
    return id;
  }

  private addTransition(from: number, to: number, label: string): void {
    this.transitions.push({ from, to, label });
  }

  buildFromPostfix(postfix: string[], alphabet: string[]): EpsilonNFA {
    const stack: ThompsonFragment[] = [];

    for (const token of postfix) {
      if (token === ".") {
        const right = stack.pop()!;
        const left = stack.pop()!;
        this.addTransition(left.accept, right.start, "ε");
        stack.push({ start: left.start, accept: right.accept });
      } else if (token === "+") {
        const right = stack.pop()!;
        const left = stack.pop()!;
        const start = this.newState();
        const accept = this.newState();
        this.addTransition(start, left.start, "ε");
        this.addTransition(start, right.start, "ε");
        this.addTransition(left.accept, accept, "ε");
        this.addTransition(right.accept, accept, "ε");
        stack.push({ start, accept });
      } else if (token === "*") {
        const inner = stack.pop()!;
        const start = this.newState();
        const accept = this.newState();
        this.addTransition(start, inner.start, "ε");
        this.addTransition(start, accept, "ε");
        this.addTransition(inner.accept, inner.start, "ε");
        this.addTransition(inner.accept, accept, "ε");
        stack.push({ start, accept });
      } else {
        const start = this.newState();
        const accept = this.newState();
        this.addTransition(start, accept, token);
        stack.push({ start, accept });
      }
    }

    const result = stack.pop()!;

    return {
      states: Array.from(this.allStates).sort((a, b) => a - b),
      startState: result.start,
      finalStates: [result.accept],
      alphabet,
      transitions: this.transitions,
    };
  }
}

export function convertRegexToDFA(regex: string): {
  syntaxTree: SyntaxTree;
  dfa: DFA;
  epsilonNFA: EpsilonNFA;
  explanation: string[];
} {
  const explanation: string[] = [];

  explanation.push(`Input regex: ${regex}`);

  const tokens = createTokenQueue(regex);
  explanation.push(`Tokenized: [${tokens.join(", ")}]`);

  const postfix = createPostfixTokenQueue(tokens);
  explanation.push(`Postfix notation: [${postfix.join(", ")}]`);

  const alphabet = extractAlphabet(tokens);
  explanation.push(`Alphabet: {${alphabet.join(", ")}}`);

  const tree = new SyntaxTreeBuilder(postfix);
  explanation.push(`Built syntax tree with ${tree.leaves.size} leaf nodes`);

  const syntaxTree = tree.toSyntaxTreeFormat();
  explanation.push(`Annotated tree with nullable, firstpos, lastpos, and followpos`);

  const thompsonBuilder = new ThompsonBuilder();
  const postfixForNFA = createPostfixTokenQueue(createTokenQueue(regex));
  const epsilonNFA = thompsonBuilder.buildFromPostfix(postfixForNFA, alphabet);
  explanation.push(`Built ε-NFA using Thompson's construction with ${epsilonNFA.states.length} states`);
  explanation.push(`ε-NFA start state: ${epsilonNFA.startState}`);
  explanation.push(`ε-NFA final state: ${epsilonNFA.finalStates.join(", ")}`);

  const dfaBuilder = new DFABuilder(alphabet, tree);
  const dfa = dfaBuilder.toDFAFormat();
  explanation.push(`Constructed DFA with ${dfa.transitions.length} states`);
  explanation.push(`Start state: q${dfa.startState}`);
  explanation.push(`Final states: {${dfa.finalStates.map(s => `q${s}`).join(", ")}}`);

  return { syntaxTree, dfa, epsilonNFA, explanation };
}

export function validateRegex(regex: string): string | null {
  if (!regex || regex.trim().length === 0) {
    return "Regular expression cannot be empty";
  }

  let parenCount = 0;
  for (const c of regex) {
    if (c === "(") parenCount++;
    if (c === ")") parenCount--;
    if (parenCount < 0) {
      return "Unmatched closing parenthesis";
    }
  }
  
  if (parenCount !== 0) {
    return "Unmatched opening parenthesis";
  }

  const invalidPatterns = [
    { pattern: /^\*/, message: "Regex cannot start with *" },
    { pattern: /^\+/, message: "Regex cannot start with +" },
    { pattern: /^\./, message: "Regex cannot start with ." },
    { pattern: /\(\)/, message: "Empty parentheses not allowed" },
    { pattern: /\*\*/, message: "Double * not allowed" },
    { pattern: /\.\*\*/, message: "Invalid pattern .**" },
    { pattern: /\+\*/, message: "Invalid pattern +*" },
    { pattern: /\.\+/, message: "Invalid pattern .+" },
    { pattern: /\+\./, message: "Invalid pattern +." },
    { pattern: /\(\*/, message: "Invalid pattern (*" },
    { pattern: /\(\+/, message: "Invalid pattern (+" },
    { pattern: /\(\./, message: "Invalid pattern (." },
    { pattern: /\.\)/, message: "Invalid pattern .)" },
    { pattern: /\+\)/, message: "Invalid pattern +)" },
  ];

  for (const { pattern, message } of invalidPatterns) {
    if (pattern.test(regex)) {
      return message;
    }
  }

  return null;
}
