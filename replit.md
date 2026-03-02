# Regex2DFA Visualizer

## Overview
A web application that converts Regular Expressions into automata with beautiful visualizations. Users can input regex patterns and see the corresponding syntax tree, ε-NFA transition table, and ε-NFA state diagram (Thompson's construction), along with the internal DFA.

## Project Architecture

### Frontend (client/)
- **React + TypeScript** with Vite
- **TailwindCSS** for styling with dark glassmorphism theme
- **Shadcn UI** components
- **Tanstack Query** for API state management

### Backend (server/)
- **Express.js** server
- TypeScript implementation of regex-to-DFA algorithm (syntax tree + followpos)
- Thompson's construction for ε-NFA generation
- Ported from Python (SyntaxTree, Automata classes)

## Key Features
1. **Regex Input Panel**: Large monospace input with example presets
2. **Syntax Tree Visualization**: Animated SVG tree with nodes and edges
3. **ε-NFA Table View**: Transition table showing states, alphabet symbols, and epsilon transitions
4. **ε-NFA Graph View**: State diagram with directed transitions, epsilon edges (purple), symbol edges (cyan), start arrow, double-circle final states
5. **Error Handling**: User-friendly error messages with HTTP 400 for validation errors
6. **Toast Notifications**: Status feedback during conversion

## API Endpoints
- `POST /api/convert` - Convert regex to DFA and ε-NFA
  - Body: `{ "regex": string }`
  - Returns: `{ regex, syntaxTree, dfa, epsilonNFA, explanation }`

## Data Types (shared/schema.ts)
- **EpsilonNFA**: `{ states, startState, finalStates, alphabet, transitions: [{from, to, label}] }`
- **DFA**: `{ startState, finalStates, alphabet, transitions: [{state, transitions: {symbol: targetState}}] }`
- **SyntaxTree**: `{ nodes: [{id, label}], edges: [{from, to}] }`

## Regex Syntax
- `+` - OR operation (union)
- `.` - Concatenation (explicit, required)
- `*` - Kleene star (zero or more)
- `()` - Grouping

## Example Regexes
- `(a+b)*.a.b.b`
- `(a+b)*.a.(a+b)`
- `a*.b*`
- `a*+b*`

## Running the Project
The application runs on port 5000 with `npm run dev`.

## Recent Changes
- Added Thompson's construction algorithm for ε-NFA generation
- Updated graph view to show ε-NFA with epsilon transitions (purple) and symbol transitions (cyan)
- Updated table view with ε column showing epsilon transitions
- States labeled with plain numbers (not q-prefixed) in ε-NFA views
- Layered graph layout using longest-path algorithm for proper left-to-right flow
- Header icon changed to Workflow icon from lucide-react
