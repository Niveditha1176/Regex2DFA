# Regex2DFA Visualizer (Regex → DFA with Visual Output)

A **full-stack web application** that converts a **Regular Expression (Regex)** into a **Deterministic Finite Automaton (DFA)** using the **Direct Regex → DFA construction (Syntax Tree + Followpos method)**.

This project is designed for **Theory of Computation** learning and evaluation, and provides a clean **UI-based visualization** instead of only terminal output.

---

## ✨ Features

- ✅ Enter a Regular Expression and convert it to DFA
- 🌙 Modern **Dark Theme UI**
- 🌳 **Syntax Tree Visualization** (nodes + edges)
- 📊 **DFA Transition Table**
- 🧠 Step-by-step **Explanation Panel**
- 🧩 **DFA Graph View** (state diagram)

---

## 📌 Supported Regex Operators

| Operator | Meaning |
|---------:|---------|
| `+` | Union / OR |
| `.` | Concatenation |
| `*` | Kleene Star (0 or more repetitions) |
| `( )` | Grouping |

> Alphabet symbols can be `a`, `b`, etc. (depending on your backend configuration).

---

## 🧠 Core Idea (How It Works)

This project uses the **Direct Regex → DFA** algorithm (also known as the **Syntax Tree Position / Followpos Method**):

### 1) Append End Marker `#`
A terminal symbol `#` is appended to the regex to clearly detect acceptance.

Example:
```
(a+b)*.a.(a+b)
```
becomes:
```
((a+b)*.a.(a+b)).#
```

### 2) Build a Syntax Tree
The regex is parsed into a tree:
- Internal nodes → operators (`+`, `.`, `*`)
- Leaf nodes → symbols (`a`, `b`, `#`)

### 3) Compute Tree Annotations
Each syntax-tree node is annotated with:

- **Nullable**: Can the subexpression generate ε (empty string)?
- **Firstpos**: Set of positions that can appear first
- **Lastpos**: Set of positions that can appear last
- **Followpos**: Positions that can follow a given position

### 4) Construct DFA States from Position Sets
- The DFA **start state** is `firstpos(root)`
- Each DFA state is a **set of positions**
- Transitions are computed using `followpos`

### 5) Final (Accepting) States
A DFA state is **final** if it contains the position of the `#` marker.

---

## 🧱 Tech Stack

### Frontend
- React
- TailwindCSS
- Node-edge visualizations (Syntax Tree + DFA Graph)

### Backend
- Python (Regex → DFA conversion logic)
- Flask API (`POST /api/convert`)

---

## 📂 Project Structure (Suggested)

```
Regex2DFA-Visualizer/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app.py
│   ├── regex2dfa.py
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

---

## 🚀 Run Locally

### 1) Clone the repository
```bash
git clone <https://github.com/Niveditha1176/Regex2DFA>
cd Regex2DFA-Visualizer
```

---

### 2) Backend Setup (Python)
```bash
cd backend
python -m venv .venv
```

Activate venv:

**Windows**
```bash
.venv\Scripts\activate
```

**macOS/Linux**
```bash
source .venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run backend:
```bash
python app.py
```

Backend should run at:
```
http://localhost:5000
```

---

### 3) Frontend Setup (React)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend should run at:
```
http://localhost:5173
```

---

## 🔌 API Contract

### `POST /api/convert`

**Request**
```json
{
  "regex": "(a+b)*.a.(a+b)"
}
```

**Response**
```json
{
  "regex": "(a+b)*.a.(a+b)",
  "syntaxTree": {
    "nodes": [{"id":"n1","label":"."}],
    "edges": [{"from":"n1","to":"n2"}]
  },
  "dfa": {
    "startState": "1",
    "finalStates": ["4"],
    "alphabet": ["a","b"],
    "transitions": [
      {"state":"1","a":"2","b":"3"},
      {"state":"2","a":"2","b":"4"}
    ]
  },
  "explanation": [
    "Parsed regex and built syntax tree",
    "Computed followpos sets",
    "Constructed DFA states and transitions",
    "Marked final states using end marker #"
  ]
}
```

---

## 🎓 Why This Project Matters

This tool demonstrates the same fundamental idea used in **lexical analysis (compiler design)**:
Regular expressions are converted into automata to efficiently recognize patterns.

---

## 📸 Demo
Live Demo (Replit):
- https://regex2dfa.replit.app/

---

## 🙌 Author
Built by **Niveditha Venkatesh**  
(Theory of Computation Mini Project)

---

## 📜 License
This project is for educational use.
