# Regex2DFA Visualizer

## Overview
A web application that converts Regular Expressions into Deterministic Finite Automata (DFA) with beautiful visualizations. Users can input regex patterns and see the corresponding syntax tree, DFA transition table, and state diagram.

## Project Architecture

### Frontend (client/)
- **React + TypeScript** with Vite
- **TailwindCSS** for styling with dark glassmorphism theme
- **Shadcn UI** components
- **Tanstack Query** for API state management

### Backend (server/)
- **Express.js** server
- TypeScript implementation of regex-to-DFA algorithm
- Ported from Python (SyntaxTree, Automata classes)

## Key Features
1. **Regex Input Panel**: Large monospace input with example presets
2. **Syntax Tree Visualization**: Animated SVG tree with nodes and edges
3. **DFA Table View**: Clean transition table with state badges
4. **DFA Graph View**: State diagram with directed transitions
5. **Error Handling**: User-friendly error messages
6. **Toast Notifications**: Status feedback during conversion

## API Endpoints
- `POST /api/convert` - Convert regex to DFA
  - Body: `{ "regex": string }`
  - Returns: `{ regex, syntaxTree, dfa, explanation }`

## Regex Syntax
- `+` - OR operation (union)
- `.` - Concatenation (explicit)
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
- Initial implementation with full frontend components
- Backend regex-to-DFA algorithm ported from Python
- Dark glassmorphism theme with cyan/purple accent colors
