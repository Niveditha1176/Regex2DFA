# Regex2DFA Visualizer

A web application that converts Regular Expressions into automata with interactive visualizations. Input a regex pattern and instantly see the corresponding **Syntax Tree**, **ε-NFA Transition Table**, and **ε-NFA State Diagram** built using Thompson's Construction algorithm.

## Features

- **Regex Input Panel** — Large monospace input with clickable example presets
- **Syntax Tree** — Animated SVG tree showing the parsed structure of the regex
- **ε-NFA Transition Table** — Full transition table with alphabet symbols and epsilon (ε) column
- **ε-NFA State Diagram** — Directed graph with color-coded transitions:
  - Cyan edges for symbol transitions
  - Purple edges for epsilon (ε) transitions
  - Green double-circle for final/accepting states
  - Arrow marker for the start state
- **Validation** — Descriptive error messages for malformed regex patterns
- **Dark Theme** — Glassmorphism UI with cyan and purple accents

## Regex Syntax

This application uses a formal regex syntax where concatenation must be explicit:

| Operator | Symbol | Example       | Meaning                  |
|----------|--------|---------------|--------------------------|
| Union    | `+`    | `a+b`         | Match `a` or `b`         |
| Concat   | `.`    | `a.b`         | Match `a` followed by `b`|
| Kleene Star | `*` | `a*`          | Match zero or more `a`   |
| Grouping | `()`   | `(a+b)*`      | Group sub-expressions    |

### Example Patterns

| Regex              | Description                                  |
|--------------------|----------------------------------------------|
| `(a+b)*.a.b.b`    | Any string of a's and b's ending in `abb`    |
| `(a+b)*.a.(a+b)`  | Any string ending in `a` followed by `a` or `b` |
| `a*.b*`            | Zero or more a's followed by zero or more b's |
| `a*+b*`            | Zero or more a's or zero or more b's          |

## Algorithm

The conversion pipeline has three stages:

### 1. Tokenization and Parsing

The regex string is tokenized and converted from infix to postfix notation using the **Shunting-Yard algorithm** with the following operator precedence (highest to lowest):

1. `*` (Kleene star)
2. `.` (Concatenation)
3. `+` (Union)

### 2. Thompson's Construction (ε-NFA)

The postfix tokens are processed using a stack-based approach. Each token produces an NFA fragment with a single start and single accept state:

- **Symbol `a`**: Two states connected by a transition on `a`
- **Concatenation `.`**: Merges two fragments by connecting the first fragment's accept to the second fragment's start with an ε-transition
- **Union `+`**: Creates new start/accept states that branch to both sub-fragments via ε-transitions
- **Kleene Star `*`**: Creates new start/accept states with ε-transitions for looping and skipping

This produces an ε-NFA with exactly 2 new states per symbol and 2 new states per `*` or `+` operator, keeping the output linear in the size of the regex.

### 3. DFA Construction (Followpos Method)

A syntax tree is built and annotated with `nullable`, `firstpos`, `lastpos`, and `followpos` attributes. The DFA is then constructed from the followpos table using subset construction.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn UI, TanStack Query
- **Backend**: Express.js, TypeScript
- **Visualization**: SVG with custom graph layout (longest-path layering)

## API

### `POST /api/convert`

Converts a regex pattern to its automata representations.

**Request:**
```json
{
  "regex": "(a+b)*.a.b.b"
}
```

**Response:**
```json
{
  "regex": "(a+b)*.a.b.b",
  "syntaxTree": {
    "nodes": [{ "id": "node_0", "label": "." }, ...],
    "edges": [{ "from": "node_0", "to": "node_1" }, ...]
  },
  "epsilonNFA": {
    "states": [1, 2, 3, ...],
    "startState": 7,
    "finalStates": [14],
    "alphabet": ["a", "b"],
    "transitions": [
      { "from": 1, "to": 2, "label": "a" },
      { "from": 5, "to": 1, "label": "ε" },
      ...
    ]
  },
  "dfa": {
    "startState": 1,
    "finalStates": [4],
    "alphabet": ["a", "b"],
    "transitions": [
      { "state": 1, "transitions": { "a": 2, "b": 1 } },
      ...
    ]
  },
  "explanation": ["Input regex: (a+b)*.a.b.b", ...]
}
```

## Running

```bash
npm run dev
```

The application starts on port 5000 with both the Express backend and Vite frontend server.

## Project Structure

```
├── client/src/
│   ├── components/
│   │   ├── DFAGraphView.tsx      # ε-NFA state diagram (SVG)
│   │   ├── DFATableView.tsx      # ε-NFA transition table
│   │   ├── SyntaxTreeView.tsx    # Syntax tree visualization
│   │   ├── RegexInputPanel.tsx   # Input form with presets
│   │   ├── VisualizationTabs.tsx # Tab container
│   │   └── Loader.tsx            # Loading spinner
│   └── pages/
│       └── Home.tsx              # Main page
├── server/
│   ├── regex2dfa.ts              # Core algorithms (Thompson + DFA)
│   └── routes.ts                 # API endpoints
└── shared/
    └── schema.ts                 # Shared TypeScript types
```
## Running the Project
The application runs on port 5000 with npm run dev.
