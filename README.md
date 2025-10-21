# Decision Guide

A data-driven decision-making web application built with Vue 3, TypeScript, and Vuetify.

## Features

- **Create Decisions**: Define a decision with a title and description
- **Add Dimensions**: Create dimensions with custom weights, scales, and descriptions
- **Define Scenarios**: Add multiple scenarios to compare
- **Score & Calculate**: Input scores for each dimension and scenario, then calculate the optimal choice
- **Smart Results**: See the winning scenario with top contributing dimensions
- **Batch Weight Adjustment**: Distribute remaining weight equally across selected dimensions
- **Scenario Notes**: Add contextual notes to each scenario
- **Share Decisions**: Generate shareable URLs with full decision state
- **Import/Export**: Save and load decisions as JSON files
- **Duplicate Decisions**: Clone existing decisions as templates
- **Persistent Storage**: All decisions saved in browser localStorage
- **Client-Side Only**: No server required, everything runs in the browser

## Algorithm

The scoring algorithm follows these steps:

1. **Normalize scores**: For each dimension score `x`, calculate `z = (x - min) / (max - min)`
2. **Apply weights**: Multiply normalized score by dimension weight
3. **Sum weighted scores**: Add all weighted scores to get the scenario's total score
4. **Identify winner**: The scenario with the highest total score wins

## Installation

```bash
# Build the development container
# Make sure you have Docker installed
./run.sh build-base

# Install dependencies
./run.sh exec npm install

# Start development server
./run.sh dev

# Run tests (unit and UI)
./run.sh test

# Build for production
./run.sh build

# Preview production build
./run.sh preview

# Lint code
./run.sh lint

# Format code
./run.sh fmt
```

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **UI Library**: Vuetify 3 (Material Design)
- **State Management**: Pinia
- **Router**: Vue Router
- **Build Tool**: Vite
- **Testing**: Vitest
- **Linting**: ESLint
- **Formatting**: Prettier

## Project Structure

```
src/
├── components/        # Vue components (DimensionsTab, ScenariosTab, etc.)
├── stores/           # Pinia stores (decisions store)
├── types/            # TypeScript type definitions
├── utils/            # Utility functions (scoring, URL encoding)
├── views/            # Page components (Home, DecisionView)
├── router/           # Vue Router configuration
├── plugins/          # Plugin configurations (Vuetify)
└── main.ts           # Application entry point
```

## Usage

### Creating a Decision

1. Click "New Decision" on the home page
2. Enter a title and optional description
3. Navigate through the tabs to define your decision

### Adding Dimensions

1. Go to the "Dimensions" tab
2. Click "Add Dimension"
3. Set name, weight (0.0-1.0), and scale (min-max)
4. Ensure all weights sum to exactly 1.0

### Adding Scenarios

1. Go to the "Scenarios" tab
2. Click "Add Scenario"
3. Enter a name and optional notes
4. Add at least 2 scenarios to compare

### Entering Scores

1. Go to the "Scores" tab
2. Enter a score for each dimension and scenario
3. Scores must be within the dimension's scale

### Calculating Results

1. Go to the "Results" tab
2. Click "Calculate"
3. View the winning scenario and top contributing dimensions
4. Expand each scenario to see detailed breakdowns

### Sharing a Decision

1. Click the "Share" button on a decision page
2. Copy the generated URL
3. Anyone with the link can view and edit the decision

### Import/Export

- **Export**: Click "Export All" on the home page to download all decisions as JSON
- **Import**: Click "Import" and select a JSON file to load decisions

## License

Apache-2.0
