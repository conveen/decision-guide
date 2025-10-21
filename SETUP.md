# Setup Instructions

## Prerequisites

You need to have Node.js (version 18 or higher) and npm installed on your system.

- Download Node.js from: https://nodejs.org/
- Verify installation: `node --version` and `npm --version`

## Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will open at `http://localhost:5173`

3. **Run tests** (optional):
   ```bash
   npm test
   ```

4. **Build for production** (optional):
   ```bash
   npm run build
   ```

   The built files will be in the `dist/` directory

## Troubleshooting

### Port already in use

If port 5173 is already in use, Vite will automatically try the next available port.

### Module not found errors

Make sure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

Make sure TypeScript is installed:
```bash
npm install -D typescript
```

## Development Tips

- The app uses hot module replacement (HMR) - changes will update automatically
- All data is stored in browser localStorage
- Clear localStorage in DevTools to reset all decisions
- Use browser DevTools Vue extension for debugging

## Project Files Overview

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `.eslintrc.cjs` - ESLint linting rules
- `.prettierrc.json` - Prettier formatting rules

### Core Application Files
- `src/main.ts` - Application entry point
- `src/App.vue` - Root component
- `src/router/index.ts` - Route definitions
- `src/stores/decisions.ts` - State management
- `src/types/index.ts` - TypeScript type definitions

### Views
- `src/views/Home.vue` - Home page with decision list
- `src/views/DecisionView.vue` - Individual decision page

### Components
- `src/components/DimensionsTab.vue` - Manage dimensions
- `src/components/ScenariosTab.vue` - Manage scenarios
- `src/components/ScoresTab.vue` - Enter scores
- `src/components/ResultsTab.vue` - View calculated results

### Utilities
- `src/utils/scoring.ts` - Scoring algorithms
- `src/utils/urlEncoding.ts` - URL encoding for sharing

### Tests
- `src/utils/__tests__/scoring.test.ts` - Unit tests for scoring functions

## Next Steps

After starting the dev server:

1. Create your first decision
2. Add dimensions (make sure weights sum to 1.0)
3. Add at least 2 scenarios
4. Fill in scores
5. Calculate and see the winner!
