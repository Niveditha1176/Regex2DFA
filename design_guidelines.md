# Regex2DFA Visualizer - Design Guidelines

## Design Approach
**System**: Custom dark theme design with glassmorphism aesthetic, inspired by modern developer tools like Linear and Vercel's design language.

**Core Principle**: Create a sophisticated, visually striking developer tool that makes complex algorithmic concepts beautiful and accessible through thoughtful visualization.

## Typography
- **Headings**: Sans-serif, bold weights (600-700) for titles
- **Body Text**: Sans-serif, regular weight (400-500) 
- **Code/Regex Input**: Monospace font family for all regex and technical content
- **Hierarchy**: Large title (2.5xl), section headers (xl-2xl), body text (base-lg)

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 for consistent rhythm (p-2, p-4, p-6, p-8, gap-4, gap-6)

**Two-Column Layout** (Desktop):
- Left Panel: 40% width, fixed/sticky positioning
- Right Panel: 60% width, scrollable content area
- Stack vertically on mobile (< 768px)

**Container Strategy**:
- Max-width: 7xl for overall app container
- Generous internal padding (p-6 to p-8)
- Responsive breakpoints at md (768px) and lg (1024px)

## Component Library

### Navigation/Header
- Compact top bar with app title and branding
- Small "Reset" button in top-right corner
- Minimal height to maximize workspace

### Input Panel (Left)
- **Title Section**: Large heading with descriptive subtitle
- **Regex Input**: 
  - Large textarea with monospace font
  - Generous padding (p-4)
  - Glassmorphism background effect
  - Rounded corners (rounded-xl)
- **Action Buttons**:
  - Primary "Convert" button (prominent, larger size)
  - Secondary "Clear" button (subtle, smaller)
  - Example dropdown with 4 preset patterns
  - Horizontal layout with gap-3
- **Error Display**: Card with red accent, appears below buttons when needed
- **Explanation Section**: 
  - Numbered list styling
  - Appears below input area
  - Semi-transparent background panel

### Visualization Panel (Right)
- **Tab Navigation**:
  - Three tabs: "Syntax Tree", "DFA Table", "DFA Graph"
  - Active tab indicator with accent underline
  - Smooth transition animations
  - Horizontal layout with even spacing

- **Syntax Tree View**:
  - Node-edge diagram with circles and connecting lines
  - Animated entrance (fade + scale)
  - Nodes labeled with operators/characters
  - SVG-based or React Flow implementation
  
- **DFA Table View**:
  - Clean data table with header row
  - Columns: State | Alphabet symbols | Status
  - Badge indicators for Start State and Final States
  - Alternating row backgrounds for readability
  - Responsive horizontal scroll on small screens

- **DFA Graph View**:
  - State diagram with circular nodes
  - Directed edges with labeled transitions
  - Final states indicated by double-circle or thicker border
  - Start state with incoming arrow indicator
  - React Flow for automatic layout

### UI Elements
- **Glassmorphism Cards**: Semi-transparent backgrounds (bg-opacity-10 to 20), backdrop blur effect
- **Shadows**: Soft, subtle shadows (shadow-lg, shadow-xl)
- **Borders**: Rounded corners throughout (rounded-lg, rounded-xl)
- **Badges**: Pill-shaped with contrasting backgrounds for state indicators
- **Loading Spinner**: Centered, animated, appears during API calls
- **Toast Messages**: Bottom-right positioning, auto-dismiss, status-based styling

## Visual Treatment
- **Background**: Deep dark base with subtle gradient
- **Panels**: Glassmorphism with slight transparency and blur
- **Accents**: Cyan for primary actions, purple for highlights
- **Text**: High contrast white/light gray on dark backgrounds
- **Borders**: Subtle, semi-transparent borders on cards/inputs

## Animations
- **Button Hovers**: Subtle scale and brightness increase
- **Tab Transitions**: Smooth content fade-in/out
- **Syntax Tree Nodes**: Sequential fade + scale entrance
- **Toast Messages**: Slide-in from bottom-right
- Keep animations smooth but quick (200-300ms duration)

## Accessibility
- High contrast text (WCAG AA minimum)
- Focus states on all interactive elements
- Keyboard navigation support for tabs and buttons
- ARIA labels for state badges and visualizations
- Responsive design for all viewport sizes

## Images
**No hero images** - This is a utility application focused on visualization output rather than marketing. The visual interest comes from the generated diagrams and graphs, not static imagery.